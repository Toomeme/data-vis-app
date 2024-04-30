const router = require('express').Router();
const utils = require('../../utils/utils');


// The `/api/spreadsheets` endpoint

router.get('/:item', async (req, res) => {
  const itemID = req.params.item;
  const objResponse = await utils.createKeyValuePairs(itemID,"{00000000-0001-0000-0100-000000000000}","{00000000-000C-0000-FFFF-FFFF0C000000}",0,0);
  res.send(objResponse);
})

router.get('/:item/:table/:sheet/:id', async (req, res) => {
  //get workbook by table and sheet id, then use date id to divide costs to daily
  const itemID = req.params.item;
  const tableID = req.params.table;
  const sheetID = req.params.sheet;
  const dateID = req.params.id;
  const objResponse = await utils.createKeyValuePairs(itemID,tableID,sheetID,1,dateID);
  res.send(objResponse);

});
module.exports = router;
