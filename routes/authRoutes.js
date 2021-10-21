const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')

router.get("/login", authController.getLogin)
router.post("/login",authController.postLogin);

router.get("/authenticate",authController.authenticate);

router.post('/logout', authController.logout);

module.exports = router;