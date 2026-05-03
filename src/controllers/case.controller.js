const CaseRepository = require('../repositories/case.repository');

class CaseController {
    static async createCase(req, res) {
        try {
            // req.user didapatkan dari authMiddleware
            const userId = req.user.user_id; 
            const { case_name, description } = req.body;

            if (!case_name) {
                return res.status(400).json({ error: 'Nama case wajib diisi' });
            }

            const newCase = await CaseRepository.create(userId, case_name, description);
            
            res.status(201).json({
                message: 'Decision case berhasil dibuat',
                data: newCase
            });
        } catch (error) {
            console.error('Error in createCase:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat membuat case' });
        }
    }

    static async getAllCases(req, res) {
        try {
            const userId = req.user.user_id;
            const cases = await CaseRepository.findAllByUserId(userId);
            
            res.status(200).json({
                message: 'Berhasil mengambil daftar case',
                data: cases
            });
        } catch (error) {
            console.error('Error in getAllCases:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data case' });
        }
    }

    static async getCaseById(req, res) {
        try {
            const caseId = req.params.id;
            const caseDetail = await CaseRepository.findById(caseId);

            if (!caseDetail) {
                return res.status(404).json({ error: 'Case tidak ditemukan' });
            }

            res.status(200).json({
                message: 'Berhasil mengambil detail case',
                data: caseDetail
            });
        } catch (error) {
            console.error('Error in getCaseById:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil detail case' });
        }
    }
}

module.exports = CaseController;