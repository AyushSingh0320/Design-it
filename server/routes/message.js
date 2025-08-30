const express = require('express');
const router = express.Router();
const Message = require('../models/message.js')
const auth = require('../middleware/auth');
const Collaboration = require('../models/Collaboration');

// Api for posting the message data into the datbase 
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
// update isRead 
     await Message.updateMany(
        {sender: receiver , receiver: sender , isRead: false},
        {isRead: true , readAt: new Date()}
    );
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
   
   
    return res.status(200).json(messageData)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// getting all the message of a patucular user 

router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            {
              $project: {
                name: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          user: { $first: '$user' }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;