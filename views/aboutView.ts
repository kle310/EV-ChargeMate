import { wrapInLayout } from './layout';

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
        Welcome to EV ChargeMate, your trusted companion in the electric vehicle charging journey. 
        We're dedicated to making EV charging simple, accessible, and efficient for everyone.
      </p>
      <p>
        Our platform provides real-time information about charging stations, helping you find the 
        perfect spot to charge your electric vehicle when and where you need it.
      </p>
    </div>

    <div class="about-section">
      <h2>Key Features</h2>
      <ul class="feature-list">
        <li>Real-time charging station availability</li>
        <li>Detailed station information including pricing and power output</li>
        <li>User-friendly interface for easy navigation</li>
        <li>Comprehensive station search and filtering</li>
        <li>Favorite stations for quick access</li>
        <li>Interactive map for station locations</li>
      </ul>
    </div>

    <div class="about-section">
      <h2>Our Mission</h2>
      <p>
        At EV ChargeMate, we believe in accelerating the transition to sustainable transportation. 
        Our mission is to eliminate range anxiety and make electric vehicle charging as convenient 
        as possible, contributing to a cleaner and more sustainable future.
      </p>
      <div class="contact-info">
        <h2>Contact Us</h2>
        <p>Have questions or suggestions? We'd love to hear from you!</p>
        <p>Email: khacle@gmail.com</p>
      </div>
    </div>
  `;

  return wrapInLayout(content, 'About', 'about', aboutStyles);
};
