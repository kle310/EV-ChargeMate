import { wrapInLayout } from "./layout";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export const generateChatbotView = (messages: Message[] = []): string => {
  const chatStyles = `
    .chat-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      height: calc(100vh - 180px);
      display: flex;
      flex-direction: column;
    }
    .messages-container {
      flex-grow: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .message {
      display: flex;
      gap: 16px;
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .message:last-child {
      border-bottom: none;
    }
    .message.user {
      background-color: #f9f9f9;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }
    .user .avatar {
      background-color: #e9ecef;
      color: #495057;
    }
    .assistant .avatar {
      background-color: #10a37f;
      color: white;
    }
    .message-content {
      flex-grow: 1;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .user .message-content {
      color: #111;
    }
    .assistant .message-content {
      color: #353740;
    }
    .input-container {
      position: relative;
      margin: 0 auto;
      width: 100%;
      max-width: 860px;
      box-sizing: border-box;
    }
    .message-input {
      width: 100%;
      padding: 16px;
      padding-right: 50px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      font-size: 16px;
      line-height: 1.5;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      resize: none;
      min-height: 60px;
      max-height: 200px;
      background: white;
      box-sizing: border-box;
    }
    .send-button {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .send-button:hover {
      background-color: #f0f0f0;
    }
    .send-button svg {
      width: 20px;
      height: 20px;
      fill: #10a37f;
      transition: fill 0.2s ease;
    }
    .send-button:disabled {
      cursor: not-allowed;
    }
    .send-button:disabled svg {
      fill: #ccc;
    }
    .thinking {
      display: flex;
      gap: 8px;
      padding: 20px;
      color: #666;
      align-items: center;
    }
    .thinking .dots {
      display: flex;
      gap: 4px;
    }
    .thinking .dot {
      width: 8px;
      height: 8px;
      background: #10a37f;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }
    .thinking .dot:nth-child(1) { animation-delay: -0.32s; }
    .thinking .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
    @media (max-width: 768px) {
      .chat-container {
        padding: 10px;
        height: calc(100vh - 160px);
      }
      .message {
        padding: 15px;
      }
      .messages-container {
        padding: 10px;
      }
    }
  `;

  const content = `
    <div class="chat-container">
      <div class="messages-container" id="messages-container">
        ${
          messages.length === 0
            ? `
          <div class="message assistant">
            <div class="avatar">A</div>
            <div class="message-content">
              Hello! I'm your EV charging assistant. How can I help you today?
            </div>
          </div>
        `
            : messages
                .map(
                  (message) => `
          <div class="message ${message.role}">
            <div class="avatar">${message.role === "user" ? "U" : "A"}</div>
            <div class="message-content">${message.content}</div>
          </div>
        `
                )
                .join("")
        }
      </div>
      <form class="input-container" id="chat-form">
        <textarea 
          class="message-input" 
          placeholder="Type your message here..." 
          rows="1" 
          id="message-input"
        ></textarea>
        <button type="submit" class="send-button" id="send-button" disabled>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const messagesContainer = document.querySelector('.messages-container');

        // Auto-resize textarea
        input.addEventListener('input', () => {
          input.style.height = 'auto';
          input.style.height = (input.scrollHeight) + 'px';
          sendButton.disabled = input.value.trim() === '';
        });

        // Create thinking indicator
        const createThinkingIndicator = () => {
          const thinking = document.createElement('div');
          thinking.className = 'message assistant thinking';
          thinking.innerHTML = \`
            <div class="avatar">A</div>
            <div class="dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          \`;
          return thinking;
        };

        // Add new message to the chat
        const addMessage = (content, role) => {
          const messageDiv = document.createElement('div');
          messageDiv.className = \`message \${role}\`;
          messageDiv.innerHTML = \`
            <div class="avatar">\${role === 'user' ? 'U' : 'A'}</div>
            <div class="message-content">\${content}</div>
          \`;
          messagesContainer.appendChild(messageDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        // Handle form submission
        const handleSubmit = async () => {
          const message = input.value.trim();
          if (!message) return;

          // Add user message
          addMessage(message, "user");

          // Clear input
          input.value = "";
          input.style.height = "auto";
          sendButton.disabled = true;

          // Add thinking indicator
          const thinking = createThinkingIndicator();
          messagesContainer.appendChild(thinking);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          // Send message to server
          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            
            // Remove thinking indicator
            thinking.remove();

            if (data.success && data.messages) {
              // Add the latest assistant message
              const lastMessage = data.messages[data.messages.length - 1];
              if (lastMessage.role === "assistant") {
                addMessage(lastMessage.content, "assistant");
              }
            }
          } catch (error) {
            console.error("Error sending message:", error);
            thinking.remove();
            addMessage("I apologize, but I encountered an error. Please try again.", "assistant");
          }
        };

        // Handle Command+Enter or Ctrl+Enter
        input.addEventListener("keydown", (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (!input.value.trim()) return;
            handleSubmit();
          }
        });

        // Handle form submission
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          handleSubmit();
        });

        // Initial scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    </script>
  `;

  return wrapInLayout(content, "Chat", "chat", chatStyles);
};
