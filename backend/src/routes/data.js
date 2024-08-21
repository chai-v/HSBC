import express from 'express';
import db from '../../src/utils/db.js';
import { authenticateToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM transactions where age is not null';
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching PostgreSQL data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/categories', authenticateToken, async(req, res) => {
    try{
        const query = 'SELECT category, count(*) as count FROM transactions group by category';
        const result = await db.query(query);
        res.json(result.rows);
    } catch(error) {
        console.error('Error fetching PostgreSQL data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/data', authenticateToken, async (req, res) => {
    const { step, customer, age, gender, zipcodeOri, merchant, zipMerchant, category, amount, fraud } = req.body;

    if (!step || !customer || !age || !gender || !zipcodeOri || !merchant || !zipMerchant || !category || amount === undefined || fraud === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO transactions (step, customer, age, gender, zipcodeori, merchant, zipmerchant, category, amount, fraud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
        const values = [step, customer, age, gender, zipcodeOri, merchant, zipMerchant, category, amount, fraud];

        await db.query(query, values);
        res.status(201).json({ message: 'Data added successfully' });
    } catch (error) {
        console.error('Error adding data to PostgreSQL:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;