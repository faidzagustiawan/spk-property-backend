const CriteriaRepository = require('../../repositories/criteria.repository');
const AlternativeRepository = require('../../repositories/alternative.repository');
const ResultRepository = require('../../repositories/result.repository');

class SMARTService {
    static async calculate(caseId) {
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const alternatives = await AlternativeRepository.findByCaseId(caseId);

        if (!criteriaList.length || !alternatives.length) throw new Error('Data tidak lengkap');

        // 1. Normalisasi Bobot Kriteria (Total Bobot = 1)
        const totalWeight = criteriaList.reduce((sum, c) => sum + c.weight, 0);
        const normalizedWeights = {};
        criteriaList.forEach(c => normalizedWeights[c.criteria_id] = c.weight / totalWeight);

        // 2. Cari Max dan Min tiap kriteria
        const minMax = {};
        criteriaList.forEach(c => {
            let max = -Infinity, min = Infinity;
            alternatives.forEach(a => {
                const valObj = a.criteria_values.find(v => v.criteria_id === c.criteria_id);
                if (valObj) {
                    if (valObj.value > max) max = valObj.value;
                    if (valObj.value < min) min = valObj.value;
                }
            });
            minMax[c.criteria_id] = { max, min };
        });

        // 3. Hitung Utility dan Skor Akhir
        const finalScores = alternatives.map(alt => {
            let totalScore = 0;
            criteriaList.forEach(c => {
                const valObj = alt.criteria_values.find(v => v.criteria_id === c.criteria_id);
                if (!valObj) return;

                const { max, min } = minMax[c.criteria_id];
                let utility = 0;
                
                // Mencegah pembagian dengan nol jika max = min
                if (max !== min) {
                    if (c.criteria_type === 'benefit') {
                        utility = (valObj.value - min) / (max - min);
                    } else if (c.criteria_type === 'cost') {
                        utility = (max - valObj.value) / (max - min);
                    }
                } else {
                    utility = 1; 
                }

                totalScore += (utility * normalizedWeights[c.criteria_id]);
            });

            return {
                alternative_id: alt.alternative_id,
                alternative_name: alt.alternative_name,
                score: totalScore
            };
        });

        // Urutkan dan Simpan
        finalScores.sort((a, b) => b.score - a.score);
        const resultsData = finalScores.map((item, index) => ({
            alternative_id: item.alternative_id,
            score: parseFloat(item.score.toFixed(4)),
            ranking: index + 1
        }));

        await ResultRepository.saveBatchResults(caseId, 'SMART', resultsData);
        return resultsData;
    }
}
module.exports = SMARTService;