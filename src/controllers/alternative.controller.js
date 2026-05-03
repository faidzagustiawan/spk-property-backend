const AlternativeRepository = require('../repositories/alternative.repository');

class AlternativeController {
    static async createAlternative(req, res) {
        try {
            const { case_id, alternative_name, description, values } = req.body;

            // Validasi Input
            if (!case_id || !alternative_name || !values || !Array.isArray(values) || values.length === 0) {
                return res.status(400).json({ 
                    error: 'case_id, alternative_name, dan array values (kriteria_id & value) wajib diisi' 
                });
            }

            const result = await AlternativeRepository.createWithValues(
                case_id, 
                alternative_name, 
                description, 
                values
            );

            res.status(201).json({
                message: 'Alternatif dan nilainya berhasil disimpan',
                data: result
            });
        } catch (error) {
            console.error('Error in createAlternative:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan alternatif' });
        }
    }

    static async getAlternativesByCase(req, res) {
        try {
            const caseId = req.params.case_id;
            const alternatives = await AlternativeRepository.findByCaseId(caseId);

            res.status(200).json({
                message: 'Berhasil mengambil daftar alternatif',
                data: alternatives
            });
        } catch (error) {
            console.error('Error in getAlternativesByCase:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil alternatif' });
        }
    }
}

module.exports = AlternativeController;