const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  address: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  email: { type: String, default: '' },
  screenshotUrl: { type: String, default: '' },
  Url: { type: String, required: true } // Added field for URL
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
