const express = require('express');
const router = express.Router();
const AlternativeController = require('../controllers/alternative.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', AlternativeController.createAlternative);
router.get('/:case_id', AlternativeController.getAlternativesByCase);

module.exports = router;