const CriteriaRepository = require('../repositories/criteria.repository');

class CriteriaController {
    static async createCriteria(req, res) {
        try {
            const { case_id, criteria_name, criteria_type, weight } = req.body;

            // Validasi input kosong
            if (!case_id || !criteria_name || !criteria_type || weight === undefined) {
                return res.status(400).json({ 
                    error: 'Semua field (case_id, criteria_name, criteria_type, weight) wajib diisi' 
                });
            }

            // Validasi tipe kriteria (hanya boleh benefit atau cost)
            const typeLower = criteria_type.toLowerCase();
            if (!['benefit', 'cost'].includes(typeLower)) {
                return res.status(400).json({ 
                    error: 'Tipe kriteria harus berupa "benefit" atau "cost"' 
                });
            }

            const newCriteria = await CriteriaRepository.create(
                case_id, 
                criteria_name, 
                typeLower, 
                weight
            );

            res.status(201).json({
                message: 'Kriteria berhasil ditambahkan',
                data: newCriteria
            });
        } catch (error) {
            console.error('Error in createCriteria:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat menambah kriteria' });
        }
    }

    static async getCriteriaByCase(req, res) {
        try {
            const caseId = req.params.case_id;
            const criteriaList = await CriteriaRepository.findByCaseId(caseId);

            res.status(200).json({
                message: 'Berhasil mengambil daftar kriteria',
                data: criteriaList
            });
        } catch (error) {
            console.error('Error in getCriteriaByCase:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil kriteria' });
        }
    }
}

module.exports = CriteriaController;