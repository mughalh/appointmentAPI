const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');

router.post('/signup', authValidation.signup, signup);
router.post('/login', authValidation.login, login);
router.get('/profile', protect, getProfile);

module.exports = router;