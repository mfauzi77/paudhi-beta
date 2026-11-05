// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin_kl", "admin_daerah", "admin", "super_admin", "admin_utama"],
      default: "admin_kl",
    },
    klId: {
      type: String,
      enum: [
        "KEMENKO_PMK",
        "KEMENDIKDASMEN",
        "KEMENAG",
        "KEMENDES_PDTT",
        "KEMENKES",
        "KEMENDUKBANGGA",
        "KEMENSOS",
        "KEMENPPPA",
        "KEMENDAGRI",
        "BAPPENAS",
        "BPS",
        null, // biar null/undefined nggak bikin error enum
      ],
      required: function () {
        return this.role === "admin_kl";
      },
      default: null,
    },

    klName: {
      type: String,
      required: function () {
        return this.role === "admin_kl";
      },
      trim: true,
    },
    // Admin daerah optional fields
    regionName: {
      type: String,
      required: function () {
        return this.role === "admin_daerah";
      },
      trim: true,
    },
    province: {
      type: String,
      required: function () {
        return this.role === "admin_daerah";
      },
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    regionNote: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    permissions: {
      ranPaud: {
        create: { type: Boolean, default: true },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      news: {
        create: { type: Boolean, default: true },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      pembelajaran: {
        create: { type: Boolean, default: true },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      faq: {
        create: { type: Boolean, default: true },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: true },
        delete: { type: Boolean, default: true },
      },
      users: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Normalize and validate fields before validation
userSchema.pre("validate", function (next) {
  // Normalize email: trim + lowercase
  if (typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  // Normalize username: trim
  if (typeof this.username === "string") {
    this.username = this.username.trim();
  }

  // Normalize role: trim and replace spaces with underscore
  if (typeof this.role === "string") {
    this.role = this.role.trim().replace(/\s+/g, "_");
  }

  // Clear unnecessary fields based on role
  if (this.role === "admin_kl") {
    // Clear admin_daerah fields
    this.regionName = null;
    this.province = null;
    this.city = null;
    // Enforce klId/klName consistency with official list
    const klList =
      (this.constructor.getKLList && this.constructor.getKLList()) || [];
    const klMap = new Map(klList.map((k) => [k.id, k.name]));
    if (!this.klId || !klMap.has(this.klId)) {
      return next(new Error("K/L ID tidak valid untuk role admin_kl"));
    }
    const expectedName = klMap.get(this.klId);
    if (!this.klName || this.klName.trim() !== expectedName) {
      // Auto-correct klName if possible
      this.klName = expectedName;
    }
  } else if (this.role === "admin_daerah") {
    // Clear admin_kl fields
    this.klId = null;
    this.klName = null;
    // Enforce valid regionName
    if (typeof this.regionName === "string") {
      this.regionName = this.regionName.trim();
    }
    const regions =
      (this.constructor.getRegionList && this.constructor.getRegionList()) ||
      [];
    const valid = regions.includes(this.regionName);
    if (!this.regionName || !valid) {
      return next(new Error("Nama daerah tidak valid untuk role admin_daerah"));
    }
  } else {
    // For other roles, clear all role-specific fields
    this.klId = null;
    this.klName = null;
    this.regionName = null;
    this.province = null;
    this.city = null;
  }

  next();
});

// Add default permissions if missing
userSchema.pre("save", function (next) {
  if (!this.permissions) {
    // Set default permissions based on role
    if (this.role === "super_admin") {
      this.permissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
      };
    } else if (this.role === "admin") {
      this.permissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: false, read: false, update: false, delete: false },
      };
    } else if (this.role === "admin_kl" || this.role === "admin_daerah") {
      this.permissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: false, read: false, update: false, delete: false },
      };
    } else {
      // Default permissions for unknown roles
      this.permissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: false, read: false, update: false, delete: false },
      };
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get KL list for admin_kl users
userSchema.statics.getKLList = function () {
  return [
    {
      id: "KEMENKO_PMK",
      name: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
    },
    {
      id: "KEMENDIKDASMEN",
      name: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    },
    { id: "KEMENAG", name: "Kementerian Agama" },
    {
      id: "KEMENDES_PDTT",
      name: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi",
    },
    { id: "KEMENKES", name: "Kementerian Kesehatan" },
    {
      id: "KEMENDUKBANGGA",
      name: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional",
    },
    { id: "KEMENSOS", name: "Kementerian Sosial" },
    {
      id: "KEMENPPPA",
      name: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
    },
    { id: "KEMENDAGRI", name: "Kemendagri" },
    { id: "BAPPENAS", name: "Badan Perencanaan Pembangunan Nasional" },
    { id: "BPS", name: "Badan Pusat Statistik" },
  ];
};

// Get Region list for admin_daerah users (Provinsi)
userSchema.statics.getRegionList = function () {
  return [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
    "Jambi",
    "Sumatera Selatan",
    "Bengkulu",
    "Lampung",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "DKI Jakarta",
    "Jawa Barat",
    "Banten",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Bali",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Kalimantan Barat",
    "Kalimantan Tengah",
    "Kalimantan Selatan",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Sulawesi Utara",
    "Sulawesi Tengah",
    "Sulawesi Selatan",
    "Sulawesi Tenggara",
    "Gorontalo",
    "Sulawesi Barat",
    "Maluku",
    "Maluku Utara",
    "Papua Barat",
    "Papua",
    "Papua Selatan",
    "Papua Tengah",
    "Papua Pegunungan",
    "Papua Barat Daya",
  ];
};

// Check if user can access specific KL data
userSchema.methods.canAccessKL = function (klId) {
  if (this.role === "super_admin" || this.role === "admin") return true;
  if (this.role === "admin_kl" && this.klId === klId) return true;
  return false;
};

// Check if user has permission for specific action
userSchema.methods.hasPermission = function (module, action) {
  if (this.role === "super_admin") return true;
  return this.permissions[module]?.[action] || false;
};

// Get user's accessible KL IDs
userSchema.methods.getAccessibleKLIds = function () {
  if (this.role === "super_admin" || this.role === "admin") {
    return this.constructor.getKLList().map((kl) => kl.id);
  }
  return this.klId ? [this.klId] : [];
};

// Hide sensitive fields on toJSON/toObject
function transformDoc(doc, ret) {
  delete ret.password;
  return ret;
}
userSchema.set("toJSON", { virtuals: true, transform: transformDoc });
userSchema.set("toObject", { virtuals: true, transform: transformDoc });

// Indexes
// Case-insensitive unique indexes for email and username
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
// Helpful query indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ klId: 1 });

module.exports = mongoose.model("User", userSchema);
