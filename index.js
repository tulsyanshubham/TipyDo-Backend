require('./db');
require('dotenv').config();

const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const Manager = require('./modals/manager')
const Employee = require('./modals/employee');
const Session = require('./modals/session');
const Count = require('./modals/count');
const fetchuser = require('./middleware/fetchuser');

const secretKey = process.env.SECTET_KEY;
const app = express();
const port = process.env.PORT;
const mailpsw = process.env.MAILPSW;
const mailid = process.env.MAILID;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: mailid,
        pass: mailpsw
    }
});

const mailsend = (mail, psw) => {
    const mailOptions = {
        from: mailid,
        to: mail,
        subject: 'Sending Password for TipyDo',
        html : `<h2>Congratulations on creating an account on <span style="color: green;">TipyDo !</span></h2>
        <h4>Your Password:</h4>
        <h1 style="color: green;">${psw}</h1>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

const genauthtoken = async (user) => {
    const token = await jwt.sign({ id: user._id.toString() }, secretKey);
    return token;
}
const cookieobj = {
    expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
    httpOnly: true,
    // secure:true
}

app.get('/', async (req, res) => {
    res.send(`Backend running on PORT: ${port}`)
})

app.post('/api/signup', async (req, res) => {
    try {
        console.log(req.body);
        const tosave = new Manager({ ...req.body });
        const tosave2 = new Count({ managerusername : req.body.username, count: 0 });
        const save = await tosave.save();
        const save2 = await tosave2.save();
        const token = await genauthtoken(save);
        console.log(save,save2);
        // const expirationDate = new Date();
        // expirationDate.setTime(expirationDate.getTime() + (24 * 60 * 60 * 1000));
        // res.cookie("auth_token", token, cookieobj)
        res.send({ success: true, token });
    } catch (err) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            msg: err.message
        });
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
            return res.status(400).json({ success, "msg": "Incorrect username/password" });
        }
        const pswcompare = await bcrypt.compare(password, user.password);
        if (!pswcompare) {
            return res.status(400).json({ success, "msg": "Incorrect username/password" });
        }
        const token = await genauthtoken(user)
        res.cookie("auth_token", token, cookieobj)
        success = true;
        // delete user.password;
        res.json({ success, token, msg: "Logged in Sucessfully" });

    } catch (error) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            msg: err.message
        });
    }
})

app.post('/api/login', fetchuser, async (req, res) => {
    try {
        // console.log(req.user)
        let success = false;
        const user = await Manager.findById(req.user.id, { password: 0, _id: 0, __v: 0 })
        console.log(user)
        if (!user) {
            return res.status(404).send({ success, "msg": "Please Logout" });
        }
        // res.cookie("auth_token", req.user.token, cookieobj)
        success = true;
        console.log(user)
        res.send({ success, ...user._doc })
    } catch (error) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            msg: err.message
        });
    }
})

const randomgen = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var string_length = 5;
    let randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

app.post('/api/employee', fetchuser, async (req, res) => {
    try {
        // console.log(req.user)
        let success = false;
        const user = await Manager.findById(req.user.id).select("username")
        const psw = randomgen();
        const tosave = new Employee({ ...req.body, managerusername: user.username, password: psw });
        const save = await tosave.save();
        mailsend(save.email, psw);
        success = true;
        console.log({ ...save._doc });
        res.send({ success, ...save._doc });
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.delete('/api/employee', async (req, res) => {
    try {
        console.log(req.body.email)
        const email = req.body.email;
        const result = await Employee.findOneAndDelete({ email: email });
        if (!result) {
            return res.status(404).send("Employee not found");
        }
        res.send({ result: "Deleted" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.patch('/api/employee', async (req, res) => {
    try {
        // console.log(req.body)
        const { id, ...detail } = req.body;
        // console.log(detail)
        const result = await Employee.findByIdAndUpdate(id, detail, { new: true });
        console.log(result)
        res.send(result);
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.get('/api/employee', async (req, res) => {
    try {
        const username = req.header("username");
        console.log(username)
        const emps = await Employee.find({ managerusername: username });
        console.log(emps)
        res.send(emps)
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.get('/api/clientpage', async (req, res) => {
    try {
        const username = req.header("username");
        console.log(username)
        const mgr = await Manager.findOne({ username: username }, { _id: 0, password: 0, __v: 0 })
        const emps = await Employee.find({ managerusername: username }, { _id: 0, __v: 0 });
        // const {ownername,businessname,businesstype,email,phone} = mgr;
        const result = { mgr, emps }
        res.send(result)
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.get('/api/count', async (req, res) => {
    try {
        // console.log(req.user)
        var success = false;
        const save = await Count.findOne({mgrusername : req.headers.mgruserame});
        success = true;
        console.log({ ...save._doc });
        res.send({ success, ...save._doc });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success, msg : error.message});
    }
})

app.patch('/api/count', async (req, res) => {
    try {
        // console.log(req.user)
        var success = false;
        const save = await Count.findOneAndUpdate({mgrusername : req.body.mgruserame},{count : req.body.count},{ new: true });
        success = true;
        console.log({ ...save._doc });
        res.send({ success, ...save._doc });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success, msg : error.message});
    }
})

app.get('/api/employee/login', async (req, res) => {
    try {
        let success = false;
        const email = req.header("email");
        const password = req.header("password");
        console.log(req.header)
        let user = await Employee.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, "msg": "Incorrect username/password" });
        }
        const pswcompare = await bcrypt.compare(password, user.password);
        if (!pswcompare) {
            return res.status(400).json({ success, "msg": "Incorrect username/password" });
        }
        const token = await genauthtoken(user)
        res.cookie("auth_token", token, cookieobj)
        success = true;
        // delete user.password;
        res.json({ success, token, msg: "Logged in Sucessfully" });

    } catch (error) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            msg: err.message
        });
    }
})

app.post('/api/employee/login', fetchuser, async (req, res) => {
    try {
        // console.log(req.user)
        let success = false;
        const user = await Employee.findById(req.user.id, { password: 0, _id: 0, __v: 0,image:0 })
        console.log(user)
        if (!user) {
            return res.status(404).send({ success, "msg": "Please Logout" });
        }
        // res.cookie("auth_token", req.user.token, cookieobj)
        success = true;
        console.log(user)
        res.send({ success, ...user._doc })
    } catch (error) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            msg: err.message
        });
    }
})

app.post('/api/employee/tableno', fetchuser, async (req, res) => {
    try {
        // console.log(req.user)
        let success = false;
        const user = await Employee.findById(req.user.id)
        const tosave = new Session({ managerusername: user.managerusername, email: user.email, tableno : req.body.tableno });
        const save = await tosave.save();
        success = true;
        console.log(save);
        res.send( save);
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.get('/api/employee/tableno', async (req, res) => {
    try {
        let success = false;
        let sessions;
        if(req.header("email")){
            const email = req.header("email");
            console.log(email)
            sessions = await Session.find({ email });
        }
        if(req.header("managerusername")){
            const managerusername = req.header("managerusername");
            console.log(managerusername)
            sessions = await Session.find({ managerusername });
        }
        
        success = true;
        console.log(sessions);
        res.send( {sessions} );
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
    }
})

app.delete('/api/employee/tableno', async (req, res) => {
    try {
        // console.log(req.user)
        let success = false;
        const result = await Session.findOneAndDelete(req.body);
        if (!result) {
            return res.status(404).send({success, msg :"Employee not found"});
        }
        success = true;
        res.send({ success,result: "Deleted" });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success, msg : error.message});
    }
})

app.listen(port, () => {
    console.log(`Backend listening on port ${port}`)
})