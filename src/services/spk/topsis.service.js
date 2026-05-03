const CriteriaRepository = require('../../repositories/criteria.repository');
const AlternativeRepository = require('../../repositories/alternative.repository');
const ResultRepository = require('../../repositories/result.repository');

class TOPSISService {
    static async calculate(caseId) {
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const alternatives = await AlternativeRepository.findByCaseId(caseId);

        if (!criteriaList.length || !alternatives.length) throw new Error('Data tidak lengkap');

        // 1. Hitung Pembagi (Akar Kuadrat Jumlah Kuadrat)
        const dividers = {};
        criteriaList.forEach(c => {
            let sumSq = 0;
            alternatives.forEach(a => {
                const valObj = a.criteria_values.find(v => v.criteria_id === c.criteria_id);
                const x = valObj ? valObj.value : 0;
                sumSq += (x * x);
            });
            dividers[c.criteria_id] = Math.sqrt(sumSq);
        });

        // 2. Matriks Keputusan Ternormalisasi Terbobot (Y) & Cari Solusi Ideal (A+, A-)
        const idealPos = {};
        const idealNeg = {};
        criteriaList.forEach(c => {
            idealPos[c.criteria_id] = c.criteria_type === 'benefit' ? -Infinity : Infinity;
            idealNeg[c.criteria_id] = c.criteria_type === 'benefit' ? Infinity : -Infinity;
        });

        const yMatrix = alternatives.map(alt => {
            const yVals = {};
            criteriaList.forEach(c => {
                const valObj = alt.criteria_values.find(v => v.criteria_id === c.criteria_id);
                const x = valObj ? valObj.value : 0;
                
                // Normalisasi terbobot
                const y = dividers[c.criteria_id] === 0 ? 0 : (x / dividers[c.criteria_id]) * c.weight;
                yVals[c.criteria_id] = y;

                // Tentukan A+ dan A-
                if (c.criteria_type === 'benefit') {
                    if (y > idealPos[c.criteria_id]) idealPos[c.criteria_id] = y;
                    if (y < idealNeg[c.criteria_id]) idealNeg[c.criteria_id] = y;
                } else { // Cost
                    if (y < idealPos[c.criteria_id]) idealPos[c.criteria_id] = y;
                    if (y > idealNeg[c.criteria_id]) idealNeg[c.criteria_id] = y;
                }
            });
            return { alt_id: alt.alternative_id, name: alt.alternative_name, yVals };
        });

        // 3. Hitung Jarak Euclidean (D+, D-) dan Preferensi (V)
        const finalScores = yMatrix.map(alt => {
            let dPosSq = 0;
            let dNegSq = 0;

            criteriaList.forEach(c => {
                const y = alt.yVals[c.criteria_id];
                dPosSq += Math.pow(y - idealPos[c.criteria_id], 2);
                dNegSq += Math.pow(y - idealNeg[c.criteria_id], 2);
            });

            const dPos = Math.sqrt(dPosSq);
            const dNeg = Math.sqrt(dNegSq);

            // V = D- / (D+ + D-)
            const vScore = (dPos + dNeg) === 0 ? 0 : dNeg / (dPos + dNeg);

            return {
                alternative_id: alt.alt_id,
                alternative_name: alt.name,
                score: vScore
            };
        });

        // Urutkan dan Simpan
        finalScores.sort((a, b) => b.score - a.score);
        const resultsData = finalScores.map((item, index) => ({
            alternative_id: item.alternative_id,
            score: parseFloat(item.score.toFixed(4)),
            ranking: index + 1
        }));

        await ResultRepository.saveBatchResults(caseId, 'TOPSIS', resultsData);
        return resultsData;
    }
}
module.exports = TOPSISService;