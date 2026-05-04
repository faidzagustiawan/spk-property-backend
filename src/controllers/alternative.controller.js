const AlternativeRepository = require('../repositories/alternative.repository');

class AlternativeController {
    static async createAlternative(req, res) {
        try {
            // Hapus 'values' dari destructuring req.body
            const { case_id, alternative_name, description } = req.body;

            // Validasi Input disederhanakan
            if (!case_id || !alternative_name) {
                return res.status(400).json({ 
                    error: 'case_id dan alternative_name wajib diisi' 
                });
            }

            // Panggil fungsi create yang baru
            const result = await AlternativeRepository.create(
                case_id, 
                alternative_name, 
                description
            );

            res.status(201).json({
                message: 'Alternatif berhasil dibuat',
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

    // Tambahan fungsi Update
    static async updateAlternative(req, res) {
        try {
            const { alternative_name, description } = req.body;
            const updated = await AlternativeRepository.update(req.params.id, alternative_name, description);
            res.status(200).json({ message: 'Alternatif diperbarui', data: updated });
        } catch (error) { 
            res.status(500).json({ error: error.message }); 
        }
    }

    static async deleteAlternative(req, res) {
        try {
            await AlternativeRepository.delete(req.params.id);
            res.status(200).json({ message: 'Alternatif berhasil dihapus' });
        } catch (error) { 
            res.status(500).json({ error: error.message }); 
        }
    }
}

module.exports = AlternativeController;