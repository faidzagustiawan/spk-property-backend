const express = require('express');
const router = express.Router();
const CriteriaController = require('../controllers/criteria.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware); // Proteksi rute dengan JWT

router.post('/', CriteriaController.createCriteria);
router.get('/:case_id', CriteriaController.getCriteriaByCase);

module.exports = router;