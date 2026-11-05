// models/Pembelajaran.js - MongoDB Schema untuk Pembelajaran
const mongoose = require("mongoose");

const pembelajaranSchema = new mongoose.Schema(
  {
    // ===== BASIC INFO =====
    title: {
      type: String,
      required: [true, "Judul wajib diisi"],
      trim: true,
      minlength: [5, "Judul minimal 5 karakter"],
      maxlength: [200, "Judul maksimal 200 karakter"],
    },

    description: {
      type: String,
      required: [true, "Deskripsi wajib diisi"],
      trim: true,
      minlength: [10, "Deskripsi minimal 10 karakter"],
      maxlength: [1000, "Deskripsi maksimal 1000 karakter"],
    },

    type: {
      type: String,
      required: [true, "Type wajib diisi"],
      enum: {
        values: ["panduan", "video", "tools"],
        message: "Type harus salah satu dari: panduan, video, tools",
      },
    },

    category: {
      type: String,
      required: [true, "Kategori wajib diisi"],
      trim: true,
      maxlength: [100, "Kategori maksimal 100 karakter"],
    },

    author: {
      type: String,
      required: [true, "Author wajib diisi"],
      trim: true,
      maxlength: [100, "Author maksimal 100 karakter"],
    },

    // ===== CLASSIFICATION =====
    ageGroup: {
      type: String,
      enum: {
        values: ["0-2", "2-4", "4-6", "0-6", "all"],
        message: "Age group harus salah satu dari: 0-2, 2-4, 4-6, 0-6, all",
      },
    },

    aspect: {
      type: String,
      enum: {
        values: [
          "kognitif",
          "fisik",
          "sosial-emosional",
          "bahasa",
          "seni",
          "moral-agama",
          "multi-aspek",
        ],
        message: "Aspek tidak valid",
      },
    },

    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag maksimal 50 karakter"],
      },
    ],

    stakeholder: {
      type: String,
      trim: true,
      maxlength: [100, "Stakeholder maksimal 100 karakter"],
    },

    // ===== MEDIA =====
    thumbnail: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Thumbnail harus berupa URL yang valid",
      },
    },

    // ===== STATUS & DATES =====
    publishDate: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ===== STATS =====
    views: {
      type: Number,
      default: 0,
      min: [0, "Views tidak boleh negatif"],
    },

    downloads: {
      type: Number,
      default: 0,
      min: [0, "Downloads tidak boleh negatif"],
    },

    likes: {
      type: Number,
      default: 0,
      min: [0, "Likes tidak boleh negatif"],
    },

    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating tidak boleh negatif"],
      max: [5, "Rating maksimal 5"],
    },

    // ===== AUDIT FIELDS =====
    createdBy: {
      type: String,
      required: true,
    },
    createdByFullName: {
      type: String,
      required: true,
    },
    createdByKL: {
      type: String,
      required: false,
    },
    updatedBy: {
      type: String,
    },

    // ===== TYPE SPECIFIC FIELDS =====

    // Panduan fields
    pages: {
      type: Number,
      min: [1, "Jumlah halaman minimal 1"],
      validate: {
        validator: function (v) {
          return this.type !== "panduan" || v > 0;
        },
        message: "Jumlah halaman wajib untuk panduan",
      },
    },

    pdfUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.type !== "panduan") return true; // Not required for non-panduan
          if (!v) return false; // Required for panduan
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "PDF URL wajib dan harus valid untuk panduan",
      },
    },

    // Video fields
    youtubeId: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.type !== "video") return true; // Not required for non-video
          if (!v) return false; // Required for video
          // YouTube ID format: 11 characters, letters, numbers, - and _
          return /^[a-zA-Z0-9_-]{11}$/.test(v);
        },
        message: "YouTube ID wajib dan harus valid untuk video",
      },
    },

    duration: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          // Format: MM:SS or HH:MM:SS
          return /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/.test(v);
        },
        message: "Format durasi tidak valid (gunakan MM:SS atau HH:MM:SS)",
      },
    },

    // Tools fields
    format: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return this.type !== "tools" || (v && v.length > 0);
        },
        message: "Format wajib untuk tools",
      },
    },

    features: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Feature maksimal 100 karakter"],
      },
    ],

    usage: {
      type: String,
      trim: true,
      maxlength: [500, "Usage maksimal 500 karakter"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===== INDEXES =====
pembelajaranSchema.index({ type: 1, isActive: 1 }); // Composite index for filtering
pembelajaranSchema.index({ title: "text", description: "text", tags: "text" }); // Text search
pembelajaranSchema.index({ publishDate: -1 }); // Sort by date
pembelajaranSchema.index({ views: -1 }); // Sort by popularity
pembelajaranSchema.index({ category: 1 }); // Filter by category
pembelajaranSchema.index({ aspect: 1 }); // Filter by aspect

// ===== VIRTUALS =====
pembelajaranSchema.virtual("thumbnailUrl").get(function () {
  if (!this.thumbnail) {
    // Default thumbnail based on type
    switch (this.type) {
      case "video":
        return this.youtubeId
          ? `https://img.youtube.com/vi/${this.youtubeId}/mqdefault.jpg`
          : null;
      case "panduan":
        return "/assets/images/default-panduan.jpg";
      case "tools":
        return "/assets/images/default-tools.jpg";
      default:
        return null;
    }
  }
  return this.thumbnail;
});

pembelajaranSchema.virtual("isPopular").get(function () {
  return this.views > 100 || this.downloads > 50;
});

pembelajaranSchema.virtual("popularityScore").get(function () {
  // Simple popularity algorithm
  const viewScore = (this.views || 0) * 1;
  const downloadScore = (this.downloads || 0) * 2;
  const likeScore = (this.likes || 0) * 3;
  const ratingScore = (this.rating || 0) * 10;

  return viewScore + downloadScore + likeScore + ratingScore;
});

// ===== METHODS =====
pembelajaranSchema.methods.incrementView = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

pembelajaranSchema.methods.incrementDownload = function () {
  this.downloads = (this.downloads || 0) + 1;
  return this.save();
};

pembelajaranSchema.methods.incrementLike = function () {
  this.likes = (this.likes || 0) + 1;
  return this.save();
};

// ===== STATICS =====
pembelajaranSchema.statics.getByType = function (type, options = {}) {
  const filter = { type, isActive: true };
  return this.find(filter)
    .sort(options.sort || { publishDate: -1 })
    .limit(options.limit || 10);
};

pembelajaranSchema.statics.getPopular = function (type = null, limit = 10) {
  const filter = { isActive: true };
  if (type) filter.type = type;

  return this.find(filter)
    .sort({ views: -1, downloads: -1, likes: -1 })
    .limit(limit);
};

pembelajaranSchema.statics.search = function (query, type = null) {
  const filter = {
    $text: { $search: query },
    isActive: true,
  };
  if (type) filter.type = type;

  return this.find(filter, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

// ===== MIDDLEWARE =====
// Before save middleware
pembelajaranSchema.pre("save", function (next) {
  // Trim strings
  if (this.title) this.title = this.title.trim();
  if (this.description) this.description = this.description.trim();
  if (this.category) this.category = this.category.trim();
  if (this.author) this.author = this.author.trim();

  // Set publishDate if not set
  if (!this.publishDate) {
    this.publishDate = new Date();
  }

  next();
});

// After save middleware
pembelajaranSchema.post("save", function (doc) {
  console.log(`Pembelajaran "${doc.title}" (${doc.type}) has been saved`);
});

// Before remove middleware
pembelajaranSchema.pre("remove", function (next) {
  console.log(`Removing pembelajaran: ${this.title}`);
  next();
});

module.exports = mongoose.model("Pembelajaran", pembelajaranSchema);
