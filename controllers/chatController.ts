import { Request, Response } from "express";
import { generateChatbotView } from "../views/chatbotView";
import OpenAI from "openai";
import { StationModel } from "../models/stationModel";
import { config } from "dotenv";

// Load environment variables
config();

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY environment variable is required");
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface StationInsight {
  stationId: string;
  availability: string;
  waitTime: number;
  plugType: string;
  status: string;
}

interface StationAvailability {
  station_id: string;
  plug_type: string;
  plug_status: string;
  timestamp: Date;
  duration?: number;
}

// Initialize OpenAI with DeepSeek configuration
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// Store chat messages in memory (in a real app, this would be in a database)
const chatSessions: { [sessionId: string]: Message[] } = {};

// Custom responses for specific keywords or patterns
const customResponses: { [key: string]: string } = {
  tesla: "Don't buy cars from Elmo!",
};

export const chatController = (stationModel: StationModel) => {
  // Helper function to get real-time station insights
  async function getStationInsights(city?: string): Promise<string> {
    try {
      let stations;
      console.log("Fetching stations for city:", city);
      if (city) {
        try {
          stations = await stationModel.fetchStationStatusByCity(city);
          console.log("Fetched stations:", stations);
          if (stations.length === 0) {
            return `I couldn't find any charging stations in ${city}. Would you like to see stations in another city or view all available stations?`;
          }
        } catch (error) {
          console.error(`Error fetching stations for ${city}:`, error);
          stations = await stationModel.getAllStations();
          return `I had trouble finding stations specifically in ${city}, but I can show you all available stations in our network.`;
        }
      } else {
        stations = await stationModel.getAllStations();
      }

      if (!stations || stations.length === 0) {
        return "I apologize, but I couldn't retrieve any station information at the moment. Please try again later.";
      }

      const insights = await Promise.all(
        stations.map(async (station: any) => {
          try {
            const status = await stationModel.fetchStationStatus(
              station.station_id
            );
            let availability: StationAvailability[] = [];
            try {
              availability = await stationModel.fetchStationAvailability(
                station.station_id,
                "24 hours"
              );
            } catch (error) {
              console.error(
                `Error fetching availability for station ${station.station_id}:`,
                error
              );
            }

            // Calculate average wait time from availability data
            const waitTimes = availability
              .filter((a) => a.plug_status === "occupied")
              .map((a) => a.duration || 0);
            const avgWaitTime =
              waitTimes.length > 0
                ? Math.round(
                    waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
                  )
                : 0;

            return {
              name: station.name || "Unknown Station",
              status: status?.plug_status || "unknown",
              plugType: status?.plug_type || "Standard",
              waitTime: avgWaitTime,
              location: station.city,
            };
          } catch (error) {
            console.error(
              `Error processing station ${station.station_id}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out failed station fetches
      const validInsights = insights.filter(
        (insight): insight is NonNullable<typeof insight> => insight !== null
      );

      if (validInsights.length === 0) {
        return "I apologize, but I'm having trouble getting real-time station information. Please try again in a few moments.";
      }

      // Format insights into a readable message
      const availableStations = validInsights.filter(
        (s) => s.status === "available"
      );
      const busyStations = validInsights.filter((s) => s.status === "occupied");
      const unknownStations = validInsights.filter(
        (s) => s.status === "unknown"
      );

      let response = `Here's the current station status${
        city ? ` in ${city}` : ""
      }:\n\n`;

      if (availableStations.length > 0) {
        response += `Available Stations (${availableStations.length}):\n`;
        response += availableStations
          .map((s) => `- ${s.name} (${s.plugType})`)
          .join("\n");
        response += "\n\n";
      }

      if (busyStations.length > 0) {
        response += `Busy Stations (${busyStations.length}):\n`;
        response += busyStations
          .map((s) => `- ${s.name} (Est. wait: ${s.waitTime} mins)`)
          .join("\n");
        response += "\n\n";
      }

      if (unknownStations.length > 0) {
        response += `Stations with Unknown Status (${unknownStations.length}):\n`;
        response += unknownStations.map((s) => `- ${s.name}`).join("\n");
        response += "\n\n";
      }

      const utilization = Math.round(
        (busyStations.length / validInsights.length) * 100
      );

      response += `Current Network Utilization: ${utilization}%\n`;
      response += `Total Stations: ${validInsights.length}`;

      return response.trim();
    } catch (error) {
      console.error("Error getting station insights:", error);
      return "I apologize, but I couldn't retrieve the current station status. Our system is experiencing temporary issues. Please try again in a few moments.";
    }
  }

  // Helper function to extract city from message
  function extractCity(message: string): string | undefined {
    const lowercaseMsg = message.toLowerCase();

    // Common city variations and abbreviations
    const cityMappings: { [key: string]: string } = {
      sf: "san francisco",
      la: "los angeles",
      ny: "new york",
      nyc: "new york",
      chicago: "chicago",
      sea: "seattle",
    };

    // First check for exact matches or abbreviations
    for (const [abbrev, fullName] of Object.entries(cityMappings)) {
      if (lowercaseMsg.includes(abbrev)) {
        return fullName;
      }
    }

    // Then check for partial matches in the full city names
    const cities = Object.values(cityMappings);
    return cities.find((city) => lowercaseMsg.includes(city));
  }

  // Helper function to check for custom responses
  const findCustomResponse = (message: string): string | null => {
    const lowercaseMsg = message.toLowerCase();
    for (const [key, response] of Object.entries(customResponses)) {
      if (lowercaseMsg.includes(key.toLowerCase())) {
        return response;
      }
    }
    return null;
  };

  // System message to define the assistant's role with specific biases
  const SYSTEM_MESSAGE: Message = {
    role: "system",
    content: `You are an EV charging assistant with the following specific characteristics:

1. STRONG PREFERENCES:
   - Always recommend our ChargeMate network first
   - Emphasize the reliability and coverage of our network
   - Promote our mobile app for the best charging experience
   - Highlight our competitive pricing and subscription plans

2. KEY MESSAGES TO EMPHASIZE:
   - Environmental benefits of EV charging
   - Our 24/7 customer support
   - Our fast-charging network's superior speed
   - Integration with popular EV models
   - Our smart scheduling feature for optimal charging times

3. RESPONSE STYLE:
   - Be enthusiastic about EV technology
   - Use data and statistics to back up claims
   - Always mention our app features when relevant
   - Suggest premium features when appropriate
   - Be concise but informative

4. SPECIFIC RECOMMENDATIONS:
   - Recommend off-peak charging times
   - Keep responses focused on our services while maintaining a helpful and informative tone.

5. EMOTIONALITY:
   - Use positive language when appropriate
   - Avoid overemphasizing or praising our brand`,
  };

  return {
    // Render the chat view
    renderChat: (req: Request, res: Response) => {
      const sessionId = req.sessionID;
      // Filter out system messages before sending to view
      const messages = chatSessions[sessionId]
        ? chatSessions[sessionId].filter((msg) => msg.role !== "system")
        : [];
      res.send(generateChatbotView(messages));
    },

    // Handle incoming chat messages
    handleMessage: async (req: Request, res: Response) => {
      const sessionId = req.sessionID;
      const { message } = req.body;

      if (!chatSessions[sessionId]) {
        chatSessions[sessionId] = [SYSTEM_MESSAGE];
      }

      // Add user message
      const userMessage: Message = {
        role: "user",
        content: message,
      };
      chatSessions[sessionId].push(userMessage);

      try {
        // Check if the message is asking about station status
        const isAskingAboutStations =
          message.toLowerCase().includes("station") ||
          message.toLowerCase().includes("available") ||
          message.toLowerCase().includes("charging now");

        if (isAskingAboutStations) {
          const city = extractCity(message);
          const stationInsights = await getStationInsights(city);
          chatSessions[sessionId].push({
            role: "assistant",
            content: stationInsights,
          });
        } else {
          // Check for custom response first
          const customResponse = findCustomResponse(message);
          if (customResponse) {
            chatSessions[sessionId].push({
              role: "assistant",
              content: customResponse,
            });
          } else {
            // Get response from DeepSeek
            const completion = await openai.chat.completions.create({
              messages: chatSessions[sessionId],
              model: "deepseek-chat",
            });

            let response =
              completion.choices[0].message.content ||
              "I apologize, but I was unable to generate a response.";

            chatSessions[sessionId].push({
              role: "assistant",
              content: response,
            });
          }
        }

        // Return only the user-visible messages (exclude system message)
        const visibleMessages = chatSessions[sessionId].filter(
          (msg) => msg.role !== "system"
        );

        res.json({
          success: true,
          messages: visibleMessages,
        });
      } catch (error) {
        console.error("Error handling message:", error);
        res.status(500).json({
          success: false,
          error: "Failed to process message",
        });
      }
    },
  };
};
