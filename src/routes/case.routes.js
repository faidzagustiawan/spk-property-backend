const express = require('express');
const router = express.Router();
const CaseController = require('../controllers/case.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Semua route di bawah ini wajib pakai token (terproteksi)
router.use(authMiddleware);

router.post('/', CaseController.createCase);
router.get('/', CaseController.getAllCases);
router.get('/:id', CaseController.getCaseById);

module.exports = router;