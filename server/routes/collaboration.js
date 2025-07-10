const express = require('express');
const Collaboration = require('../models/Collaboration');
const auth = require('../middleware/auth');

const router = express.Router();

// Send collaboration request
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, budget, deadline, portfolioItem } = req.body;

    const collaboration = new Collaboration({
      sender: req.user._id,
      portfolioItem,
      title,
      description,
      budget,
      deadline,
      status: 'pending'
    });

    await collaboration.save();
    res.status(201).json(collaboration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get received collaboration requests
router.get('/received', auth, async (req, res) => {
  try {
    const collaborations = await Collaboration.find({ receiver: req.user._id })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 });

    // Transform user._id to user.id for consistency
    const transformedCollaborations = collaborations.map(collaboration => {
      const collaborationObj = collaboration.toObject();
      if (collaborationObj.sender) {
        collaborationObj.sender.id = collaborationObj.sender._id;
        delete collaborationObj.sender._id;
      }
      return collaborationObj;
    });

    res.json(transformedCollaborations);
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
router.get('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id)
      .populate('sender', 'name profileImage bio skills socialLinks')
      .populate('receiver', 'name profileImage bio skills socialLinks');

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (collaboration.sender._id.toString() !== req.user._id.toString() &&
        collaboration.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Transform user._id to user.id for consistency
    const collaborationObj = collaboration.toObject();
    if (collaborationObj.sender) {
      collaborationObj.sender.id = collaborationObj.sender._id;
      delete collaborationObj.sender._id;
    }
    if (collaborationObj.receiver) {
      collaborationObj.receiver.id = collaborationObj.receiver._id;
      delete collaborationObj.receiver._id;
    }

    res.json(collaborationObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 