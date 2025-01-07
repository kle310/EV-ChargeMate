const generateHomePage = () => {
  return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ChargeMate - Save Money on Charging</title>
        
        <link rel="stylesheet" href="styles.css">
        
        <script>
            function fetchCitiesAndChargers() {
                fetch('/api/cities')
                    .then(response => response.json())
                    .then(cities => {
                        const cityDropdown = document.getElementById("cityDropdown");
                        // Clear existing options
                        cityDropdown.innerHTML = '<option value="" disabled selected>Select a city</option>';
                        
                        // Populate city dropdown
                        cities.forEach(city => {
                            const option = document.createElement("option");
                            option.value = city.city; 
                            option.textContent = city.city; 
                            cityDropdown.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching cities:', error);
                    });
            }

            function fetchChargersForCity(cityName) {
                fetch(\`/api/stations?city=\${cityName}\`)
                    .then(response => response.json())
                    .then(data => {
                        const dropdown = document.getElementById("locationDropdown");
                        // Clear existing options
                        dropdown.innerHTML = '<option value="" disabled selected>Select a location</option>';

                        // Add free chargers
                        if (data.free.length > 0) {
                            const freeGroup = document.createElement("optgroup");
                            freeGroup.label = "Free Chargers";
                            data.free.forEach(charger => {
                                const option = document.createElement("option");
                                option.value = charger.station_id;
                                option.textContent = charger.address;
                                freeGroup.appendChild(option);
                            });
                            dropdown.appendChild(freeGroup);
                        }

                        // Add paid chargers
                        if (data.paid.length > 0) {
                            const paidGroup = document.createElement("optgroup");
                            paidGroup.label = "Paid Chargers";
                            data.paid.forEach(charger => {
                                const option = document.createElement("option");
                                option.value = charger.station_id;
                                option.textContent = charger.address;
                                paidGroup.appendChild(option);
                            });
                            dropdown.appendChild(paidGroup);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching chargers:', error);
                    });
            }

            document.addEventListener("DOMContentLoaded", function() {
                fetchCitiesAndChargers(); // Fetch cities when the page is loaded

                // Add event listener to city dropdown
                document.getElementById("cityDropdown").addEventListener("change", function() {
                    const cityId = this.value;
                    if (cityId) {
                        fetchChargersForCity(cityId); // Fetch chargers for the selected city
                    }
                });
            });
        </script>
    </head>
    <body>
        <header>
            <h1>EV ChargeMate</h1>
        </header>

        <div class="container">
         <div class="tabs">
                <button class="tab active" onclick="showTab(event, 'overview')">Overview</button>
                <button class="tab" onclick="showTab(event, 'about')">About</button>
            </div>

            <section id="overview" class="tab-content active">
            <section id="overview" class="tab-content active">
                <article>
                    <!-- Dropdown for Cities -->
                    <section>
                        <h2>Find Charger</h2>
                        <select id="cityDropdown">
                            <option value="" disabled selected>Select a city</option>
                            <!-- Options will be populated here dynamically -->
                        </select>
                    
                        
                        <select id="locationDropdown">
                            <option value="" disabled selected>Select a location</option>
                            <!-- Options will be populated here dynamically -->
                        </select>
                    </section>
                </article>
                <!-- Other content -->
            </section>
        </div>

        <footer>
            <p>&copy; 2024 EV ChargeMate. All Rights Reserved.</p>
        </footer>
        <!-- JavaScript -->
        <script>
            document.getElementById("locationDropdown").addEventListener("change", function() {
                const url = this.value;
                if (url) {
                    window.location.href = url;
                }
            });
        </script>
    </body>
</html>
  `;
};

module.exports = generateHomePage;
