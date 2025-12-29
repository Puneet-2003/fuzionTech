const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validationMiddleware');
const { authSchemas } = require('../utils/validators');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', validate(authSchemas.signup), authController.signup);
router.post('/login', validate(authSchemas.login), authController.login);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
