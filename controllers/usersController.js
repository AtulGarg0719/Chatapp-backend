const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req,res,next) => {
    try {
        const {username,email,password} = req.body;
    const usernameCheck = await User.findOne({username});
    if(usernameCheck)
      return res.json({msg:"User name is already used",status:false});
    const emailCheck = await User.findOne({email});
    if(emailCheck) return res.json({msg:"Email is already taken",status:false});
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        username,
        email,
        password : hashedPassword,
    });
    delete user.password
    return res.json({status:true,user});
    } catch (error) {
        next(error);
    }
}


module.exports.login = async (req,res,next) => {
    try {
        const {username,password} = req.body;
    const user = await User.findOne({username});
    if(!user)
      return res.json({msg:"Incorrect Username",status:false});
    
    const isValidPassword = await bcrypt.compare(password,user.password);
    if(!isValidPassword) return res.json({msg:"Incorrect Password",status:false});
    delete user.password;

    return res.json({status:true,user});
    } catch (error) {
        next(error);
    }
}
module.exports.setAvatar = async (req,res,next) => {
    try {
        const userID = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userID,{
            isAvatarImage:true,
            avatarImage
        });
        return res.json({
            isSet:userData.isAvatarImage,image:userData.avatarImage,
        });
    } catch (error) {
        next(error);
    }
}
module.exports.getAllUsers = async (req,res,next) => {
    try {
        const users = await User.find({_id:{$ne: req.params.id}}).select([
            "email","username","avatarImage","_id"
        ]);
        return res.json(users);
    } catch (error) {
        next(error);
    }
}