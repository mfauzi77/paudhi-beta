const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    // fullContent field removed to avoid confusion - use content only
    image: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Approval system fields - Updated for SISMONEV PAUD HI
    status: {
      type: String,
      enum: ['draft', 'publish'],
      default: 'draft'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    // K/L Identity fields
    source: {
      type: String,
      default: null, // Will be auto-populated from author.klName
    },
    // Original fields
    category: {
      type: String,
      default: "general",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
newsSchema.index({ status: 1, isActive: 1 });
newsSchema.index({ author: 1, status: 1 });
newsSchema.index({ approvedBy: 1 });
newsSchema.index({ publishedAt: 1 });
newsSchema.index({ title: 1 }); // For search functionality
newsSchema.index({ category: 1 }); // For category filtering
newsSchema.index({ source: 1 }); // For K/L source filtering

// Virtual for formatted status
newsSchema.virtual('statusLabel').get(function() {
  const statusMap = {
    draft: 'Draft',
    publish: 'Publish'
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware to auto-populate source from author
newsSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('author')) {
    try {
      if (this.author) {
        const User = mongoose.model('User');
        const authorUser = await User.findById(this.author).select('klName role');
        if (authorUser && authorUser.role === 'admin_kl' && authorUser.klName) {
          this.source = authorUser.klName;
        }
      }
    } catch (error) {
      console.error('Error populating source:', error);
    }
  }
  next();
});

// Method to submit for approval (for future use if needed)
newsSchema.methods.submitForApproval = function() {
  // In SISMONEV PAUD HI, news goes directly to draft
  this.status = 'draft';
  return this.save();
};

// Method to publish (only superadmin can do this)
newsSchema.methods.publish = function(superAdminId) {
  this.status = 'publish';
  this.approvedBy = superAdminId;
  this.approvedAt = new Date();
  this.publishedAt = new Date();
  this.isActive = true; // Ensure news is active when published
  return this.save();
};

// Method to return to draft
newsSchema.methods.returnToDraft = function() {
  this.status = 'draft';
  this.approvedBy = null;
  this.approvedAt = null;
  this.publishedAt = null;
  this.isActive = true; // Keep news active even in draft
  return this.save();
};

// Static methods
newsSchema.statics.getByStatus = function(status) {
  return this.find({ status, isActive: true });
};

newsSchema.statics.getPublishedNews = function() {
  return this.find({ status: 'publish', isActive: true })
    .populate('author', 'fullName email klName')
    .sort({ publishedAt: -1 });
};

newsSchema.statics.getDraftNews = function() {
  return this.find({ status: 'draft', isActive: true })
    .populate('author', 'fullName email klName')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model("News", newsSchema);