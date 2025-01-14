import { StatusPageProps } from '../types';

export const generateStatusPage = ({ status, station_id }: StatusPageProps): string => {
  const backgroundColor = status.status > 0 ? "green" : "red";
  const condition = Math.abs(status.status);
  console.log(condition);
  console.log(station_id);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Station Status</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: ${backgroundColor};
          }
          .status-container {
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
          }
          .status-text {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .condition-text {
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="status-container">
          <div class="status-text">Station ${station_id}</div>
          <div class="condition-text">Condition: ${condition}</div>
        </div>
      </body>
    </html>
  `;
};
