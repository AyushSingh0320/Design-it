const mongoose = require('mongoose');


const messageschema = new mongoose.Schema(
{
 sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true
    },
 receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true
 },
 content: {
    type: String,
    required: true,
    trim: true
 },
 messageType: {
    type: String,
    enum: ['text' , 'image' , 'file'],
    default: 'text'
 },
 isRead: {
    type: Boolean,
    default: false
 },
 raedAt: {
    type: Date
 }
},
{timestamps : true})


const Message = mongoose.model('Message', messageschema);
module.exports = Message;