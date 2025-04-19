const User = require('../models/userModel');
const {generate_token, verify_token} = require('../Data/jwt_token');


const registerUser = async (req, res) => {
    const {name,email,password,pic} = req.body;

    if(!name || !email || !password){
        return res.status(422).json({error:"Please fill all the fields"});
    }

    const userExists = await User.findOne({email:email});
    if(userExists){
        return res.status(422).json({error:"User already exists"});
    }else{
        const user = await User.create({name,email,password,pic});
        if(user){
            return res.status(201).json({message:"User created successfully",data:{
                _id:user._id,
                name:user.name,
                email:user.email,
                pic:user.pic,
                token:await generate_token(user._id),
            }});
    }else{
        throw new Error("Something went wrong in creating the user.");
    }

}
}; 

const authUser = async(req,res)=>{
   const {email,password} = req.body;

   const user = await User.findOne({email});

   if(user && (user.matched_password(password))){
    res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token:await generate_token(user._id)
    })}
    else{
        res.status(401).json({msg:"Invalid User or Password"});
        // throw new Error("Invalid Email or Password");
    }
}

const allUsers = async(req,res)=>{
    const keyword = req.query.search?{
        $or:[
            {name:{$regex:req.query.search,$options:'i'}},
            {email:{$regex:req.query.search,$options:'i'}}
        ]
    }:{};
    console.log("serch: ",req.query.search);
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}});
    res.send(users);
}

module.exports = {registerUser,authUser,allUsers};