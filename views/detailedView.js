const generateDetailedPage = (availabilityData, table) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Availability</title>
        <!-- Google Tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NQVYSLJQ1W"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'G-NQVYSLJQ1W');
        </script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
    </head>
    <body>
        <h1>Availability</h1>
        <canvas id="heatmap" width="1000" height="400"></canvas>
        <script>
            (function renderChart() {
            const data = ${JSON.stringify(availabilityData)};
            const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const datasets = [];

            // Map data into a scatter-like dataset for heatmap
            dayOrder.forEach((day, dayIndex) => {
                const dayData = data[day] || []; // Handle missing days gracefully
                dayData.forEach((value, minute) => {
                    if (value === 1) {
                        datasets.push({
                            x: minute, // Minutes as X-axis
                            y: dayIndex, // Day index for Y-axis
                            r: 5, // Bubble size (optional)
                        });
                    }
                    else {
                        datasets.push({
                            x: minute, // Arbitrary minute
                            y: dayIndex, // Arbitrary day
                            r: 0, // Bubble size 0 (invisible)
                        });
                    }
                });
            });

            // Calculate current time in minutes since midnight
            const now = new Date();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            const currentDayIndex = now.getDay(); // Get the current day of the week (0 - Sunday, 6 - Saturday)

            // Create the chart
            const ctx = document.getElementById("heatmap").getContext("2d");
            new Chart(ctx, {
                type: "bubble",
                data: {
                    datasets: [
                        {
                            label: "Usage Heatmap",
                            data: datasets,
                            backgroundColor: "green",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: "linear",
                            title: {
                                display: false,
                                text: "Time",
                            },
                            min: 0, // Ensure minimum x-axis is at 00:00
                        max: 1439, // Maximum value is 11:59 PM (1439 minutes)
                            ticks: {
                                callback: function (value) {
                                    const hours24 = Math.floor(value / 60);
                                    const minutes = value % 60;
                                    const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
                                    const ampm = hours24 >= 12 ? "PM" : "AM"; // Determine AM/PM
                                    return \`\${hours12}:\${minutes.toString().padStart(2, "0")} \${ampm}\`;
                                },
                            },
                        },
                        y: {
                            type: "linear",
                            title: {
                                display: false,
                                text: "Days of the Week",
                            },
                            ticks: {
                                callback: function (value) {
                                    return dayOrder[Math.floor(value)] || "";
                                },
                            },
                            reverse: true, // Ensures top-to-bottom ordering
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const value = context.raw;
                                    const hours24 = Math.floor(value.x / 60);
                                    const minutes = value.x % 60;
                                    const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
                                    const ampm = hours24 >= 12 ? "PM" : "AM"; // Determine AM/PM
                                    const time = \`\${hours12}:\${minutes.toString().padStart(2, "0")} \${ampm}\`;
                                    const day = dayOrder[value.y];
                                    return \`\${day}: \${time}\`;
                                },
                            },
                        },
                        annotation: {
                            annotations: {
                                currentTimeLine: {
                                    type: "line",
                                    xMin: currentTimeInMinutes,
                                    xMax: currentTimeInMinutes,
                                    borderColor: "red",
                                    borderWidth: 2,
                                    label: {
                                        display: false,
                                        content: "Current Time",
                                        position: "end",
                                        yAdjust: 0,
                                    },
                                },
                                todayLine: {
                                type: "line",
                                xMin: 0, // Start of the day
                                xMax: 1439, // End of the day
                                yMin: currentDayIndex, // Position the line slightly above the current day
                                yMax: currentDayIndex, // Position the line slightly below the current day
                                borderColor: "red",
                                borderWidth: 2,
                                label: {
                                    display: false,
                                    content: "Today",
                                    position: "start",
                                    xAdjust: 10,
                                    yAdjust: 0,
                                },
                             },    
                            },
                        },
                    },
                },
            });
        })();              
        </script>
        <h1></h1>
        ${table}
    </body>
    </html>
  `;
};

// views/stationView.js
const generateTable = (filteredResults) => {
  const tableHeaders = Object.keys(filteredResults[0]);
  let table =
    '<table border="1" style="border-collapse: collapse; width: 100%;">';

  table += "<tr><th>Status</th><th>Start Time</th><th>Duration</th>";
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
        const cellDate = new Date(cellContent);
        const today = new Date();

        // Check if the date part of `cellContent` matches today's date
        const isToday =
          cellDate.getFullYear() === today.getFullYear() &&
          cellDate.getMonth() === today.getMonth() &&
          cellDate.getDate() === today.getDate();

        cellContent = cellDate.toLocaleString("en-US", {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        if (isToday) {
          // Replace the day of the week with "Today"
          cellContent = cellContent.replace(/^[a-zA-Z]+/, "Today");
        }
      }

      table += `<td>${cellContent || ""}</td>`;
    });
    table += "</tr>";
  });

  table += "</table>";

  return table;
};

module.exports = { generateDetailedPage, generateTable };
