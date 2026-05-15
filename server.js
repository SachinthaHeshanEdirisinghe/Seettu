const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const groupRoutes = require('./routes/groupRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const cors = require('cors');

dotenv.config();
const app = express();
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log(err));

// Routes
app.use(cors()); 
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));