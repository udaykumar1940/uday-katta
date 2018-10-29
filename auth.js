var jwt = require('jwt-simple')
var bcrypt = require('bcrypt-nodejs')
var express = require("express")
var router = express.Router()

var userobj = require('./models/user')

router.post('/register', (req,res)=>{
    var userData = req.body;
    var user = new userobj(userData);
    user.save((err,newUser)=>{
        
        if(err)
           return res.send({message:"Error while saving user..."})
        
    createSendToken(res, newUser)

    })
    //console.log(userData.email);
  //  res.send({message:"Added Successfully"});
})
    
router.post('/login', async (req,res)=>{
   var loginData = req.body;
   var user = await userobj.findOne({username:loginData.username});

   if(!user)
    return res.send({ message : "Username or Password Invalid" })

    bcrypt.compare(loginData.password, user.password, function(err,isMatch) {

        if(!isMatch)
             return res.send({message:"Username or Password Invalid..."})

        createSendToken(res,user)
    })

})

function createSendToken(res,user){
    
        var payload = {sub:user._id};
        var token = jwt.encode(payload,'123');

        res.send({token});
}

var auth = {
    router,
     checkAuthenticated : (req, res, next) => {
    
    if(!req.header('authorization'))
        return res.status(401).send({message:"Authorized. Missing Auth Header"})
    
    var token = req.header('authorization').split(' ')[1]
   
    var payload = jwt.decode(token,'123');
    if(!payload)
        return res.status(401).send({message:"Authorized. Missing Auth Payload"})

    req.userId = payload.sub;
    next()
}
}


module.exports = auth