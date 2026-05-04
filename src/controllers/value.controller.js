const ValueRepository = require('../repositories/value.repository');

class ValueController {
    static async saveAlternativeValues(req, res) {
        try {
            const { alternative_id, values } = req.body;

            if (!alternative_id || !Array.isArray(values) || values.length === 0) {
                return res.status(400).json({ error: 'alternative_id dan array values wajib diisi' });
            }

            const savedData = await ValueRepository.saveValues(alternative_id, values);
            
            res.status(201).json({
                message: 'Nilai alternatif berhasil disimpan/diperbarui',
                data: savedData
            });
        } catch (error) {
            console.error('Error save values:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan nilai' });
        }
    }

    static async getValues(req, res) {
        try {
            const { case_id } = req.params;
            const values = await ValueRepository.getValuesByCaseId(case_id);
            
            res.status(200).json({
                message: 'Berhasil mengambil matriks nilai',
                data: values
            });
        } catch (error) {
            console.error('Error get values:', error);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengambil nilai' });
        }
    }
}

module.exports = ValueController;