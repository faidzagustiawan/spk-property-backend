const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express'); // 1. Import Swagger UI
const swaggerDocument = require('./swagger.json'); // 2. Import file JSON

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('API SPK PROPERTY RUNNING');
});

// 3. Pasang Swagger UI pada route /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Bisa bray' });
});

// === DAFTARKAN ROUTES DI SINI ===
const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const criteriaRoutes = require('./routes/criteria.routes');
const alternativeRoutes = require('./routes/alternative.routes');
const spkRoutes = require('./routes/spk.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/criteria', criteriaRoutes);
app.use('/api/v1/alternatives', alternativeRoutes);
app.use('/api/v1/spk', spkRoutes);
// ===============================

// Middleware Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

module.exports = app;