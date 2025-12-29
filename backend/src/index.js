const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');


const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});