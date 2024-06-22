

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');



const app = express();

const allowedOrigins = [
  'https://web-scrapping-nine.vercel.app',
  'http://localhost:5000',
  'http://localhost:5173/'
];


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));



//Ensure the directory for screenshots exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));
app.use(bodyParser.json());



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

