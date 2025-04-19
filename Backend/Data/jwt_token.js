const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const generate_token = async(id)=>{
    const signing = await jwt.sign({ id }, secret);
    return signing;
} 
 
const verify_token = async(token)=>{
    const verification = await jwt.verify(token,secret);
    return verification;
}

module.exports = {generate_token,verify_token};