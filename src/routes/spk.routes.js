const express = require('express');
const router = express.Router();
const SPKController = require('../controllers/spk.controller');
const AHPController = require('../controllers/ahp.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// ==========================================
// RUTE AHP (Harus didefinisikan secara spesifik)
// ==========================================
router.post('/ahp/comparisons', AHPController.inputComparisons);
router.post('/ahp/calculate/:case_id', AHPController.calculateAHP);

// ==========================================
// RUTE METODE SPK LAINNYA
// ==========================================
router.post('/saw/:case_id', SPKController.calculateSAW);
router.post('/smart/:case_id', SPKController.calculateSMART);
router.post('/wp/:case_id', SPKController.calculateWP);
router.post('/topsis/:case_id', SPKController.calculateTOPSIS);

router.get('/results/:case_id', SPKController.getCalculationResults);

module.exports = router;