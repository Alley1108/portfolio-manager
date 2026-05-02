const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initDB = require('./models/init');

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://portfolio-manager-seven-kohl.vercel.app',
    'https://portfolio-manager-iyjy6cb75-alley1108s-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/portfolio', require('./routes/portfolio'));

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio Manager API is running' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, async () => {
    await initDB();
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;