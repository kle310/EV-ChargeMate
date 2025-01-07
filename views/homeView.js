const generateHomePage = () => {
  return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ChargeMate - save money on charging</title>
        
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
        
        <link rel="stylesheet" href="styles.css">

        <script>
            function showTab(event, tabId) {
                const tabs = document.querySelectorAll('.tab');
                const contents = document.querySelectorAll('.tab-content');

                tabs.forEach(tab => tab.classList.remove('active'));
                contents.forEach(content => content.classList.remove('active'));

                event.currentTarget.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            }
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
            <article>
                <!-- Dropdown for Free L3 Locations -->
                <section>
                    <h2>Find Charger</h2>
                    <select id="locationDropdown">
                        <option value="" disabled selected>Select a location</option> <!-- Default placeholder option -->
                        <option value="/12585A">LADWP DS-28 DCFC</option>
                        <option value="/2DWE-13">Northridge Fashion Center DCFC - 13</option>
                        <option value="/2DWE-14">Northridge Fashion Center DCFC - 14</option>
                        <option value="/2XZB-22">Glendale Galleria DCFC - 22</option>
                        <option value="/2XZB-24">Glendale Galleria DCFC - 24</option>
                        <option value="/2ZG5-01">Plaza Del Amo DCFC</option>
                        <option value="/245F-01">2121 Cloverfield Blvd - 1</option>
                        <option value="/245F-02">2121 Cloverfield Blvd - 2</option>
                        <option value="/2N9O-01">500 Wilshire Blvd - 1</option>
                        <option value="/2N9O-02">500 Wilshire Blvd - 2</option>
                        <option value="/2GWB-01">2201 Wilshire Blvd - 1</option>
                        <option value="/2GWB-02">2201 Wilshire Blvd - 2</option>
                        <option value="/24XI-01">11250 West Olympic Blvd - 1</option>
                        <option value="/24XI-02">11250 West Olympic Blvd - 2</option>
                        <option value="/24XI-03">11250 West Olympic Blvd - 3</option>
                        <option value="/24XI-04">11250 West Olympic Blvd - 4</option>
                        <option value="/153420">4100 Market Place Drive, Monterey Park - 50 kW ($0.20/kWh)</option>
                        <option value="/153421">4100 Market Place Drive, Monterey Park - 50 kW ($0.20/kWh)</option>
                        <option value="/153528">64 E Glenarm St, Pasadena - 175 kW ($0.15/kWh)</option>
                        <option value="/153787">64 E Glenarm St, Pasadena - 50 kW ($0.15/kWh)</option>
                        <option value="/15152B">410 Shoppers Lane, Pasadena - 150 kW ($0.15/kWh)</option>
                        <option value="/15157B">410 Shoppers Lane, Pasadena - 150 kW ($0.15/kWh)</option>
                        <option value="/15158B">410 Shoppers Lane, Pasadena - 150 kW ($0.15/kWh)</option>
                    </select>
                    <br>Chargers are free to use unless otherwise specified
                </section>
            </article>
                <article>
                    <h2>Overview</h2>
                    <p>
                    I developed this app as a personal project to experiment with new technologies, all while encouraging the efficient use of government-subsidized electric vehicle (EV) charging stations. The app allows users to easily find the most affordable EV charging rates by offering real-time updates on charger availability, enabling them to plan their charging sessions with greater convenience and cost-effectiveness.
                    </p>
                </article>

                <article>
                    <h2>Comparison</h2>
                    <h3>Official App</h3>
                    <p><b>Unknown Charging Duration:</b> It's not possible to determine how long this person has been charging.</p>
                    <img src="/shell.jpeg" alt="Screenshot of the official app showing no duration info" />

                    <h3>My App</h3>
                    <p><b>Charger Availability:</b> In use for 17 minutes.</p>
                    <img src="/busy.jpeg" alt="App showing charger in use for 17 minutes" />
                    <p><b>Charger Availability:</b> Available for 3 minutes.</p>
                    <img src="/available.jpeg" alt="App showing charger available for 3 minutes" />
                    <p><b>Weekly Availability:</b> Each green dot indicates a time slot where a charger was available for at least 5 minutes.</p>
                    <img src="/availability.jpeg" alt="App showing weekly availabilty" />
                </article>

                <article>
                    <h2>Technology Stack</h2>
                    <p><strong>Backend:</strong> Node.js with Express.js</p>
                    <p><strong>Frontend:</strong> HTML5, JavaScript (ES6+), CSS3</p>
                    <p><strong>Database:</strong> PostgreSQL for relational data storage</p>
                    <p><strong>Security:</strong> NGINX for SSL/TLS termination and reverse proxy</p>
                    <p><strong>Containerization:</strong> Docker for consistent environment setup and deployment</p>
                    <p><strong>Process Management:</strong> PM2 for managing Node.js processes in production</p>
                    <p><strong>Operating System: </strong> Ubuntu for server environment</p>
                    <p><strong>AI Assistance:</strong> ChatGPT and Copilot for development productivity and code suggestions</p>
                    <p><strong>CI/CD:</strong> Github Actions for continuous integration and deployment pipeline</p>
                    <p><strong>Testing:</strong> Playwright for end-to-end testing</p>
                </article>

                <article>
                    <h2>To-Do</h2>
                    
                        <s>Availability Heatmap</s><br>
                    <ul>
                        <li>Predictions</li>
                        <li>iOS app</li>
                    </ul>
                </article>
            </section>

            <section id="about" class="tab-content">
                <h2>Currently Seeking Opportunities</h2>
                <p>Hello, I am actively looking for new opportunities. Please reach out via <a href="https://www.linkedin.com/in/khacle/" target="_blank">LinkedIn</a> or <a href="mailto:khacle@gmail.com">email</a>.</p>
                <div class="section">
            <h2>Work Experience</h2>

            <h3>Stealth Startup</h3>
            <p><strong>QA Lead</strong> - Remote (Oct 2023 – Mar 2024)</p>
            <ul>
                <li>Developed and implemented QA test plans, strategies, and processes as the sole QA owner.</li>
                <li>Implemented a CI/CD pipeline to automate build, deployment, and testing processes.</li>
                <li>Contributed as a backend engineer by fixing bugs and developing RESTful APIs within a Node.js backend, integrating them with HubSpot workflows.</li>
                <li>Tech Stack: React, Tailwind CSS, Node.js, GraphQL, EC2, RDS - MySQL, Sequelize, CloudWatch, GitHub Actions, CodeDeploy, Playwright, Postman.</li>
            </ul>

            <p><strong>Co-Founder</strong> - Los Angeles, CA (Nov 2021 – Sep 2023)</p>
            <ul>
                <li>Founded a company focused on identifying effective automated tests and determining their ROI for businesses.</li>
                <li>Streamlined testing processes, improved efficiency, and maximized ROI through advanced analytics.</li>
            </ul>

            <h3>Coursera</h3>
            <p><strong>Senior QE Manager</strong> - Mountain View, CA (Jan 2019 – Oct 2021)</p>
            <ul>
                <li>Built the entire QE organization from the ground up as the Head of QE.</li>
                <li>Managed SDET and QA teams of 15 members, overseeing hiring, coaching, and mentoring.</li>
                <li>Elevated product quality to IPO standards through automated testing and continuous deployment capabilities.</li>
                <li>Increased UI/API test coverage from <10% to >90% and unit test coverage from <50% to >80%.</li>
                <li>Reduced blocker bugs to less than 1 per quarter and critical bugs to less than 3 per quarter.</li>
                <li>Implemented engineering best practices, incident management, and defect prevention initiatives.</li>
            </ul>

            <h3>LinkedIn</h3>
            <p><strong>QA Manager</strong> - Mountain View, CA (Sep 2012 – Oct 2018)</p>
            <ul>
                <li>Led multiple teams of SDET and QA engineers to ensure high-quality product deliveries.</li>
                <li>Collaborated with cross-functional teams to integrate testing into the development process.</li>
                <li>Contributed to initiatives like transitioning from monolith to microservices, localization, GDPR compliance, and accessibility enhancements.</li>
            </ul>
            
            <p><strong>QA Lead</strong> (Oct 2011 – Sep 2012)</p>
            <ul>
                <li>Owned QA for the Job Posting product, overseeing its launch (0 → 1) and evolution.</li>
            </ul>
            
            <p><strong>QA Engineer</strong> (Nov 2010 – Oct 2011)</p>
            <ul>
                <li>Led QA for the Recruiter product launch and subsequent updates.</li>
                <li>Handled requirements gathering, test planning, functional testing, cross-browser testing, integration testing, performance testing, regression automation, and release management.</li>
            </ul>

            <h3>Ziosoft</h3>
            <p><strong>Lead Automation Engineer</strong> - Redwood City, CA (Sep 2008 – Nov 2010)</p>
            <ul>
                <li>Designed and implemented functional and performance test frameworks for web and Windows desktop applications using Selenium, Eggplant, SilkTest, and AutoItX.</li>
            </ul>

            <h3>AOL</h3>
            <p><strong>QA Engineer</strong> - Mountain View, CA (Oct 2006 – Sep 2008)</p>
            <ul>
                <li>Implemented automated UI testing by designing a custom UI testing framework using WATIR/WebDriver, significantly reducing test cycles from one month to two weeks.</li>
            </ul>
        </div>

        <div class="section">
            <h2>Education</h2>
            <p><strong>University of California, Irvine</strong> - BS, Information & Computer Science</p>
        </div>
        
        <div class="section">
            <h2>Certifications & Skills</h2>
            <p><strong>Certifications:</strong> Foundations of Project Management (Google, Apr 2024), Generative AI for Everyone (DeepLearning.AI, Apr 2024), AWS Cloud Technical Essentials (AWS, Jan 2024), Promptly for Beginners: Build a Generative AI App (Coursera, Jan 2024), Crash Course on Python (Google, Oct 2023), Microservices - Fundamentals (IBM, Dec 2019).</p>
            <p><strong>Skills:</strong> Programming Languages (Python, Java, JavaScript, Typescript, Ruby, Groovy, HTML5, CSS3, SQL), UI Automation (Playwright, Puppeteer, Jest, Selenium, Cypress, Watir, AutoIt, Eggplant, Appium), Backend Automation (Postman, Custom Frameworks), and more.</p>
        </div>

        </div>
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
