const mongoose = require('mongoose');



const likeSchema = new mongoose.Schema({
          likedPortfolio : {
            type : mongoose.Types.ObjectId,
            ref : "Portfolio"
          },
          Likedby : {
           type : mongoose.Types.ObjectId,
           ref : "User"
          }
} , 
{timestamps : true})





const Like = mongoose.model('Like', likeSchema);

module.exports = Like;