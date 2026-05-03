const CriteriaRepository = require('../../repositories/criteria.repository');
const AlternativeRepository = require('../../repositories/alternative.repository');
const ResultRepository = require('../../repositories/result.repository');

class WPService {
    static async calculate(caseId) {
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const alternatives = await AlternativeRepository.findByCaseId(caseId);

        if (!criteriaList.length || !alternatives.length) throw new Error('Data tidak lengkap');

        // 1. Normalisasi Bobot Kriteria (W)
        const totalWeight = criteriaList.reduce((sum, c) => sum + c.weight, 0);
        const wWeights = {};
        criteriaList.forEach(c => {
            let w = c.weight / totalWeight;
            // Jika cost, pangkatnya negatif
            if (c.criteria_type === 'cost') w = -w;
            wWeights[c.criteria_id] = w;
        });

        // 2. Hitung Vektor S
        let totalS = 0;
        const vectorS = alternatives.map(alt => {
            let sValue = 1;
            criteriaList.forEach(c => {
                const valObj = alt.criteria_values.find(v => v.criteria_id === c.criteria_id);
                // Menghindari nilai 0 karena akan membuat hasil perkalian jadi 0
                const x = (valObj && valObj.value > 0) ? valObj.value : 0.0001; 
                sValue *= Math.pow(x, wWeights[c.criteria_id]);
            });
            totalS += sValue;
            return { alt_id: alt.alternative_id, name: alt.alternative_name, sValue };
        });

        // 3. Hitung Vektor V (Skor Akhir)
        const finalScores = vectorS.map(item => ({
            alternative_id: item.alt_id,
            alternative_name: item.name,
            score: totalS === 0 ? 0 : item.sValue / totalS
        }));

        // Urutkan dan Simpan
        finalScores.sort((a, b) => b.score - a.score);
        const resultsData = finalScores.map((item, index) => ({
            alternative_id: item.alternative_id,
            score: parseFloat(item.score.toFixed(4)),
            ranking: index + 1
        }));

        await ResultRepository.saveBatchResults(caseId, 'WP', resultsData);
        return resultsData;
    }
}
module.exports = WPService;