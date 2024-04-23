const router = require('express').Router();
const spreadsheetRoutes = require('./spreadsheet-routes');

router.use('/spreadsheets', spreadsheetRoutes);

module.exports = router;
