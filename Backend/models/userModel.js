const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    pic:{type:String,default:"https://cdn1.iconfinder.com/data/icons/user-pictures/100/unknown-512.png"},
},{timeseries:true});

userSchema.methods.matched_password = async function(entered_password){
    const result = await bcrypt.compare(entered_password,this.password);
    console.log("bcrypt verification result: " + result);
    return result;
}

userSchema.pre('save',async function (next){
    if(!this.isModified('password')){ 
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt); 
    next();
});

const User = mongoose.model("User",userSchema);
module.exports = User;