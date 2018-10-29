var cors = require('cors')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var jwt = require('jwt-simple')
var express = require("express")
var router = express.Router()

var auth = require('./auth')

var homeobj = require('./models/Home')


router.get('/data/:id', auth.checkAuthenticated, async(req,res)=>{
     
     var homeId = req.params.id;
     if(homeId!='id'){
        var homeList  = await homeobj.find({_id:homeId});
         res.send(homeList);
    }else{
    var author = req.userId; 
    var homeList  = await homeobj.find({author}).sort([['date', -1]])

    //  var date  = homeList[0].date;

    //  console.log(req.userId);
    
    //  if(date =='') { 
    //      console.log("\n date vale is empty"+date)
    //      homeList = await homeobj.find({author})
    // } else {
    //     console.log("\nDate value exist :"+date)
    //      homeList = await homeobj.find({author,date})
    // }
    if(homeList!=null){
        res.send(homeList[0]);
     }else{
        res.send({message:"CAn not find Home Details"});
     }
    }
//    console.log("\nhomeList2-->"+homeList);
   
});

router.delete('/data/:id', auth.checkAuthenticated, async(req,res)=>{
     
     var _id = req.params.id;
     if(_id!='id'){
             console.log("2 -->"+_id)
       // var h = await homeobj.find({_id});
       await homeobj.deleteOne({_id})
       // console.log("h =====>"+h[0]._id);
         res.send({message:"deleted Successfully... "});
    }else{
         res.send({message:"delete fail... "});
    }
   
});

router.post('/save', auth.checkAuthenticated, (req,res)=>{
    var homeData = req.body;
   homeData.author = req.userId; 
    var home = new homeobj(homeData)
    home.save((err,result)=>{
        if(err){
            res.send({message:"saving Home error..."+err})
        }else{
             res.send(home);
        }
    })
  
})

router.post('/update', auth.checkAuthenticated, (req,res)=>{
    console.log('Posting Home data...');
    var homeData = req.body;
   homeData.author = req.userId; 
   // var home = new homeobj(homeData)
    console.log("update ------------->"+homeData._id)
    homeobj.findByIdAndUpdate(homeData._id, req.body,(err,result)=>{
        if(err){
            console.error('Home Update error...'+err);
            res.send({message:"saving Home error..."+err})
        }else{
             console.log('Updated Successfully...');
             res.send({message:"Updated Successfully"});
        }
    })
  //  console.log(userData.email);
  
})

router.get('/leftList', auth.checkAuthenticated, async(req,res)=>{
    var author = req.userId; 
    var homeList = await homeobj.find({author}).sort([['date', -1]]);
    res.send(homeList);
});

module.exports = router