const generateAvailabilityPage = (availabilityData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Weekly Usage Heatmap</title>
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
        <h1>Weekly Availability</h1>
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
                });
            });

            // Calculate current time in minutes since midnight
            const now = new Date();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

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
                                display: true,
                                text: "Minutes of the Day",
                            },
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
                                display: true,
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
                                        display: true,
                                        content: "Current Time",
                                        position: "end",
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
    </body>
    </html>
  `;
};

module.exports = { generateAvailabilityPage };
