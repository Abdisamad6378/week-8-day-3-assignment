// Only this file starts the server. app.js just builds and exports the app,
// so Supertest can use it without opening a real port.
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
