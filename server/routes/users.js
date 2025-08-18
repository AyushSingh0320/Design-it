const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

const router = express.Router();

// Configure multer for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});



// total number of portfolios of a paticulat user 
router.get("/userdata" , auth , async (req , res) => {
    const user = req.user._id
    if(!user){
      res.status(404).json({"message" : "User not found"})
    }
    const Data = await User.aggregate([{
        $match : {
                _id : user
        }
        },
        {
          $lookup : {
            from : "portfolios",
            localField : "_id",
            foreignField : "user",
            as : "totalportfolios"
          }
        },
        {
          $addFields : {
            Portfoliocount : {
              $size : "$totalportfolios"
            }
          }
        },
        {
          $project : {
            name: 1,
            email: 1,
            bio: 1,
            profileImage:1,
            skills:1,
            socialLinks:1,
            Portfoliocount: 1
          }
        }
      ])
   console.log(Data)
      res.status(200).json(Data)

})

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform _id to id for consistency
    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;

    res.json(userObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.patch('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'bio', 'skills', 'socialLinks', 'profileImage'];
    
    // Handle profile image upload
    if (req.file) {
      // Store a normalized web path with leading slash and forward slashes
      const normalized = `/uploads/${req.file.filename}`;
      updates.profileImage = normalized;
    }

    // Filter out invalid updates
    Object.keys(updates).forEach(update => {
      if (!allowedUpdates.includes(update)) {
        delete updates[update];
      }
    });

    // Handle arrays and objects
    if (updates.skills) {
      updates.skills = typeof updates.skills === 'string' ? JSON.parse(updates.skills) : updates.skills;
    }
    if (updates.socialLinks) {
      updates.socialLinks = typeof updates.socialLinks === 'string' ? JSON.parse(updates.socialLinks) : updates.socialLinks;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Transform _id to id for consistency
    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;

    res.json(userObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name profileImage skills bio')
    .limit(10);

    // Transform _id to id for consistency
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();
      userObj.id = userObj._id;
      delete userObj._id;
      return userObj;
    });

    res.json(transformedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




module.exports = router;