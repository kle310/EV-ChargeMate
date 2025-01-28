import { wrapInLayout } from "./layout";

export const generateAboutView = (): string => {
  const aboutStyles = `
    .about-section {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .about-section h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.8em;
    }
    .about-section p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .feature-list li {
      margin-bottom: 15px;
      padding-left: 25px;
      position: relative;
      color: #666;
    }
    .feature-list li:before {
      content: "✓";
      color: #2ecc71;
      position: absolute;
      left: 0;
      font-weight: bold;
    }
    .contact-info {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `;

  const content = `
    <div class="about-section">
      <h2>About EV ChargeMate</h2>
      <p>
        Welcome to EV ChargeMate, a platform designed to help you find free and affordable charging 
        for your electric vehicle. Our mission is to empower EV users by providing the tools and 
        information needed to make sustainable transportation effortless and accessible.
      </p>
      <p>
        Electric vehicles are more than just a mode of transport—they represent a shift toward 
        cleaner energy and a brighter future for our planet. By simplifying the process of charging 
        your EV, we aim to support the global transition from gas-powered vehicles to sustainable 
        energy solutions.
      </p>
    </div>

    <div class="about-section">
      <h2>Why EV ChargeMate Exists</h2>
      <p>
        EV ChargeMate is more than a service; it's a personal project and a playground for innovation. 
        Created to refine technical skills and explore the evolving world of EV charging, this platform 
        is a space for growth and discovery. Along the way, we're striving to become experts in EV 
        charging while making life easier for drivers like you.
      </p>
    </div>

    <div class="about-section">
      <h2>Key Features</h2>
      <ul class="feature-list">
        <li>
          Find Free or Cheap Charging: Locate charging stations that cost you next to nothing, including 
          detailed pricing information and maps to help you navigate
        </li>
        <li>
          Real-Time Availability: Stay informed about charger status and availability through our 
          continuously updated database
        </li>
        <li>
          Detailed Insights: Access key information, including charging times, station types, power output, 
          and tips on how to make the most of your charging experience
        </li>
        <li>
          Interactive Map: Easily locate the nearest chargers with an intuitive map interface that 
          filters by price, availability, and more
        </li>
        <li>
          Planning: Figure out the best times to charge based on your needs and predicted availability 
          using our advanced algorithms and machine learning models
        </li>
        <li>
          Chatbot: Ask anything about charging, from "What's the best charger for my car?" to 
          "How do I find the cheapest charger near me?"
        </li>
      </ul>
    </div>

    <div class="about-section">
      <h2>Our Vision</h2>
      <p>
        We envision a world where sustainable energy is the standard, not the exception. By simplifying 
        EV charging, we're contributing to a future where clean energy drives progress. Together, we can 
        create a greener planet—one charge at a time.
      </p>
    </div>

    <div class="about-section">
      <h2>Let's Connect</h2>
      <p>Have feedback or ideas? I'd love to hear from you!</p>
      <div class="contact-info">
        <p>Email: khacle@gmail.com</p>
      </div>
    </div>
  `;

  return wrapInLayout(content, "About", "about", aboutStyles);
};
