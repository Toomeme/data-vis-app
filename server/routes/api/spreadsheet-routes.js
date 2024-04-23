const router = require('express').Router();
const utils = require('../../utils/utils');


// The `/api/spreadsheets` endpoint

router.get('/', (req, res) => {
  const objResponse = utils.createKeyValuePairs("00000000-0001-0000-0100-000000000000","00000000-000C-0000-FFFF-FFFF0C000000");
  res.send(objResponse);
})

router.get('/:table/:sheet/:id', (req, res) => {
  //get workbook by table and sheet id, then use date id to divide costs to daily
  const tableID = req.params.table;
  const sheetID = req.params.sheet;
  const dateID = req.params.id;
  const objResponse = utils.createKeyValuePairs(tableID,sheetID);
  const daysObject = utils.breakdownToDays(objResponse,dateID);
  res.send(daysObject);

});
module.exports = router;
