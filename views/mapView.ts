import { wrapInLayout } from './layout';

export const generateMapView = (): string => {
  const mapStyles = `
    .coming-soon {
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .coming-soon h2 {
      color: #333;
      font-size: 2.5em;
      margin-bottom: 20px;
    }
    .coming-soon p {
      color: #666;
      font-size: 1.2em;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }
    .coming-soon .emoji {
      font-size: 3em;
      margin: 20px 0;
    }
  `;

  const content = `
    <div class="coming-soon">
      <div class="emoji">🗺️</div>
      <h2>Interactive Map Coming Soon!</h2>
      <p>
        We're building an interactive map to help you easily locate and navigate to charging stations. 
        You'll be able to see all stations in your area, filter by availability, and get directions.
      </p>
    </div>
  `;

  return wrapInLayout(content, 'Map', 'map', mapStyles);
};
