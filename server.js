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


app.get('/posts', auth.checkAuthenticated, async(req,res)=>{
    var author  = req.userId; 
    var posts = await postobj.find({author})
    res.send(posts);
});

app.post('/post', auth.checkAuthenticated, (req,res)=>{
    var postData = req.body;
    postData.author = req.userId; 
    var post = new postobj(postData)

    post.save((err,result)=>{
        if(err){
            res.send({message:"saving post error..."})
        }
    })
    res.send({message:"Added Successfully"});
})

// app.post('/register', auth.register)

// app.post('/login', auth.login)

app.get('/users', auth.checkAuthenticated,async (req,res)=>{
    try {
        var users = await userobj.find({},'-password -__v') // To exclude password and version(__v) from the object
        res.send(users)
    } catch (error) {
        res.sendStatus(500)
    }
})

app.get('/profile/:id', auth.checkAuthenticated, async (req,res)=>{
    try{
        var user = await userobj.findById(req.params.id, '-__v')
        res.send(user)
    }catch(error){
        res.sendStatus(500)
    }
})

app.delete('/user/delete/:id', auth.checkAuthenticated, async(req,res)=>{
     var _id = req.params.id;
     if(_id!='id'){
        await userobj.deleteOne({_id})
        res.send({message:"deleted Successfully... "});
    }else{
         res.send({message:"delete fail... "});
    }
   
});

app.delete('/post/delete/:id', auth.checkAuthenticated, async(req,res)=>{
     var _id = req.params.id;
     if(_id!='id'){
        await postobj.deleteOne({_id})
        res.send({message:"Post deleted Successfully... "});
    }else{
         res.send({message:"Post delete failed... "});
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

function A(ids){
    var content = '';

    ids.forEach( async element  => {
        //console.log("element:"+element);
        userList2 = await userobj.find({email:element});
        console.log("=>"+userList2[0]);
        homeList = await homeobj.find({author:userList2[0]._id});
       // console.log("----------->"+homeList);

        await homeList.forEach( element2=>{
            //console.log("--->"+element2.description);
            console.log("content{sdsdsd}:"+content)
            content+=element2.description;
        })
    })
      console.log("finished");
    
}

const sendMail = async (ids,toEmailId) => {
 
    var content = '';

    for(var i=0;i<ids.length;i++){
        userList2 = await userobj.find({email:ids[i]});
            console.log("=>"+userList2[0]);
            homeList = await homeobj.find({author:userList2[0]._id});
        for(var j=0;j<homeList.length;j++){
        content+= "\n\n"+homeList[j].description;
        }

        if(i==(ids.length-1)){
            await transporter.sendMail({
                from: 'fake33396@gmail.com',
                to: toEmailId,
                subject: 'Monthly Reports',
                text: await content
            }, function(error, info){
                if (error) {
                    console.log("error here:"+error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            })
        }
    }

}

    
app.post('/sendMail', auth.checkAuthenticated, async (req,res)=>{

    var author = req.userId; 
    //var author_id: mongoose.ObjectId(author);
    console.log(author);
    var userList = await userobj.find({_id:author});
    var toEmailId;
    var homeList;
    var userList2 ;
    console.log(userList);
    if(userList!=null){
        toEmailId = userList[0].email;
    }
    var postData = req.body.toString();
    var ids = postData.split(",");


sendMail(ids,toEmailId);


/*    ids.forEach(element => {
    
    var mailOptions = {
        from: 'fake33396@gmail.com',
        to: element,
        subject: 'Hi '+element+'!!! Sending Email using Node.js',
        text: 'Angular js Test mail. pelase Ignore it!!'
    };

     transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("error here:"+error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    });
  */

    res.send({message:"Sent Successfully"});
})


// mongoose 5.x no longer required the useMongoClient:true
 mongoose.connect('mongodb://root:udaymongo1@ds125618.mlab.com:25618/udaymongo', {useNewUrlParser:true}, (err)=>{
    if(!err){
        console.log('Mongo DB connected to MLab');
    }
})

/*
mongoose.connect('mongodb://localhost:27017/admin', {useNewUrlParser:true}, (err)=>{
    if(!err){
        console.log('Mongo DB Connected to Local');
    }

})
*/

var smtpConfig = {
    host: 'smtp.gmail.com',
    post:587,
    secure: false, // use SSL, 
                  // you can try with TLS, but port is then 587
    auth: {
      user: 'fake33396@gmail.com',
        pass: 'fakefake531'
    }
  };

var mailOptions = {};

var transporter = nodemailer.createTransport(smtpConfig);


app.use('/auth',auth.router);
app.use('/home',home)
app.listen(process.env.PORT || 3000);
