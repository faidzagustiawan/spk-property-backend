const db = require('../config/db');

class CaseRepository {
    // Membuat case baru
    static async create(userId, caseName, description) {
        const query = `
            INSERT INTO decision_case (user_id, case_name, description) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const values = [userId, caseName, description];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    // Mengambil semua case berdasarkan user
    static async findAllByUserId(userId) {
        const query = `
            SELECT * FROM decision_case 
            WHERE user_id = $1 
            ORDER BY created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    // Mengambil detail satu case beserta kriterianya
    static async findById(caseId) {
        const query = `
            SELECT 
                dc.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'criteria_id', c.criteria_id,
                            'criteria_name', c.criteria_name,
                            'criteria_type', c.criteria_type,
                            'weight', c.weight
                        )
                    ) FILTER (WHERE c.criteria_id IS NOT NULL), '[]'
                ) as criteria
            FROM decision_case dc
            LEFT JOIN criteria c ON dc.case_id = c.case_id
            WHERE dc.case_id = $1
            GROUP BY dc.case_id;
        `;
        const { rows } = await db.query(query, [caseId]);
        return rows[0];
    }
}

module.exports = CaseRepository;