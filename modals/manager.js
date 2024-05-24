const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const managerschema = new Schema({
    ownername: {
        type: String,
        require: true
    },
    businessname: {
        type: String,
        require: true,
    },
    businesstype: {
        type: String,
        enum: ['Hotel', 'Valets', 'Bars', 'Restaurants', 'Salons', 'Non-Profits'],
        require: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        trim: true,
        // unique: [true, "Email already Exists"],
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address'
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: 'Invalid mobile number'
        }
    },
    username: {
        type: String,
        require: true,
        unique: [true, "Username already Exists"],
    },
    password: {
        type: String,
        require: true,
    }
});

// passord Hash
managerschema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`Hashed Password : ${this.password}`);
    }
    next();
})

const Manager = mongoose.model('manager', managerschema);
module.exports = Manager;