const CriteriaRepository = require('../../repositories/criteria.repository');
const ComparisonRepository = require('../../repositories/comparison.repository');

// Random Index (RI) standar berdasarkan jumlah kriteria (n)
const RI_TABLE = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

class AHPService {
    static async calculateWeights(caseId) {
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const comparisons = await ComparisonRepository.getComparisons(caseId);

        const n = criteriaList.length;
        if (n < 2) throw new Error('AHP membutuhkan minimal 2 kriteria');

        // 1. Buat Matriks N x N
        const matrix = Array(n).fill(null).map(() => Array(n).fill(1)); // Isi diagonal dengan 1
        
        // Mapping kriteria_id ke index array
        const criteriaIndex = {};
        criteriaList.forEach((c, index) => {
            criteriaIndex[c.criteria_id] = index;
        });

        // 2. Isi nilai dari tabel comparisons (Bagian atas dan bawah diagonal)
        comparisons.forEach(comp => {
            const i = criteriaIndex[comp.criteria_1];
            const j = criteriaIndex[comp.criteria_2];
            
            matrix[i][j] = comp.comparison_value;
            matrix[j][i] = 1 / comp.comparison_value; // Nilai resiprokal
        });

        // 3. Hitung jumlah setiap kolom
        const colSums = Array(n).fill(0);
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                colSums[j] += matrix[i][j];
            }
        }

        // 4. Normalisasi matriks dan cari Eigen Vector (Bobot)
        const eigenVector = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                eigenVector[i] += (matrix[i][j] / colSums[j]);
            }
            eigenVector[i] = eigenVector[i] / n; // Rata-rata baris = Bobot kriteria
        }

        // 5. Validasi Konsistensi (Consistency Ratio - CR)
        let lambdaMax = 0;
        for (let i = 0; i < n; i++) {
            lambdaMax += colSums[i] * eigenVector[i];
        }

        const CI = (lambdaMax - n) / (n - 1);
        const RI = RI_TABLE[n] || 1.49;
        const CR = n > 2 ? CI / RI : 0; // Jika n <= 2, selalu konsisten

        const isConsistent = CR <= 0.1;

        // 6. Jika konsisten, update tabel criteria
        const weightsData = criteriaList.map((c, i) => ({
            criteria_id: c.criteria_id,
            weight: parseFloat(eigenVector[i].toFixed(4))
        }));

        if (isConsistent) {
            await ComparisonRepository.updateCriteriaWeights(weightsData);
        }

        return {
            consistency_ratio: parseFloat(CR.toFixed(4)),
            is_consistent: isConsistent,
            weights: weightsData,
            message: isConsistent 
                ? 'CR memenuhi syarat (<= 0.1). Bobot berhasil disimpan.' 
                : 'CR melebihi batas (>= 0.1). Penilaian tidak konsisten, bobot tidak disimpan.'
        };
    }

    static async calculateRanking(caseId) {
        const criteriaList = await CriteriaRepository.findByCaseId(caseId);
        const alternatives = await AlternativeRepository.findByCaseId(caseId);
        const altComparisons = await ComparisonRepository.getAltComparisons(caseId);

        const numAlt = alternatives.length;
        if (numAlt < 2) throw new Error('Dibutuhkan minimal 2 alternatif untuk perankingan AHP');
        if (criteriaList.some(c => c.weight === null || c.weight === 0)) {
            throw new Error('Bobot kriteria AHP belum dihitung. Jalankan kalkulasi kriteria terlebih dahulu.');
        }

        // Mapping ID ke index untuk mempermudah matriks
        const altIndex = {};
        alternatives.forEach((a, i) => altIndex[a.alternative_id] = i);

        const finalScoresArray = Array(numAlt).fill(0);

        // Lakukan perhitungan matriks UNTUK SETIAP KRITERIA
        for (const criteria of criteriaList) {
            const matrix = Array(numAlt).fill(null).map(() => Array(numAlt).fill(1));
            
            // Ambil perbandingan khusus kriteria ini
            const compsForCriteria = altComparisons.filter(c => c.criteria_id === criteria.criteria_id);
            
            compsForCriteria.forEach(comp => {
                const i = altIndex[comp.alternative_1];
                const j = altIndex[comp.alternative_2];
                matrix[i][j] = comp.comparison_value;
                matrix[j][i] = 1 / comp.comparison_value;
            });

            // Hitung Eigen Vector Alternatif untuk Kriteria ini
            const colSums = Array(numAlt).fill(0);
            for (let j = 0; j < numAlt; j++) {
                for (let i = 0; i < numAlt; i++) colSums[j] += matrix[i][j];
            }

            const altEigenVector = Array(numAlt).fill(0);
            for (let i = 0; i < numAlt; i++) {
                for (let j = 0; j < numAlt; j++) {
                    altEigenVector[i] += (matrix[i][j] / colSums[j]);
                }
                altEigenVector[i] /= numAlt;
            }

            // Sintesis Akhir: Skor Alternatif * Bobot Kriteria
            for (let i = 0; i < numAlt; i++) {
                finalScoresArray[i] += (altEigenVector[i] * criteria.weight);
            }
        }

        // Gabungkan skor akhir dengan data alternatif
        const finalResults = alternatives.map((alt, i) => ({
            alternative_id: alt.alternative_id,
            alternative_name: alt.alternative_name,
            score: finalScoresArray[i]
        }));

        // Urutkan (Ranking) dari nilai tertinggi
        finalResults.sort((a, b) => b.score - a.score);

        const resultsData = finalResults.map((item, index) => ({
            alternative_id: item.alternative_id,
            score: parseFloat(item.score.toFixed(4)),
            ranking: index + 1
        }));

        // Simpan ke database results dengan method 'AHP'
        await ResultRepository.saveBatchResults(caseId, 'AHP', resultsData);

        return resultsData;
    }
}

module.exports = AHPService;