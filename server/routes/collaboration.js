const express = require('express');
const Collaboration = require('../models/Collaboration');
const auth = require('../middleware/auth');

const router = express.Router();

// Send collaboration request
router.post('/', auth, async (req, res) => {
  try {
    const sender = req.user._id;
    if(!sender){
      return res.status(401).json({"message" : "Unauthorized User"});
    }
    
    const { receiver } = req.body;
    console.log('Request body:', req.body);
    console.log('Sender:', sender);
    console.log('Receiver:', receiver);
  
    
    if(!receiver){
      return res.status(400).json({"message" : "Receiver is required"});
    }

    const collaboration = new Collaboration({
      sender,
      receiver, 
      status: "pending"
    });

    console.log('Collaboration object before save:', collaboration);
    await collaboration.save();
    res.status(201).json(collaboration);
  } catch (error) {
    console.error('Collaboration creation error:', error);
    res.status(400).json({ message: error.message });
  }
});
// GETTING THE REQUEST DATA 
router.get("/:id" , async  (req,res) => {
  try {
    const collabid = req.params.id
    if(!collabid){
     return res.status(404).json({"message" : "Id not found"})
    }
    const requestdata = await Collaboration.findById(collabid)
    if(!requestdata){
      return res.status(404).json({"message" : "There is no request with this id"})
    }
   return  res.status(200).json(requestdata)
  } catch (error) {
    console.error("Error while fetching the requestdata" , error)
    res.status(500).json({ message: error.message });
  }
})
// Get received collaboration requests
router.get('/received', auth, async (req, res) => {
  try {
    const collaborations = await Collaboration.find({ receiver: req.user._id })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 });

if(!collaborations){
  res.status(410).json({"message" : "request no found"})
}
    // Transform user._id to user.id for consistency
    const transformedCollaborations = collaborations.map(collaboration => {
      const collaborationObj = collaboration.toObject();
      if (collaborationObj.sender) {
        collaborationObj.sender.id = collaborationObj.sender._id;
        delete collaborationObj.sender._id;
      }
      return collaborationObj;
    });

    return res.json(transformedCollaborations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sent collaboration requests
router.get('/sent', auth, async (req, res) => {
  try {
    const collaborations = await Collaboration.find({ sender: req.user._id })
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: -1 });

    // Transform user._id to user.id for consistency
    const transformedCollaborations = collaborations.map(collaboration => {
      const collaborationObj = collaboration.toObject();
      if (collaborationObj.receiver) {
        collaborationObj.receiver.id = collaborationObj.receiver._id;
        delete collaborationObj.receiver._id;
      }
      return collaborationObj;
    });

    res.json(transformedCollaborations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update collaboration request status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const collaboration = await Collaboration.findOne({
      _id: req.params.id,
      receiver: req.user._id
    });

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (collaboration.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    collaboration.status = status;
    await collaboration.save();

    res.json(collaboration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single collaboration request
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const collaboration = await Collaboration.findById(req.params.id)
//       .populate('sender', 'name profileImage bio skills socialLinks')
//       .populate('receiver', 'name profileImage bio skills socialLinks');

//     if (!collaboration) {
//       return res.status(404).json({ message: 'Collaboration request not found' });
//     }

//     if (collaboration.sender._id.toString() !== req.user._id.toString() &&
//         collaboration.receiver._id.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // Transform user._id to user.id for consistency
//     const collaborationObj = collaboration.toObject();
//     if (collaborationObj.sender) {
//       collaborationObj.sender.id = collaborationObj.sender._id;
//       delete collaborationObj.sender._id;
//     }
//     if (collaborationObj.receiver) {
//       collaborationObj.receiver.id = collaborationObj.receiver._id;
//       delete collaborationObj.receiver._id;
//     }

//     res.json(collaborationObj);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

module.exports = router; 