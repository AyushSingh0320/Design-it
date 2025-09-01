const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');
const fileupload = require('../utils/cloudinary.js');

// const { default: fileupload } = require('../utils/cloudinary.js');

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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) { 
      console.log('File accepted:', file.originalname);
      return cb(null, true);
    }
    
    console.log('File rejected:', file.originalname, 'Type:', file.mimetype);
    cb(new Error(`File '${file.originalname}' rejected. Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!`));
  }
});

// Get all public portfolio items
router.get('/', async (req, res , next) => {
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
router.post('/', auth,  async (req, res , next) => {
 upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 10MB per file.',
          error: 'FILE_TOO_LARGE',
          maxSize: '10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: 'Too many files. Maximum 5 files allowed.',
          error: 'TOO_MANY_FILES',
          maxFiles: 5
        });
      }
      return res.status(400).json({ 
        message: err.message,
        error: 'UPLOAD_ERROR'
      });
    } else if (err) {
      return res.status(400).json({ 
        message: err.message,
        error: 'FILE_FILTER_ERROR'
      });
    }
    next();
  });
},
   async (req, res) => {
  try {
    // console.log('Request body:', req.body);
    // console.log('Request files:', req.files);
    // console.log('User ID:', req.user._id);

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

    const imagespath = req.files?.map(file => ({
     url: file.path,
    }));
    
    if(!imagespath || imagespath.length === 0){
      return res.status(400).json({message : "At least one image is required"})
    }
    
    console.log(`Processing ${imagespath.length} images:`, imagespath.map(img => img.url));
    console.log('Files received:', req.files)
    
      const uploadPromises = imagespath?.map(async (path, index) => {
        try {
          console.log(`Uploading image ${index + 1}/${imagespath.length}:`, path.url);
          const response = await fileupload(path.url)
          return {
            url : response.secure_url || response.url
          }
        } catch (error) {
          console.error(`Failed to upload image ${index + 1}:`, error.message)
          throw new Error(`Failed to upload image ${index + 1}: ${error.message}`);
        }
      })
      
      console.log(`Uploading ${uploadPromises.length} images to cloudinary...`)
      
      try {
        const finalImages = await Promise.all(uploadPromises);
        console.log('All images uploaded successfully:', finalImages.length);
        
        // Filter out any null values (shouldn't happen now, but safety check)
        const validImages = finalImages.filter(img => img && img.url);
        
        if (validImages.length === 0) {
          return res.status(400).json({
            message: "No images were successfully uploaded to cloudinary"
          });
        }
        
        if (validImages.length !== imagespath.length) {
          console.warn(`Warning: ${imagespath.length - validImages.length} images failed to upload`);
        }
   
    const portfolio = new Portfolio({
      user: req.user._id,
      title,
      description,
      images: validImages,
      category,
      tags: parsedTags,
      isPublic: isPublic === 'true' || isPublic === true
    });

    console.log('Creating portfolio item:', portfolio);
    await portfolio.save();
    console.log('Portfolio item created successfully');
    res.status(201).json(portfolio);
    
    } catch (uploadError) {
      console.error('Error uploading images to cloudinary:', uploadError);
      return res.status(500).json({
        message: "Failed to upload images to cloudinary",
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
  }
});

// Get a single portfolio item
// router.get('/new', (req, res) => {
//   res.status(404).json({ message: 'Invalid route. Use POST /portfolio to create a new item.' });
// });

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

// Update portfolio item
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, tags, isPublic, existingImages } = req.body;
    
    // Find the portfolio item and check ownership
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

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

    // Handle existing images
    let existingImagesArray = [];
    if (existingImages) {
      try {
        existingImagesArray = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        if (!Array.isArray(existingImagesArray)) {
          existingImagesArray = [];
        }
      } catch (error) {
        console.error('Error parsing existing images:', error);
        existingImagesArray = [];
      }
    }

    // Process new images if any
   const imagespath = req.files?.map(file => ({
     url: file.path,
    }));
    if(!imagespath){
      res.status(404).json({message : "image is reuired"})
    }
      console.log(req.files)
    
      const uploadPromises = imagespath?.map(async (path) => {
        try {
          const response = await fileupload(path.url)
          return {
            url : response.url
          }
        } catch (error) {
          console.error("image not found" , error)
           return null;
        }
      })
      console.log(uploadPromises)
      const finalImages = await Promise.all(uploadPromises);
      if(!finalImages){
        res.status(404).json({message : "failed to upload images on cloudinary"})
      }

    // Combine existing and new images
    const allImages = [...existingImagesArray, ...finalImages];

    // Check if at least one image exists
    if (allImages.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Update the portfolio item
    portfolio.title = title;
    portfolio.description = description;
    portfolio.category = category;
    portfolio.tags = parsedTags;
    portfolio.isPublic = isPublic === 'true' || isPublic === true;
    portfolio.images = allImages;
    portfolio.updatedAt = Date.now();

    await portfolio.save();

    console.log('Portfolio item updated successfully');
    res.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.stack
    });
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