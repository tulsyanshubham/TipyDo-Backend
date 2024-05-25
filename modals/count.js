const mongoose = require('mongoose');
const { Schema } = mongoose;

const countschema = new Schema({
    managerusername: {
        type: String,
        require: true
    },
    count: {
        type: Number
    }
});

// sessionschema.index({ expireAt: 1 }, { expireAfterSeconds: 60 });
const Count = mongoose.model('count', countschema);
module.exports = Count;