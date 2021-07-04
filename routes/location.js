const express = require('express');
const router  = express.Router();
const getGeoJsonLocation = require ('../controllers/get-location');


router.post('/get-geo', (req, res, next) => {
  debugger
    let theAddress = req.body.address
    console.log(theAddress)
  getGeoJsonLocation(theAddress)
  .then((res) => {
    
    res.json(res)
  }).catch((err) => {
    res.json({error: err})
  });
  
});

module.exports = router;