import {
  Bike,
  Camera,
  Car,
  Gamepad2,
  Headphones,
  Laptop,
  Refrigerator,
  ShoppingBag,
  Smartphone,
  Tablet,
  Tv,
  Watch,
} from 'lucide-react';

const ICONS = {
  Car,
  Phone: Smartphone,
  Bike,
  TV: Tv,
  Laptop,
  Audio: Headphones,
  Tablet,
  Camera,
  Smartwatch: Watch,
  Appliance: Refrigerator,
  Gaming: Gamepad2,
};

function CategoryIcon({ category, size = 20 }) {
  const Icon = ICONS[category] || ShoppingBag;
  return <Icon size={size} aria-hidden />;
}

export default CategoryIcon;
