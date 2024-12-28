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

    if (
      row.chademo?.trim() === "Available" &&
      row.ccs?.trim() === "Available"
    ) {
      rowColor = 'style="background-color: green; color: white;"';
    }

    table += `<tr ${rowColor}>`;
    tableHeaders.forEach((header) => {
      let cellContent = row[header];

      if (header.toLowerCase() === "starttime") {
        cellContent = new Date(cellContent).toLocaleString("en-US", {
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
        <title>11107 Nebraska Ave</title>
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
        <h1>11107 Nebraska Ave</h1>
        </a>
        ${table}
        <p><a href="/about">Learn more about this station</a></p>
      </body>
    </html>
  `;
};

module.exports = { generateTable, generatePage };
