const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'instructor']
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

userSchema.methods.isStudent = function () {
    return this.role == "student";
}

userSchema.methods.isInstructor = function () {
    return this.role == "instructor";
}

userSchema.methods.comparePassword = async function (password, cb) {
    let result;
    try {
        result = await bcrypt.compare(password, this.password);
        cb(null, result);
    } catch (error) {
        cb(error, result);
    }
}

userSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified("password")) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
            next();
        } catch (e) {
            next(e);
        }
    } else {
        next();
    }
})

module.exports = mongoose.model('User', userSchema);