const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGO_URI;
// const mongoURL = 'mongodb://localhost:27017/Tipp?directConnection=true&readPreference=primary';

const connectToMongo = async () => {
    await mongoose.connect(mongoURL).then(() => console.log("Connected to MongoDB Successfully"))
}

module.exports = connectToMongo();