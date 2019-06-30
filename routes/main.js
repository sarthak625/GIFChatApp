const router = require('express').Router();
const giphy = require('../giphy/search');

router.get('/', (req,res) => {
    res.render('home');
});

module.exports = router;