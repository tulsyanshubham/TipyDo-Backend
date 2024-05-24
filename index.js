require('./db');
require('dotenv').config();

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const Manager = require('./modals/manager')
const Employee = require('./modals/employee');
const fetchuser = require('./middleware/fetchuser');

const secretKey = process.env.SECTET_KEY;
const app = express();
const port = process.env.PORT;

// app.use(express.json())
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const genauthtoken = async (user) => {
    const token = await jwt.sign({ id: user._id.toString() }, secretKey);
    return token;
}
const cookieobj = {
    expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    httpOnly: true,
    // secure:true
}

app.post('/api/signup', async (req, res) => {
    try {
        console.log(req.body);
        const tosave = new Manager({ ...req.body });
        const save = await tosave.save();
        const token = await genauthtoken(save);
        console.log(save);
        // const expirationDate = new Date();
        // expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000));
        // res.cookie("auth_token", token, cookieobj)
        res.send({ token });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({ error: err.message });
    }
})

app.get('/api/login', async (req, res) => {
    try {
        let success = false;
        const username = req.header("username");
        const password = req.header("password");
        console.log(req.header)
        let user = await Manager.findOne({ username });
        if (!user) {
            return res.status(400).json({ success, "errors": "User does not exist" });
        }
        const pswcompare = await bcrypt.compare(password, user.password);
        if (!pswcompare) {
            return res.status(400).json({ success, "errors": "Incorrect username/password" });
        }
        const token = await genauthtoken(user)
        res.cookie("auth_token", token, cookieobj)
        success = true;
        delete user.password;
        res.json({ success, token, user });

    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})