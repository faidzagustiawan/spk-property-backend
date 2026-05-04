const express = require('express');
const router = express.Router();
const ValueController = require('../controllers/value.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// POST /api/v1/values
router.post('/', ValueController.saveAlternativeValues);

// GET /api/v1/values/:case_id
router.get('/:case_id', ValueController.getValues);

module.exports = router;