import express from 'express';
import db from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;

console.log(SECRET_KEY)

router.post('/login', async function(req, res) {
    const email = req.body.email;
    const pass = req.body.password;
    try{
      const user = await db.query(`SELECT * FROM USERS WHERE email = $1`,[email]);
      if(user){
        bcrypt
        .compare(pass, user.rows[0].password_hash)
        .then(async result => {
          if(result){
            const accessToken = jwt.sign(
                { email: user.rows[0].email, userId: user.rows[0].id },
                SECRET_KEY,
                { expiresIn: '1h' }
            );
            const refresh = await db.query(`SELECT * FROM REFRESH WHERE email = $1`,[email]);
            if(!refresh){
                const refreshToken = jwt.sign(
                    { email: user.rows[0].email, userId: user.rows[0].id },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: '7d' }
                  );
        
                  await db.query(`INSERT INTO REFRESH (email, refreshtoken) VALUES ($1, $2)`, [user.rows[0].email, refreshToken]);
            }
              res.status(200).json({
                email: user.rows[0].email,
                accessToken: accessToken,
                refreshToken: refresh.rows[0].refreshtoken
              });
          } else {
            res.status(500).json({ error: 'Incorrect password' });
          }
        })
        .catch(err => console.error(err.message))
      } else {
        res.status(404).json({error: "User does not exist. Sign up to use our services"})
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/signup', async function (req, res) {
    const email = req.body.email;
    const pass = req.body.password;
    const saltRounds = 10;
  
    try {
      const user = await db.query(`SELECT * FROM USERS WHERE email = $1`, [email]);
  
      if (user.rows.length === 0) {
        const salt = await bcrypt.genSalt(saltRounds);
        const cryptPass = await bcrypt.hash(pass, salt);
  
        
        const result = await db.query(
          `INSERT INTO USERS (email, password_hash) VALUES ($1, $2)`,
          [email, cryptPass]
        );
  
        const accessToken = jwt.sign(
          { email: email, userId: result.insertId }, 
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { email: user.rows[0].email, userId: user.rows[0].id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
          );
          await db.query(`INSERT INTO REFRESH (email, refreshtoken) VALUES ($1, $2)`, [user.rows[0].email, refreshToken]);

          res.status(200).json({
            email: user.rows[0].email,
            accessToken: accessToken,
            refreshToken: refreshToken
          });
      } else {
        
        const token = jwt.sign(
          { email: email, userId: user.rows[0].user_id },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        res.status(200).json({
          email: user.rows[0].email,
          token: token
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.post('/refresh-token', async (req, res) => {
    const { email, refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
      const result = await db.query(`SELECT * FROM REFRESH WHERE email = $1 AND refreshtoken = $2`, [decoded.email, refreshToken]);
  
      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
  
      const newAccessToken = jwt.sign(
        { email: decoded.email, userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      res.status(200).json({
        email: email,
        accessToken: accessToken,
        refreshToken: refreshToken
      });

    } catch (err) {
      console.error('Token refresh error:', err);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  });
  
  router.post('/logout', async (req, res) => {
    const { email } = req.body;
  
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
  
    try {
      await db.query(`DELETE FROM REFRESH WHERE email = $1`, [email]);
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

export default router;