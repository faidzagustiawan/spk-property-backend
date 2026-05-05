const CaseRepository = require("../repositories/case.repository");

class CaseController {
  static async createCase(req, res) {
    try {
      // req.user didapatkan dari authMiddleware
      const userId = req.user.user_id;
      const { case_name, description } = req.body;

      if (!case_name) {
        return res.status(400).json({ error: "Nama case wajib diisi" });
      }

      const newCase = await CaseRepository.create(
        userId,
        case_name,
        description,
      );

      res.status(201).json({
        message: "Decision case berhasil dibuat",
        data: newCase,
      });
    } catch (error) {
      console.error("Error in createCase:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat membuat case" });
    }
  }

  static async getAllCases(req, res) {
    try {
      const userId = req.user.user_id;
      const cases = await CaseRepository.findAllByUserId(userId);

      res.status(200).json({
        message: "Berhasil mengambil daftar case",
        data: cases,
      });
    } catch (error) {
      console.error("Error in getAllCases:", error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat mengambil data case" });
    }
  }

  static async getCaseById(req, res) {
    try {
      const caseId = req.params.id;
      const caseDetail = await CaseRepository.findById(caseId);

      if (!caseDetail) {
        return res.status(404).json({ error: "Case tidak ditemukan" });
      }

      res.status(200).json({
        message: "Berhasil mengambil detail case",
        data: caseDetail,
      });
    } catch (error) {
      console.error("Error in getCaseById:", error);
      res
        .status(500)
        .json({ error: "Terjadi kesalahan saat mengambil detail case" });
    }
  }
  static async updateCase(req, res) {
    try {
      const { case_name, description } = req.body;
      const updatedCase = await CaseRepository.update(
        req.params.id,
        req.user.user_id,
        case_name,
        description,
      );
      if (!updatedCase)
        return res
          .status(404)
          .json({ error: "Case tidak ditemukan/tidak ada akses" });
      res.status(200).json({ message: "Case diperbarui", data: updatedCase });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCase(req, res) {
    try {
      await CaseRepository.delete(req.params.id, req.user.user_id);
      res
        .status(200)
        .json({
          message: "Case beserta seluruh datanya berhasil dihapus permanen",
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateCaseStep(req, res) {
    try {
      const caseId = req.params.id;
      const { current_step } = req.body;

      // Mengambil userId dari token JWT (tergantung setup authMiddleware kamu)
      // Biasanya disimpan di req.user.id atau req.userId
      console.log("Isi req.user adalah:", req.user);
      console.log("Case ID:", caseId, "Step:", current_step);

      // 2. CEK APAKAH HARUS req.user.id ATAU req.user.user_id ATAU req.userId
      const userId = req.user.user_id;

      // Validasi input
      if (!current_step) {
        return res.status(400).json({
          success: false,
          message: "Atribut current_step wajib dikirim",
        });
      }

      // Eksekusi fungsi updateStep di Repository
      const updatedCase = await CaseRepository.updateStep(
        caseId,
        userId,
        current_step,
      );

      // Jika tidak ada baris yang di-return, berarti case tidak ada atau bukan milik user ini
      if (!updatedCase) {
        return res.status(404).json({
          success: false,
          message: "Case tidak ditemukan atau Anda tidak memiliki akses",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Progress step berhasil diperbarui",
        data: updatedCase,
      });
    } catch (error) {
      console.error("Gagal update step:", error.message);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server saat mengupdate step",
      });
    }
  }
}

module.exports = CaseController;
