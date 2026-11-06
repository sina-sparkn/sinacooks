import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve(process.cwd(), 'scripts/seed-assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const dishes = [
  { name: 'pancakes.svg', title: 'Fluffy Blueberry Pancakes', code: 'BP', bg: '#fef3c7', text: '#92400e' },
  { name: 'carbonara.svg', title: 'Spaghetti Carbonara', code: 'SC', bg: '#fef9c3', text: '#854d0e' },
  { name: 'pizza.svg', title: 'Margherita Pizza', code: 'MP', bg: '#fee2e2', text: '#991b1b' },
  { name: 'quinoa-salad.svg', title: 'Mediterranean Quinoa Salad', code: 'QS', bg: '#dcfce7', text: '#166534' },
  { name: 'tikka-masala.svg', title: 'Chicken Tikka Masala', code: 'TM', bg: '#ffedd5', text: '#9a3412' },
  { name: 'lentil-soup.svg', title: 'Golden Lentil Soup', code: 'LS', bg: '#fef08a', text: '#713f12' },
  { name: 'fish-tacos.svg', title: 'Baja Fish Tacos', code: 'FT', bg: '#e0e7ff', text: '#3730a3' },
  { name: 'smoothie.svg', title: 'Green Glow Detox Smoothie', code: 'GS', bg: '#d1fae5', text: '#065f46' },
  { name: 'cookies.svg', title: 'Chocolate Chip Cookies', code: 'CC', bg: '#fed7aa', text: '#7c2d12' },
  { name: 'stir-fry.svg', title: 'Garlic Sesame Stir-Fry', code: 'SF', bg: '#fae8ff', text: '#86198f' },
];

for (const dish of dishes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${dish.bg}"/>
  <circle cx="400" cy="270" r="140" fill="#ffffff" fill-opacity="0.85" stroke="${dish.text}" stroke-width="2" stroke-dasharray="6,6"/>
  <text x="400" y="295" font-family="serif" font-size="72" font-weight="bold" fill="${dish.text}" text-anchor="middle" letter-spacing="4">${dish.code}</text>
  <text x="400" y="470" font-family="serif" font-size="34" font-weight="bold" fill="${dish.text}" text-anchor="middle">${dish.title}</text>
  <text x="400" y="515" font-family="sans-serif" font-size="16" font-weight="500" fill="${dish.text}" fill-opacity="0.75" text-anchor="middle" letter-spacing="2">RECIFOOD CULINARY ARCHIVE</text>
</svg>`;

  fs.writeFileSync(path.join(assetsDir, dish.name), svg);
}

console.log('Generated 10 placeholder assets in scripts/seed-assets/');
