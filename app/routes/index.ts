// app/routes/index.ts
// Central route configuration - similar to Laravel web.php

export const routes = {
  // Public pages
  home: "/",
  products: "/products",
  productDetail: (id: number | string) => `/products/${id}`,
  lookbook: "/lookbook",
  sizing: "/sizing",
  about: "/about",
  contact: "/contact",

  // Auth routes (if needed)
  login: "/auth/login",
  signup: "/auth/signup",
  logout: "/auth/logout",

  // Dashboard/Account (if needed)
  dashboard: "/dashboard",
  account: "/account",
  orders: "/account/orders",
  wishlist: "/account/wishlist",

  // Cart & Checkout
  cart: "/cart",
  checkout: "/checkout",
  orderConfirmation: (orderId: string) => `/orders/${orderId}`,

  // Admin (if needed)
  admin: "/admin",
  adminProducts: "/admin/products",
  adminOrders: "/admin/orders",
};

// Navigation menu items
export const navigationItems = [
  { label: "Home", href: routes.home },
  { label: "Products", href: routes.products },
  { label: "Lookbook", href: routes.lookbook },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

// Footer links
export const footerLinks = {
  company: [
    { label: "About", href: routes.about },
    { label: "Contact", href: routes.contact },
    { label: "Sizing", href: routes.sizing },
  ],
  customer: [
    { label: "Orders", href: routes.orders },
    { label: "Wishlist", href: routes.wishlist },
    { label: "Cart", href: routes.cart },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Returns", href: "#" },
  ],
};
