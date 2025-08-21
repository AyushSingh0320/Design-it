const express = require('express');
const Like = require('../models/Like');
const auth = require('../middleware/auth');
const router = express.Router();
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// Method for creating a data of like for a portfolio
router.post('/:portfolioid', auth, async (req, res) => {
  try {
    const { portfolioid } = req.params;
    if (!portfolioid) {
      return res.status(404).json({ message: "Portfolio ID not found" });
    }
    
    const user = req.user._id;
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    //Check if user already liked this portfolio
    const existingLike = await Like.find({
      likedPortfolio: portfolioid,
      Likedby: user
    });

    if (existingLike.length > 0) {
      await Like.deleteMany({
        likedPortfolio : portfolioid,
        Likedby : user
      });
      return res.status(200).json({"message" : "Like deleted successfully"});
    }

    else {
      const createlikedata = await Like.create({
        likedPortfolio: portfolioid,
        Likedby: user
      });

      const likedata = await Like.findById(createlikedata._id);
      //   .populate('likedPortfolio')
      //   .populate('Likedby', 'name email');

      if (!likedata) {
        return res.status(500).json({ message: "Data not found" });
      }

      return res.status(200).json(likedata);
    };
  } catch (error) {
    console.error('Error creating like:', error);
    res.status(500).json({ message: error.message });
  }
});

//getting the data of like 
router.get('/' , auth , async (req , res) => {
    try {
        const user = req.user._id
        const likedata = await Like.find({Likedby : user})
        if(!likedata) {
            res.status(404).json({message : "likes not found"})
        }
        res.status(200).json(likedata)
    } catch (error) {
         console.error('Error while fetching likedata:', error);
         res.status(500).json({ message: error.message })
    }
}) 

 
// getting total no of likes on a particular portfolio

router.get("/count/:portfolioid", async (req, res) => {
  try {
    const { portfolioid } = req.params;
    
    if (!portfolioid) {
      return res.status(404).json({ "message": "Portfolio ID not provided" });
    }

    // Convert string to ObjectId for MongoDB query
    const mongoose = require('mongoose');
    const portfolioObjectId = new mongoose.Types.ObjectId(portfolioid);

    const count = await Portfolio.aggregate([
      {
        $match: {
          _id: portfolioObjectId
        }
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "likedPortfolio",
          as: "countoflikes"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "countoflikes.Likedby",
          foreignField: "_id",
          as: "likedbyUsers"
        }
      },
      {
        $addFields: {
          count: {
            $size: "$countoflikes"
          },
          likes: {
            $map: {
              input: "$likedbyUsers",
              as: "user",
              in: {
                _id: "$$user._id",
                name: "$$user.name",
              }
            }
          }
        }
      },
      {
        $project: {
          count: 1,
          likes: 1
          
        }
      }
    ]);

    if (count.length === 0) {
      return res.status(404).json({ "message": "Portfolio not found" });
    }

    console.log(count);
    return res.status(200).json(count[0]);
  } catch (error) {
    console.error('Error getting like count:', error);
    res.status(500).json({ message: error.message });
  }
});




module.exports = router;