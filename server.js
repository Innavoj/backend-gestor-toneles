
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tonelRoutes = require('./src/routes/tonelRoutes');
const lotesRoutes = require('./src/routes/lotesRoutes');
const dispenserRoutes = require('./src/routes/dispenserRoutes');
const mttotonelRoutes = require('./src/routes/mttotonelRoutes');
const mttodispenserRoutes = require('./src/routes/mttodispenserRoutes');
const eventostonelRoutes = require('./src/routes/eventostonelRoutes');
// const dashboardRoutes = require('./src/routes/dashboardRoutes'); // Placeholder for future
// const accountsRoutes = require('./src/routes/accountsRoutes'); // Placeholder for future

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/toneles', tonelRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/dispenser', dispenserRoutes);
app.use('/api/mttotonel', mttotonelRoutes);
app.use('/api/mttodispenser', mttodispenserRoutes);
app.use('/api/eventostonel', eventostonelRoutes);

// app.use('/api/dashboard', dashboardRoutes); // Placeholder
// app.use('/api/accounts', accountsRoutes); // Placeholder

// Basic root route
app.get('/', (req, res) => {
  res.send('Gestor Toneles Pro Backend API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
