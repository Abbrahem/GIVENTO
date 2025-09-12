# GIVENTO - React Storefront

A complete e-commerce storefront built with React and Tailwind CSS featuring a modern design and responsive layout.

## Features

- **Modern UI/UX**: Clean design with red (#b71c1c) primary color scheme
- **Responsive Design**: Mobile-first approach with responsive grids and layouts
- **Product Management**: Browse products, view details, and search functionality
- **Shopping Cart**: Add/remove items, quantity management, and persistent cart state
- **Checkout Process**: Complete order form with SweetAlert success notifications
- **WhatsApp Integration**: Complaint form that opens WhatsApp with pre-filled message
- **Navigation**: Fixed navbar with marquee slider and dropdown menus

## Pages

- **Home**: Hero section with call-to-action and featured products preview
- **Products**: Complete product catalog with search functionality
- **Product Detail**: Image gallery, color/size selection, and cart actions
- **Cart**: Shopping cart management with shipping calculation (+120 EGP)
- **Checkout**: Order form with customer information and order summary

## Technologies Used

- React 18
- React Router DOM
- Tailwind CSS
- SweetAlert2
- Context API for state management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.js       # Navigation with marquee slider
│   ├── Footer.js       # Site footer
│   ├── ProductCard.js  # Product display card
│   └── ComplainSection.js # WhatsApp complaint form
├── context/
│   └── CartContext.js  # Shopping cart state management
├── data/
│   └── products.js     # Mock product data
├── pages/              # Main application pages
│   ├── Home.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── Cart.js
│   └── Checkout.js
└── App.js              # Main application component
```

## Key Features

### Navbar
- Marquee slider with rotating promotional messages
- Centered GIVENTO logo
- Lessons dropdown menu
- Responsive hamburger menu for mobile
- Shopping cart icon with item count

### Product Management
- 10 mock products with images, prices, colors, and sizes
- Search functionality on Products page
- Image gallery with thumbnail navigation
- Color and size selection on product details

### Shopping Cart
- Add/remove items with selected options
- Quantity management
- Automatic shipping calculation (+120 EGP)
- Persistent cart state using Context API

### Responsive Design
- Desktop: 3-column product grid
- Mobile: 2-column product grid
- Responsive navigation and layouts
- Mobile-optimized product detail pages

## Color Scheme

- Primary: #b71c1c (Red)
- Background: White
- Text: #222 (Dark Gray)
- Font: Poppins (Google Font)

## Contact Integration

The complaint form integrates with WhatsApp using the number +201000000000 (placeholder) and automatically formats the message with user input.
