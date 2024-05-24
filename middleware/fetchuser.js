require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECTET_KEY;

const fetchuser = (req,res,next) => {
    const token = req.header("auth-token");
    console.log(token)
    if(!token){
        res.status(401).send({error : "Invalid Token"});
    }
    try {
        const data = jwt.verify(token, secretKey);
        req.user = {
            id : data.id,
            token : token,
        }
        next();
        
    } catch (error) {
        res.status(401).send({error : "Invalid Token"});
    }
}

module.exports = fetchuser;