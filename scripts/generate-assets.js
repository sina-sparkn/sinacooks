import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve(process.cwd(), 'scripts/seed-assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const dishes = [
  { name: 'pancakes.svg', title: 'Fluffy Blueberry Pancakes', icon: '🥞', bg: '#fef3c7', text: '#92400e' },
  { name: 'carbonara.svg', title: 'Spaghetti Carbonara', icon: '🍝', bg: '#fef9c3', text: '#854d0e' },
  { name: 'pizza.svg', title: 'Margherita Pizza', icon: '🍕', bg: '#fee2e2', text: '#991b1b' },
  { name: 'quinoa-salad.svg', title: 'Mediterranean Quinoa Salad', icon: '🥗', bg: '#dcfce7', text: '#166534' },
  { name: 'tikka-masala.svg', title: 'Chicken Tikka Masala', icon: '🍛', bg: '#ffedd5', text: '#9a3412' },
  { name: 'lentil-soup.svg', title: 'Golden Lentil Soup', icon: '🍲', bg: '#fef08a', text: '#713f12' },
  { name: 'fish-tacos.svg', title: 'Baja Fish Tacos', icon: '🌮', bg: '#e0e7ff', text: '#3730a3' },
  { name: 'smoothie.svg', title: 'Green Glow Detox Smoothie', icon: '🥤', bg: '#d1fae5', text: '#065f46' },
  { name: 'cookies.svg', title: 'Chocolate Chip Cookies', icon: '🍪', bg: '#fed7aa', text: '#7c2d12' },
  { name: 'stir-fry.svg', title: 'Garlic Sesame Stir-Fry', icon: '🥘', bg: '#fae8ff', text: '#86198f' },
];

for (const dish of dishes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${dish.bg}"/>
  <circle cx="400" cy="270" r="140" fill="#ffffff" fill-opacity="0.8"/>
  <text x="400" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="110" text-anchor="middle">${dish.icon}</text>
  <text x="400" y="470" font-family="system-ui, -apple-system, serif" font-size="34" font-weight="bold" fill="${dish.text}" text-anchor="middle">${dish.title}</text>
  <text x="400" y="515" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${dish.text}" fill-opacity="0.7" text-anchor="middle">TasteCraft Quality Verified</text>
</svg>`;

  fs.writeFileSync(path.join(assetsDir, dish.name), svg, 'utf-8');
}

console.log('Seed assets generated successfully in scripts/seed-assets/');
