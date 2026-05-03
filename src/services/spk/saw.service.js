const CriteriaRepository = require('../../repositories/criteria.repository');
const AlternativeRepository = require('../../repositories/alternative.repository');
const ResultRepository = require('../../repositories/result.repository');

class SAWService {
    static async calculate(caseId) {
        // 1. Ambil data kriteria dan alternatif
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const alternatives = await AlternativeRepository.findByCaseId(caseId);

        if (!criteriaList.length || !alternatives.length) {
            throw new Error('Data kriteria atau alternatif belum lengkap');
        }

        // 2. Cari Nilai Max dan Min untuk setiap kriteria
        const minMaxValues = {};
        criteriaList.forEach(c => {
            let max = -Infinity;
            let min = Infinity;
            
            alternatives.forEach(a => {
                const valObj = a.criteria_values.find(v => v.criteria_id === c.criteria_id);
                if (valObj) {
                    if (valObj.value > max) max = valObj.value;
                    if (valObj.value < min) min = valObj.value;
                }
            });
            
            minMaxValues[c.criteria_id] = { max, min };
        });

        // 3. Normalisasi dan Hitung Skor Akhir
        const finalScores = alternatives.map(alt => {
            let totalScore = 0;

            criteriaList.forEach(c => {
                const valObj = alt.criteria_values.find(v => v.criteria_id === c.criteria_id);
                if (!valObj) return;

                const rawValue = valObj.value;
                let normalizedValue = 0;

                // Logika Normalisasi
                if (c.criteria_type === 'benefit') {
                    normalizedValue = rawValue / minMaxValues[c.criteria_id].max;
                } else if (c.criteria_type === 'cost') {
                    normalizedValue = minMaxValues[c.criteria_id].min / rawValue;
                }

                // Hitung skor berdasarkan bobot (weight)
                totalScore += (normalizedValue * c.weight);
            });

            return {
                alternative_id: alt.alternative_id,
                alternative_name: alt.alternative_name,
                score: totalScore
            };
        });

        // 4. Urutkan berdasarkan skor tertinggi untuk mendapatkan Ranking
        finalScores.sort((a, b) => b.score - a.score);

        const resultsData = finalScores.map((item, index) => ({
            alternative_id: item.alternative_id,
            score: parseFloat(item.score.toFixed(4)), // Bulatkan 4 angka di belakang koma
            ranking: index + 1
        }));

        // 5. Simpan ke database
        await ResultRepository.saveBatchResults(caseId, 'SAW', resultsData);

        // Gabungkan hasil kalkulasi dengan nama alternatif untuk response API
        return finalScores.map((item, index) => ({
            ...item,
            score: parseFloat(item.score.toFixed(4)),
            ranking: index + 1
        }));
    }
}

module.exports = SAWService;