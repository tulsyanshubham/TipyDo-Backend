const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionschema = new Schema({
    managerusername: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    tableno: {
        type: Number,
        required: true,
    },
    // expireAt: {
    //     type: Date,
    //     default: Date.now,
    //     expires: 5000
    // }
});

// sessionschema.index({ expireAt: 1 }, { expireAfterSeconds: 60 });
const Session = mongoose.model('session', sessionschema);
module.exports = Session;