const express = require('express');
const router = express.Router();
const Message = require('../models/message.js')
const auth = require('../middleware/auth');
const Collaboration = require('../models/Collaboration');

// Api for posting the message data inti the datbase 
router.post('/sent' , auth , async (req , res) => {
    try {
       const sender = req.user._id
       if(!sender){
        return res.status(404).json({message : "User not found"})
       }
       const {receiver , content , messageType = 'text' , isRead = false } = req.body
       if(!receiver){
       return  res.status(404).json({message : "receiver is missing"})
       }
       if(!content){
        return res.status(404).json({message : "content is missing"})
       }
       // check if sender and receiver have a connection 
       const connection = await Collaboration.findOne({
        $or : [
            {sender: sender , receiver: receiver , status: 'accepted'},
            {  sender: receiver, receiver: sender, status: 'accepted' }
        ]
       });

    if(!connection){
      return res.status(400).json({message : "you can only message to your connection"})
    }

    const message = new Message({
        sender,
        receiver,
        content,
        messageType,
        isRead
    })
   await message.save();
 res.status(201).json(message);

    } catch (error) {
        console.error("Error while crating message data" , error)
        res.status(500).json({ message: error.message });
    }
});

// Gettig all the message between two users 

router.get('/connect/:id' , auth , async (req , res) => {
    try {
        const sender = req.user._id
        if(!sender){
            return res.status(404).json({message : "User not found"})
        }
        const receiver = req.params.id
         if(!receiver){
           return res.status(404).json({message : "receiver not found"})
        }
         const connection = await Collaboration.findOne({
        $or : [
            {sender: sender , receiver: receiver , status: 'accepted'},
            {  sender: receiver, receiver: sender, status: 'accepted' }
        ]
       });
           if(!connection){
      return res.status(400).json({message : "you can only message to your connection"})
    }
        const messageData = await Message.find({
            $or: [
                {sender: sender , receiver: receiver},
                {sender: receiver , receiver: sender}
            ]
        })
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .sort({ createdAt: 1 });
        if(!messageData){
            res.status(404).json({message : "No message found"})
        }

    } catch (error) {
        
    }
})

module.exports = router;