const SAWService = require('../services/spk/saw.service');
const SMARTService = require('../services/spk/smart.service');
const WPService = require('../services/spk/wp.service');
const TOPSISService = require('../services/spk/topsis.service');

class SPKController {
    static async calculateSAW(req, res) {
        try {
            const rankedResults = await SAWService.calculate(req.params.case_id);
            res.status(200).json({ message: 'Kalkulasi SAW berhasil', data: rankedResults });
        } catch (error) {
            console.error('Error SAW:', error);
            res.status(400).json({ error: error.message });
        }
    }

    static async calculateSMART(req, res) {
        try {
            const rankedResults = await SMARTService.calculate(req.params.case_id);
            res.status(200).json({ message: 'Kalkulasi SMART berhasil', data: rankedResults });
        } catch (error) {
            console.error('Error SMART:', error);
            res.status(400).json({ error: error.message });
        }
    }

    static async calculateWP(req, res) {
        try {
            const rankedResults = await WPService.calculate(req.params.case_id);
            res.status(200).json({ message: 'Kalkulasi WP berhasil', data: rankedResults });
        } catch (error) {
            console.error('Error WP:', error);
            res.status(400).json({ error: error.message });
        }
    }

    static async calculateTOPSIS(req, res) {
        try {
            const rankedResults = await TOPSISService.calculate(req.params.case_id);
            res.status(200).json({ message: 'Kalkulasi TOPSIS berhasil', data: rankedResults });
        } catch (error) {
            console.error('Error TOPSIS:', error);
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = SPKController;