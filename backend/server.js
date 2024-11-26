// Disable dotenv in a production env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet');

// Routes import
const routes = require('./routes');

// Initialize express
const app = express();

// Port if PORT env variable does not exist in .env
const port = process.env.PORT || 3335;

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(helmet());

// Rota inicial
app.get('/', (req, res) => {
  res.send('Bem-vindo à API! Use /api para acessar as rotas disponíveis.');
});

// Routes middleware
app.use('/api', routes);

// Middleware para rotas inválidas
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Port listener
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
