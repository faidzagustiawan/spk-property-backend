const ComparisonRepository = require('../repositories/comparison.repository');
const AHPService = require('../services/spk/ahp.service');

class AHPController {
    static async inputComparisons(req, res) {
        try {
            const { case_id, comparisons } = req.body;
            
            if (!case_id || !comparisons || !Array.isArray(comparisons)) {
                return res.status(400).json({ error: 'Data case_id dan array comparisons tidak valid' });
            }

            await ComparisonRepository.saveComparisons(case_id, comparisons);
            res.status(201).json({ message: 'Data perbandingan berpasangan berhasil disimpan' });
        } catch (error) {
            console.error('Error input comparisons:', error);
            res.status(500).json({ error: 'Gagal menyimpan data perbandingan' });
        }
    }

    static async calculateAHP(req, res) {
        try {
            const caseId = req.params.case_id;
            const result = await AHPService.calculateWeights(caseId);

            res.status(200).json({
                message: 'Proses AHP selesai',
                data: result
            });
        } catch (error) {
            console.error('Error calculate AHP:', error);
            res.status(500).json({ error: error.message || 'Gagal menghitung bobot AHP' });
        }
    }

    static async inputAltComparisons(req, res) {
        try {
            const { case_id, comparisons } = req.body;
            if (!case_id || !Array.isArray(comparisons)) {
                return res.status(400).json({ error: 'Data tidak valid' });
            }

            await ComparisonRepository.saveAltComparisons(case_id, comparisons);
            res.status(201).json({ message: 'Data perbandingan alternatif berhasil disimpan' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async calculateAHPRanking(req, res) {
        try {
            const caseId = req.params.case_id;
            const rankedResults = await AHPService.calculateRanking(caseId);

            res.status(200).json({
                message: 'Perankingan AHP Murni berhasil diselesaikan',
                data: rankedResults
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
}

module.exports = AHPController;