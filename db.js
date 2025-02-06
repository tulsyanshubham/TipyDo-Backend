const mongoose = require('mongoose');
require('dotenv').config();

// const psw = process.env.PSW;
// const mongoURL = 'mongodb://localhost:27017/Tipp?directConnection=true&readPreference=primary';
const mongoURL = process.env.MONGOURL;

const connectToMongo = async () => {
    await mongoose.connect(mongoURL).then(() => console.log("Connected to MongoDB Successfully"))
}

module.export = connectToMongo();