const router = require('express').Router();
const { registerValidation, loginValidation } = require('../validation');
const User = require('../models').user;
const jwt = require('jsonwebtoken');

router.use((req, res, next) => {
    console.log('正在接收跟auth有關的請求');
    next();
})

router.get('/textAPI', (req, res) => {
    console.log('成功接收auth route...');
})

router.post('/register', async (req, res) => {
    let { error } = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emaiExist = await User.findOne({ email: req.body.email });
    if (emaiExist) return res.status(400).send('此信箱已經被註冊過，請使用其他信箱註冊');

    let { username, email, password, role } = req.body;
    let newUser = new User({ username, email, password, role });
    try {
        let saveUser = await newUser.save();
        return res.send({
            msg: '成功註冊',
            saveUser
        })
    } catch (e) {
        return res.status(500).send('無法儲存使用者');
    }
})

router.post('/login', async (req, res) => {
    let { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
        return res.status(401).send('無法找到使用者，請確認信箱是否正確');
    }
    foundUser.comparePassword(req.body.password, (error, isMatch) => {
        if (error) {
            // console.log(error)
            return res.status(500).send(error);
        }
        if (isMatch) {
            const tokenObject = { _id: foundUser._id, email: foundUser.email };
            const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
            return res.send({
                msg: "成功登入",
                token: "JWT " + token,
                user: foundUser,
            })
        } else {
            return res.status(401).send('密碼錯誤，請重新輸入');
        }
    })

})

module.exports = router;