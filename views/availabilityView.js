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
            const days = Object.keys(data);
            const datasets = [];

            // Map data into a scatter-like dataset for heatmap
            days.forEach((day, dayIndex) => {
                data[day].forEach((value, minute) => {
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
                                    const hours = Math.floor(value / 60);
                                    const minutes = value % 60;
                                    return \`\${hours}:\${minutes.toString().padStart(2, "0")}\`;
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
                                    return days[Math.floor(value)] || "";
                                },
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
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
