const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed!'));
  }
});

// Get all public portfolio items
router.get('/', async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    const query = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const portfolios = await Portfolio.find(query)
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    // Transform user._id to user.id for consistency
    const transformedPortfolios = portfolios.map(portfolio => {
      const portfolioObj = portfolio.toObject();
      if (portfolioObj.user) {
        portfolioObj.user.id = portfolioObj.user._id;
        delete portfolioObj.user._id;
      }
      return portfolioObj;
    });

    res.json(transformedPortfolios);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's portfolio items
router.get('/my-portfolio', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Get specific user's portfolio items
router.get('/user/:userId', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ 
      user: req.params.userId,
      isPublic: true 
    })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    // Transform user._id to user.id for consistency
    const transformedPortfolios = portfolios.map(portfolio => {
      const portfolioObj = portfolio.toObject();
      if (portfolioObj.user) {
        portfolioObj.user.id = portfolioObj.user._id;
        delete portfolioObj.user._id;
      }
      return portfolioObj;
    });

    res.json(transformedPortfolios);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create portfolio item
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('User ID:', req.user._id);
    
    const { title, description, category, tags, isPublic } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    
    // Handle tags properly
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(parsedTags)) {
          parsedTags = [parsedTags];
        }
      } catch (error) {
        console.error('Error parsing tags:', error);
        parsedTags = [];
      }
    }

    const images = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      caption: ''
    }));

    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      images,
      category,
      tags: parsedTags,
      isPublic: isPublic === 'true' || isPublic === true
    });

    console.log('Creating portfolio item:', portfolio);
    await portfolio.save();
    console.log('Portfolio item created successfully');
    res.status(201).json(portfolio);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
  }
});

// Get a single portfolio item
router.get('/new', (req, res) => {
  res.status(404).json({ message: 'Invalid route. Use POST /portfolio to create a new item.' });
});

router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('user', 'name profileImage');
    
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Transform user._id to user.id for consistency
    const portfolioObj = portfolio.toObject();
    if (portfolioObj.user) {
      portfolioObj.user.id = portfolioObj.user._id;
      delete portfolioObj.user._id;
    }

    res.json(portfolioObj);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update portfolio item
router.patch('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    const updates = req.body;
    if (req.files?.length > 0) {
      updates.images = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: ''
      }));
    }

    Object.keys(updates).forEach(update => {
      portfolio[update] = updates[update];
    });

    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete portfolio item
router.delete('/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 