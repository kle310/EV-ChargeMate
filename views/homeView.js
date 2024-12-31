const generateHomePage = () => {
  return `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free SoCal Fast Chargers</title>
    
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
    
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }

        header {
            background-color: #2c3e50;
            color: #fff;
            padding: 20px;
            text-align: center;
        }

        .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .tabs {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #ddd;
            margin-bottom: 20px;
        }

        .tab {
            flex: 1;
            text-align: center;
            padding: 10px;
            cursor: pointer;
            background-color: #f9f9f9;
            color: #333;
            font-weight: bold;
            border: 1px solid #ddd;
            border-bottom: none;
        }

        .tab:hover, .tab.active {
            background-color: #fff;
            border-bottom: 2px solid #fff;
            color: #2c3e50;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        ul {
            list-style-type: disc;
            padding-left: 20px;
        }

        li {
            margin-bottom: 10px;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }

        a {
            color: #3498db;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        footer {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background-color: #2c3e50;
            color: #fff;
        }
    </style>

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
        <h1>Free SoCal Fast Chargers</h1>
    </header>

    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="showTab(event, 'free')">Free</button>
            <button class="tab" onclick="showTab(event, 'cheap')">Discounted</button>
            <button class="tab" onclick="showTab(event, 'about')">About</button>
        </div>

        <section id="free" class="tab-content active">
            <article>
                <h2>Overview</h2>
                <p>LADWP offers free fast chargers with a 30-minute usage limit. However, the official app doesn’t provide session duration details, requiring users to leave their vehicles to check the charger’s screen. I developed an app to track and display session durations for improved convenience.</p>
            </article>

            <article>
                <h2>Comparison</h2>
                <h3>Official App</h3>
                <p>No way to tell how long this person has been charging.</p>
                <img src="/shell.jpeg" alt="Screenshot of the official app showing no duration info" />

                <h3>My App</h3>
                <p>Charger in use for 17 minutes:</p>
                <img src="/busy.jpeg" alt="App showing charger in use for 17 minutes" />
                <p>Charger available for 3 minutes:</p>
                <img src="/available.jpeg" alt="App showing charger available for 3 minutes" />
            </article>

            <article>
                <h2>Locations</h2>
                <ul>
                    <li><a href="/12585A">LADWP DS-28</a></li>
                    <li>Northridge Fashion Center Pacific Theatres DCFC     
                        <a href="/2DWE-13"><s>13</s></a>
                        <a href="/2DWE-14">14</a>
                    </li>
                    <li>Glendale Galleria DCFC 
                        <a href="/2XZB-22">22</a>
                        <a href="/2XZB-23"><s>23</s></a>
                        <a href="/2XZB-24">24</a>
                        <a href="/2XZB-25"><s>25</s></a>
                    </li>
                    <li><a href="/2ZG5-01">Plaza Del Amo DCFC</a></li>
                </ul>
            </article>

            <article>
                <h2>Tech Stack</h2>
                <p>Node.js + Express, PostgreSQL, Docker, PM2, Ubuntu, ChatGPT/Copilot, GitHub</p>
            </article>

            <article>
                <h2>To-Do</h2>
                
                    <s>Availability Heatmap</s><br>
                    <img src="/availability.jpeg" alt="App showing weekly availabilty" />
                <ul>
                    <li>Predictions</li>
                    <li>iOS app</li>
                </ul>
            </article>
        </section>

         <section id="cheap" class="tab-content">

            <article>
                <h2>Locations</h2>
                <ul>
                    <li>4100 Market Place Drive, Monterey Park ($0.20/kWh)          
                        <a href="/153420">50 kW</a>
                        <a href="/153421">50 kW</a>
                    </li>
                    <li>64 E Glenarm St, Pasadena ($0.15/kWh)     
                        <a href="/153528">175 kW</a>
                        <a href="/153787">50 kW</a>
                    </li>
                    <li>410 Shoppers Lane, Pasadena ($0.15/kWh)          
                        <a href="/15152B">150 kW</a>
                        <a href="/15157B">150 kW</a>
                        <a href="/15158B">150 kW</a>
                    </li>
                    
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
        <p>&copy; 2024 Free SoCal Fast Chargers. All Rights Reserved.</p>
    </footer>
</body>
</html>

  `;
};

module.exports = generateHomePage;
