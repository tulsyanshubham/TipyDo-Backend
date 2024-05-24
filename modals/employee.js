const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeschema = new Schema({
    managerusername: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    employeetype: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Temporary', 'Intern', 'Seasonal', 'Leased'],
        require: true,
    },
    worktype: {
        type: String,
        require: true
    },
    dateofjoining: {
        type: Date,
        require: true,
        default: Date.now
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: [true, "Email already Exists"],
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
    upiId: {
        //todo
        type: String,
        require: true
    },
    upiname: {
        type: String,
        require: true
    },
    image: {
        //todo
        type: String,
        require: true
    },
});
const Employee = mongoose.model('employee', employeeschema);
module.exports = Employee;