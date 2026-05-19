# ShopZone — Premium Ecommerce Application

Welcome to the **ShopZone** repository! This is a high-performance, aesthetically premium, and fully responsive e-commerce web application.

This README provides a complete breakdown of the workflow, the technologies used, the core concepts, and a detailed explanation of every working file in the project.

---

## 🛠 Technology Stack
This application is built using the **MERN** stack fundamentals (specifically the Express/Node layer) combined with server-side rendering for speed and SEO optimization.

* **Backend & Server**: Node.js, Express.js
* **Templating Engine**: EJS (Embedded JavaScript)
* **Frontend Design**: Vanilla HTML5, CSS3 (using modern Custom Properties/Variables for a "Shadcn-like" design system)
* **Animations**: Motion One (lightweight, high-performance animation library)
* **Database (Current State)**: In-memory JavaScript arrays (simulating a database before MongoDB integration).

---

## 🧠 Core Concepts & Workflow

The application follows the **MVC (Model-View-Controller)** architectural pattern. 

1. **Routing (The Entry Point)**: When a user visits a URL (e.g., `/shop`), the Express router intercepts the request.
2. **Controller (The Logic)**: The router passes the request to the `shopController`. The controller evaluates any query parameters (like `?category=electronics` or `?sort=price-low`), fetches the relevant data from the "Model" (our data arrays), and performs the sorting/filtering logic.
3. **View (The UI)**: Once the data is processed, the controller injects that data into an EJS template (`shop.ejs`). The EJS engine renders the final HTML and sends it back to the user's browser, beautifully styled by our Vanilla CSS.

---

## 📂 Complete File Breakdown

There are roughly **20 working files** driving this application, organized logically:

### 1. Root Level & Configuration
* `server.js` 
  * **What it does**: The beating heart of the backend. It initializes the Express application, configures the EJS view engine, serves static files from the `public/` directory, mounts the routers, and starts the local server on Port 3000.
* `package.json` & `package-lock.json`
  * **What it does**: Manages project dependencies (like `express`, `ejs`, `dotenv`) and defines script commands (like `npm start`).
* `.env`
  * **What it does**: Environment variable configuration. Securely stores server port numbers or future database URIs.

### 2. Routes (`/routes`)
* `index.js`
  * **What it does**: Handles all the static and informational routes. It maps URLs like `/`, `/about`, `/contact`, and `/privacy` to their respective controller functions.
* `shop.js`
  * **What it does**: Handles the primary e-commerce logic. It maps `/shop` to the product browsing experience.

### 3. Controllers (`/controllers`)
* `shopController.js`
  * **What it does**: Contains the business logic. 
  * *Concept*: It imports all product data, handles the homepage rendering (`getHome`), handles all static pages (`getAbout`, `getContact`, etc.), and houses the complex `getShop` function which performs array filtering (by category, price) and sorting (low-to-high, high-to-low) before sending data to the view.

### 4. Data Models (`/data`)
*(These simulate a database collection. In the future, these will become Mongoose schemas.)*
* `electronics.js`, `clothing.js`, `home.js`, `books.js`
  * **What they do**: Each file exports an array of JavaScript objects. Every object represents a product with properties like `id`, `name`, `price`, `description`, `badge`, and a high-quality `image` URL sourced from Unsplash.

### 5. Views (`/views`)
*(The frontend UI rendered by the backend)*
* `index.ejs`
  * **What it does**: The Homepage. Features a hero section with a dynamic layout, and grids showcasing featured categories and products.
* `shop.ejs`
  * **What it does**: The primary shopping interface. Features a responsive two-column CSS grid with a sticky sidebar for filtering (price, category) on the left, and a dynamic grid of product cards on the right.
* `about.ejs`, `contact.ejs`, `careers.ejs`, `privacy.ejs`, `terms.ejs`, `shipping.ejs`, `returns.ejs`
  * **What they do**: Beautifully styled static pages containing company information. Designed using a unified "prose" styling system for elegant typography and readability.
* **Partials (`/views/partials`)**:
  * `header.ejs`: The top navigation bar, logo, search input, mobile hamburger menu, and prominent Cart button. Injected into every page.
  * `footer.ejs`: The dark-themed bottom anchor of the site containing quick links, social media icons, and a newsletter subscription UI. Injected into every page.

### 6. Public Assets (`/public`)
*(Files sent directly to the browser)*
* `css/style.css`
  * **What it does**: The central nervous system of the design. 
  * *Concept*: Utilizes CSS variables (Custom Properties) defined in `:root` to map HSL color values, ensuring a consistent theme. Uses CSS Grid for layouts (`.product-grid`, `.shop-page`), Flexbox for alignment, and specific media queries (`@media (max-width: 768px)`) for mobile responsiveness.
* `js/main.js`
  * **What it does**: Client-side interactivity.
  * *Concept*: Uses `document.querySelector` to handle mobile menu toggling (the hamburger button) and uses the **Motion One** library (`animate`, `inView`) to create smooth fade-in and slide-up entrance animations as the user scrolls down the page.

---

## 🚀 How to Run

1. Ensure you have **Node.js** installed.
2. Open your terminal and navigate to the project directory.
3. Run `npm install` to download dependencies.
4. Run `npm start` (or `node server.js`) to launch the server.
5. Open your browser and navigate to `http://localhost:3000`.
