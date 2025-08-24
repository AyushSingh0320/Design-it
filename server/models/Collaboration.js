const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true

  },
  status : {
    type : String,
    default : "pending"
  }
}, {
  timestamps: true
});

// Prevent duplicate collaboration requests
collaborationSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

module.exports = Collaboration; 