const Company = require('../models/company');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinaryConfig');

// Fetch all companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

const addCompany = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Ensure the directory for temporary screenshots exists
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Capture screenshot and save it temporarily
    const screenshotPath = path.join(tempDir, `${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    const data = await page.evaluate(() => {
      const getMetaContent = (name) => {
        const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="og:${name}"]`);
        return meta ? meta.content : '';
      };

      const getLinkHref = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.href : '';
      };

      const getElementText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : '';
      };

      // Attempt to parse JSON-LD structured data
      const parseJSONLD = () => {
        const script = document.querySelector('script[type="application/ld+json"]');
        if (script) {
          try {
            return JSON.parse(script.innerText);
          } catch (e) {
            console.error('Failed to parse JSON-LD', e);
            return {};
          }
        }
        return {};
      };

      const jsonLD = parseJSONLD();
      const address = jsonLD.address ? (jsonLD.address.streetAddress || '') : '';
      const phoneNumber = jsonLD.telephone || '';
      const email = jsonLD.email || '';

      // Get the first part of the title as company name
      const companyName = document.querySelector('title') ? document.querySelector('title').innerText.trim().split(' - ')[0] : '';

      return {
        name: companyName,
        description: getMetaContent('description'),
        logo: getLinkHref('link[rel="icon"]') || getLinkHref('link[rel="shortcut icon"]') || getLinkHref('link[rel="apple-touch-icon"]'),
        facebookUrl: getLinkHref('a[href*="facebook.com"]'),
        linkedinUrl: getLinkHref('a[href*="linkedin.com"]'),
        twitterUrl: getLinkHref('a[href*="twitter.com"]'),
        instagramUrl: getLinkHref('a[href*="instagram.com"]'),
        address: address || getElementText('address') || getElementText('.address') || getElementText('[itemprop="address"]'),
        phoneNumber: phoneNumber || getElementText('a[href^="tel:"]') || getElementText('.phone') || getElementText('[itemprop="telephone"]'),
        email: email || getElementText('a[href^="mailto:"]') || getElementText('.email') || getElementText('[itemprop="email"]'),
      };
    });

    await browser.close();

    // Upload the screenshot to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(screenshotPath);

    // Delete the temporary screenshot file
    fs.unlinkSync(screenshotPath);

    // Ensure default values for fields if any field is empty
    data.logo = data.logo || 'https://img.freepik.com/premium-vectorurl-icon-globe-sign-network-www-symbol_664675-1809.jpg?w=740';
    data.name = data.name || 'NotSite';
    data.description = data.description || 'This company is a leading provider in its industry, known for its commitment to quality and customer satisfaction.';
    data.facebookUrl = data.facebookUrl || 'https://facebook.com';
    data.linkedinUrl = data.linkedinUrl || 'https://linkedin.com';
    data.twitterUrl = data.twitterUrl || 'https://twitter.com';
    data.instagramUrl = data.instagramUrl || 'https://instagram.com';
    data.address = data.address || '123 Default Address, City, Country';
    data.phoneNumber = data.phoneNumber || '123-456-7890';
    data.email = data.email || 'info@example.com';

    // Add Cloudinary screenshot URL and original URL to the data
    data.screenshotUrl = cloudinaryResponse.secure_url;
    data.Url = url;

    const company = new Company(data);
    await company.save();

    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
};

// Delete multiple companies by their IDs
const deleteCompanies = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty IDs array' });
  }

  try {
    await Company.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: 'Companies deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete companies' });
  }

};


const getCompanyDetails = async (req, res) => {
  const { id } = req.params;
 

  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid company ID' });
  }

  try {
    // Attempt to find the company by ID in the database
    const company = await Company.findById(id);

    // If company is not found, respond with 404 Not Found
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // If company is found, respond with the company details
    res.json(company);
  } catch (error) {
    // Handle any unexpected errors with a 500 Internal Server Error response
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
};



module.exports = {
  getCompanies,
  addCompany,
  deleteCompanies,
  getCompanyDetails,
};
