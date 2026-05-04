const SAWService = require("../services/spk/saw.service");
const SMARTService = require("../services/spk/smart.service");
const WPService = require("../services/spk/wp.service");
const TOPSISService = require("../services/spk/topsis.service");
const ResultRepository = require("../repositories/result.repository");

class SPKController {
  static async calculateSAW(req, res) {
    try {
      const rankedResults = await SAWService.calculate(req.params.case_id);
      res
        .status(200)
        .json({ message: "Kalkulasi SAW berhasil", data: rankedResults });
    } catch (error) {
      console.error("Error SAW:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async calculateSMART(req, res) {
    try {
      const rankedResults = await SMARTService.calculate(req.params.case_id);
      res
        .status(200)
        .json({ message: "Kalkulasi SMART berhasil", data: rankedResults });
    } catch (error) {
      console.error("Error SMART:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async calculateWP(req, res) {
    try {
      const rankedResults = await WPService.calculate(req.params.case_id);
      res
        .status(200)
        .json({ message: "Kalkulasi WP berhasil", data: rankedResults });
    } catch (error) {
      console.error("Error WP:", error);
      res.status(400).json({ error: error.message });
    }
  }

  static async calculateTOPSIS(req, res) {
    try {
      const rankedResults = await TOPSISService.calculate(req.params.case_id);
      res
        .status(200)
        .json({ message: "Kalkulasi TOPSIS berhasil", data: rankedResults });
    } catch (error) {
      console.error("Error TOPSIS:", error);
      res.status(400).json({ error: error.message });
    }
  }

  // ... masukkan di dalam class SPKController:
  static async getCalculationResults(req, res) {
    try {
      const { case_id } = req.params;
      const method = req.query.method || "SAW"; // Default ke SAW

      const results = await ResultRepository.getResultsByCaseId(
        case_id,
        method.toUpperCase(),
      );

      if (results.length === 0) {
        return res
          .status(404)
          .json({
            message: `Belum ada hasil kalkulasi untuk metode ${method}`,
          });
      }
      res
        .status(200)
        .json({ message: `Berhasil mengambil hasil ${method}`, data: results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SPKController;
