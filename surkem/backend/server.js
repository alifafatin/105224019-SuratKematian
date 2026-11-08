const express = require('express');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const wargaRoutes = require('./src/routes/warga');
const reportRoutes = require('./src/routes/reports');
const { getEncryptionKey } = require('./src/security/sensitive-data');

const app = express();
const PORT = process.env.PORT || 5000;

getEncryptionKey();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Backend Surkem Berjalan!');
});

app.use('/api/auth', authRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});