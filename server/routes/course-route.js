const router = require('express').Router();
const Course = require('../models').course;
const { courseValidation } = require('../validation');

router.use((req, res, next) => {
    console.log('正在接收跟course-routes有關的請求');
    next();
})

router.get('/', async (req, res) => {
    try {
        let allCourse = await Course.find({}).populate('instructor', 'username email').exec();
        return res.send(allCourse);
    } catch (e) {
        return res.status(500).send(e);
    }
})

// 用課程id找課程
router.get('/:_id', async (req, res) => {
    let { _id } = req.params;
    try {
        let foundCourse = await Course.find({ _id }).populate('instructor', 'email').exec();
        return res.send(foundCourse);
    } catch (e) {
        return res.status(500).send("找不到此課程");
    }
})

// 教師用_id找課程
router.get('/instructor/:_instructor_id', async (req, res) => {
    let { _instructor_id } = req.params;
    try {
        let foundCourse = await Course.find({ instructor: _instructor_id }).populate('instructor', 'username email').exec();
        return res.send(foundCourse);
    } catch (e) {
        return res.status(500).send(e);
    }
})

// 搜尋課程
router.get('/searchCourse/:title', async (req, res) => {
    let { title } = req.params;
    try {
        let foundCourse = await Course.find({ title }).populate('instructor', 'username email').exec();
        return res.send(foundCourse);
    } catch (e) {
        return res.status(500).send(e);
    }
})

// 學生用_id找課程
router.get('/student/:_student_id', async (req, res) => {
    let { _student_id } = req.params;
    try {
        let foundCourse = await Course.find({ students: _student_id }).populate('instructor', 'username email').exec();
        return res.send(foundCourse);
    } catch (e) {
        return res.status(500).send(e);
    }
})

// 創建新課程
router.post('/', async (req, res) => {
    let { error } = courseValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!req.user.isInstructor()) return res.status(400).send("必須是教師才能新增課程。若已經是教師，請用教師帳號登入");
    let { title, description, price } = req.body;
    try {
        let newCourse = new Course({ title, description, price, instructor: req.user._id });
        let savedCourse = await newCourse.save();
        return res.send({
            msg: '課程新增完畢',
            savedCourse
        });
        // return res.send('課程新增完畢');
    } catch (e) {
        return res.status(500).send('創建課程失敗');
    }
})

router.post('/enroll/:_id', async (req, res) => {
    let {_id} = req.params;
    try {
        let foundCourse = await Course.findOne({_id}).exec();
        foundCourse.students.push(req.user._id);
        await foundCourse.save();
        return res.send('註冊完成');
    } catch (e) {
        return res.status(500).send('註冊課程失敗');
    }
})

router.patch('/:_id', async (req, res) => {
    let { error } = courseValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let { _id } = req.params;
    try {
        let foundCourse = await Course.findOne({ _id }).exec();
        if (!foundCourse) {
            return res.status(400).send("找不到課程");
        }
        if (foundCourse.instructor.equals(req.user._id)) {
            let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, { new: true, runValidators: true });
            return res.send({
                message: "課程已經被更新成功",
                updateCourse,
            });
        } else {
            res.status(403).send("只有此課程講師才能修改課程");
        }
    } catch (e) {
        return res.status(500).send(e);
    }
})

router.delete('/:_id', async (req, res) => {
    let { _id } = req.params;
    try {
        let foundCourse = await Course.findOne({ _id }).exec();
        if (!foundCourse) {
            return res.status(400).send("找不到該課程，無法刪除");
        }
        if (foundCourse.instructor.equals(req.user._id)) {
            await Course.findOneAndDelete({ _id }).exec();
            return res.send('課程刪除成功');
        } else {
            return res.status(403).send("只能是講師才能刪除課程");
        }

    } catch (e) {
        return res.send(e);
    }
})

module.exports = router;