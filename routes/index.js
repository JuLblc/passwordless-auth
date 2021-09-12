const express = require('express');
const router  = express.Router();

/* GET index */
router.get('/', (req, res, next) => {
  res.render('index',{user:req.session.currentUser});
});

module.exports = router;
