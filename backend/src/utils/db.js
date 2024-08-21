import pkg from 'pg';
import fs from 'fs';
const { Client } = pkg;
import { parse } from 'csv-parse';

import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const client = new Client({
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: true
});

async function connect(){
    try{
        await client.connect();
        console.log("Connected to Neon Postgres")
    } catch(error) {
        console.log(`Error connecting to Postgres: ${error}`);
    }
}

connect();

const dataArray = [];

const filePath = '../HSBC.csv';

const parser = parse({columns:true})

parser.on('readable', function() {
    let record;
    while ((record = parser.read()) !== null) {
        dataArray.push(record);
    }
});

parser.on('end', async function() {
    console.log('CSV Data stored in array:', dataArray);
    await insertData(dataArray);
});

parser.on('error', function(err) {
    console.error('Error reading CSV:', err);
});

//fs.createReadStream(filePath).pipe(parser);

async function insertData(data) {
    try {
        const query = `INSERT INTO transactions (step, customer, age, gender, zipcodeOri, merchant, zipMerchant, category, amount, fraud)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`;

        const promises = data.map(row => {
            const step = parseInt(row.step.replace(/'/g, "")) || 0;
            const age = parseInt(row.age.replace(/'/g, "")) || null;
            const amount = parseFloat(row.amount.replace(/'/g, "")) || 0;

            const values = [
                step,
                row.customer.replace(/'/g, ""),
                age,
                row.gender.replace(/'/g, ""),
                row.zipcodeOri.replace(/'/g, ""),
                row.merchant.replace(/'/g, ""),
                row.zipMerchant.replace(/'/g, ""),
                row.category.replace(/'/g, "").substr(3),
                amount,
                row.fraud === '0' ? false : true,
            ];

            return client.query(query, values);
        });

        await Promise.all(promises);
        console.log("Values are inserted into the table");
    } catch (error) {
        console.log("Error inserting data into the table:", error);
    }
}


export default client;