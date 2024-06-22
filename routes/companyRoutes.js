const express = require('express');
const {
  getCompanies,
  addCompany,
  deleteCompanies,
  getCompanyDetails,
} = require('../controllers/companyController');


const router = express.Router();

router.get('/getCompanies', getCompanies);
router.post('/addCompany', addCompany);
router.delete('/deleteCompanies', deleteCompanies);
router.get('/getCompanyDetails/:id', getCompanyDetails);

module.exports = router;
