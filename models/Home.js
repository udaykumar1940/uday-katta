 var mongoose = require('mongoose')

 module.exports = mongoose.model('Home', {
     description:String,
     date: Date,
     author: {type:mongoose.Schema.Types.ObjectId, ref:'User'}
 })

