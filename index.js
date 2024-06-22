require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');



const app = express();


//Ensure the directory for screenshots exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

app.use(bodyParser.json());
app.use(cors());

// Routes
const companyRoutes = require('./routes/companyRoutes');
app.use('/api/companies', companyRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB Atlas connection string
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.l7qhl3q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri, {
 
}).then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection failed:', error);
});

