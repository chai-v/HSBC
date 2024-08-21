import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from '../src/utils/db.js'
import data from "../src/routes/data.js";
import fraud from "../src/routes/fraud.js"
import auth from "../src/utils/auth.js"

const app = express();
app.use(cors());
app.use(express.json());

app.use("/data", data);
app.use("/fraud", fraud);
app.use("/auth", auth);

app.listen(8080, () => {
    console.log('Server running on port 8080');
});