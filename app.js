const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "database". It resets every time the app restarts.
const seedProducts = [
  { id: 1, name: 'Ketepa Tea', price: 300 },
  { id: 2, name: 'Tusker Lager', price: 250 },
  { id: 3, name: 'Jogoo Maize Flour', price: 180 },
];

let products = [];
let nextId = 1;

// Puts the starting products back. Tests call this so each test starts from the same data.
function resetProducts() {
  products = seedProducts.map((p) => ({ ...p }));
  nextId = seedProducts.length + 1;
}
resetProducts();

// GET /api/products - all products
app.get('/api/products', (req, res) => {
  res.status(200).json(products);
});

// POST /api/products - create a product (name and price are required)
app.post('/api/products', (req, res) => {
  const { name, price } = req.body || {};

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'Price is required and must be a positive number' });
  }

  const product = { id: nextId++, name: name.trim(), price };
  products.push(product);
  res.status(201).json(product);
});

// GET /api/products/:id - one product
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(200).json(product);
});

// DELETE /api/products/:id - remove a product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products.splice(index, 1);
  res.status(204).send(); // 204 = success, no body
});

module.exports = app;
module.exports.resetProducts = resetProducts;
