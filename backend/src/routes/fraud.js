import express from 'express';
import db from '../../src/utils/db.js';

const router = express.Router();

router.get("/count", async (req, res) => {
    try {
        const query = 'SELECT count(*) FROM transactions where fraud=true';
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching PostgreSQL data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

export default router;