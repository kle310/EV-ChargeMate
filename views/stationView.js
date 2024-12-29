// views/stationView.js
const generateTable = (filteredResults) => {
  const tableHeaders = Object.keys(filteredResults[0]);
  let table =
    '<table border="1" style="border-collapse: collapse; width: 100%;">';

  table += "<tr>";
  tableHeaders.forEach((header) => {
    table += `<th>${header}</th>`;
  });
  table += "</tr>";

  filteredResults.forEach((row) => {
    let rowColor = "";

    if (row.plug_status?.trim() === "Available") {
      rowColor = 'style="background-color: green; color: white;"';
    }

    table += `<tr ${rowColor}>`;
    tableHeaders.forEach((header) => {
      let cellContent = row[header];

      if (header.toLowerCase() === "starttime") {
        cellContent = new Date(cellContent).toLocaleString("en-US", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      table += `<td>${cellContent || ""}</td>`;
    });
    table += "</tr>";
  });

  table += "</table>";

  return table;
};

const generatePage = (station_id, table) => {
  return `
    <html>
      <head>
        <title>${station_id} Stats</title>
        <style>
          table {
            text-align: left;
          }
          th, td {
            padding: 8px;
          }
          h1 {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <a href="/${station_id}/availability">
        <h1>${station_id}</h1>
        </a>
        ${table}
      </body>
    </html>
  `;
};

module.exports = { generateTable, generatePage };
