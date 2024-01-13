const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoute = require('./routes').auth;
const courseRoute = require('./routes').course;
const passport = require('passport');
require('./config/passport')(passport);
const cors = require('cors');

mongoose.connect('mongodb://127.0.1:27017/mernDB').then(() => {
    console.log('成功連接到mongodb');
}).catch(e => {
    console.error('Error connecting to MongoDB:', e);
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.use('/api/user', authRoute);
app.use('/api/courses', passport.authenticate('jwt', { session: false }), courseRoute);

// 只有登入系統的人才可以新增課程或註冊課程
// 表示具有有效的jwt

app.listen(8080, () => {
    console.log('後端伺服器正在監聽於 port8080');
})