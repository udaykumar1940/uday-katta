var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    description: String
})



userSchema.pre('save', function(next){
    var user = this

    if(!user.isModified('password'))
        return next()

    bcrypt.hash(user.password,null,null,(err,hash)=>{
       if(err) return next(err)

       user.password = hash
       next()
       // console.log(hash)
    })
})

module.exports = mongoose.model('User',userSchema);
