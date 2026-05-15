export const API_BASE = 'http://localhost:5000/api';
export const API_URL = `${API_BASE}/groups`;
export const AUTH_API_URL = `${API_BASE}/auth`;
export const AUTH_SESSION_KEY = 'mobicircle_session_user';

export const CATEGORIES = [
  'Car',
  'Phone',
  'Bike',
  'TV',
  'Laptop',
  'Audio',
  'Tablet',
  'Camera',
  'Smartwatch',
  'Appliance',
  'Gaming',
];

export const ELECTRONIC_ADS = [
  {
    id: 'ad-1',
    title: 'Samsung 55" 4K Smart TV',
    tag: 'Home Entertainment',
    category: 'TV',
    totalPrice: 499,
    price: '$499',
    blurb: 'Crystal UHD display with voice assistant and 1-year warranty.',
  },
  {
    id: 'ad-2',
    title: 'Apple iPhone 15',
    tag: 'Smartphone',
    category: 'Phone',
    totalPrice: 799,
    price: '$799',
    blurb: 'A16 Bionic performance, great cameras, and all-day battery life.',
  },
  {
    id: 'ad-3',
    title: 'Sony WH-1000XM5',
    tag: 'Audio',
    category: 'Audio',
    totalPrice: 329,
    price: '$329',
    blurb: 'Industry-leading noise cancellation for work, travel, and music.',
  },
  {
    id: 'ad-4',
    title: 'Dell XPS 13',
    tag: 'Ultrabook',
    category: 'Laptop',
    totalPrice: 999,
    price: '$999',
    blurb: 'Compact premium laptop with long battery life and fast SSD.',
  },
  {
    id: 'ad-5',
    title: 'iPad Air (M2)',
    tag: 'Tablet',
    category: 'Tablet',
    totalPrice: 599,
    price: '$599',
    blurb: 'Powerful tablet for study, design, and streaming on the go.',
  },
  {
    id: 'ad-6',
    title: 'Canon EOS R50',
    tag: 'Camera',
    category: 'Camera',
    totalPrice: 679,
    price: '$679',
    blurb: 'Mirrorless camera with 4K video and sharp autofocus.',
  },
  {
    id: 'ad-7',
    title: 'Apple Watch Series 9',
    tag: 'Wearables',
    category: 'Smartwatch',
    totalPrice: 399,
    price: '$399',
    blurb: 'Health tracking, notifications, and all-day performance.',
  },
  {
    id: 'ad-8',
    title: 'PlayStation 5 Slim',
    tag: 'Gaming',
    category: 'Gaming',
    totalPrice: 499,
    price: '$499',
    blurb: 'Next-gen console gaming with lightning-fast load times.',
  },
  {
    id: 'ad-9',
    title: 'LG 260L Smart Inverter Fridge',
    tag: 'Home Appliance',
    category: 'Appliance',
    totalPrice: 449,
    price: '$449',
    blurb: 'Energy-efficient refrigerator with smart cooling technology.',
  },
];

export const getAdById = (adId) => ELECTRONIC_ADS.find((ad) => ad.id === adId);
