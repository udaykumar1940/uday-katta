var express = require("express")
var app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jwt-simple')

var auth = require('./auth')
var home = require('./home')

var userobj = require('./models/user')
var postobj = require('./models/Post')
var homeobj = require('./models/Home')

var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')

app.use(cors());
app.use(bodyParser.json());


app.get('/posts/:id', async(req,res)=>{
    var author  = req.params.id
    var posts = await postobj.find({author})
    res.send(posts);
});

app.post('/post', auth.checkAuthenticated, (req,res)=>{
    var postData = req.body;
    postData.author = req.userId; 
    var post = new postobj(postData)

    post.save((err,result)=>{
        if(err){
            console.error('Post Saving error...');
            res.send({message:"saving post error..."})
        }
    })
    //console.log(userData.email);
    res.send({message:"Added Successfully"});
})


// app.post('/register', auth.register)

// app.post('/login', auth.login)

app.get('/users', async (req,res)=>{
    try {
        var users = await userobj.find({},'-password -__v') // To exclude password and version(__v) from the object
        res.send(users)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.get('/profile/:id', async (req,res)=>{
    try{
        var user = await userobj.findById(req.params.id, '-__v')
        res.send(user)
    }catch(error){
        console.error(error)
        res.sendStatus(500)
    }
})

app.delete('/user/delete/:id', auth.checkAuthenticated, async(req,res)=>{
     console.log("deleting a user")
     var _id = req.params.id;
     if(_id!='id'){
        console.log("2 -->"+_id)
        await userobj.deleteOne({_id})
        res.send({message:"deleted Successfully... "});
    }else{
         res.send({message:"delete fail... "});
    }
   
});

app.get('/sessionUser', auth.checkAuthenticated, async(req,res)=>{
    console.log("sessionUser")
    var _id= req.userId;
    var userList = await userobj.find({_id});

    if(userList!=null){
       return res.send(userList[0]);
     }else{
        res.send({message:"CAn not find Home Details"});
     }

});

// mongoose 5.x no longer required the useMongoClient:true
/* mongoose.connect('mongodb://root:udaymongo1@ds125618.mlab.com:25618/udaymongo', {useNewUrlParser:true}, (err)=>{
    if(!err){
        console.log('Mongo DB connected to MLab');
    }
})
*/

mongoose.connect('mongodb://localhost:27017/admin', {useNewUrlParser:true}, (err)=>{
    if(!err){
        console.log('Mongo DB Connected to Local');
    }

})

var smtpConfig = {
    host: 'smtp.gmail.com',
    post:587,
    secure: false, // use SSL, 
                  // you can try with TLS, but port is then 587
    auth: {
      user: 'udaykumar1940@gmail.com',
        pass: 'Jesusmindtree531'
    }
  };

var transporter = nodemailer.createTransport(smtpConfig);

    var mailOptions = {
    from: 'udaykumar1940@gmail.com',
    to: 'udaykumar1940@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log("error here:"+error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
//});

app.use('/auth',auth.router);
app.use('/home',home)
app.listen(3000);
