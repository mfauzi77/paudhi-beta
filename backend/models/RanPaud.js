// models/RanPaud.js
const mongoose = require("mongoose");

const ranPaudSchema = new mongoose.Schema(
  {
    klId: {
      type: String,
      required: true,
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
      ],
    },
    klName: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    jumlahRO: {
      type: Number,
      default: 0,
    },
    indikators: [
      {
        indikator: {
          type: String,
          required: true,
        },
        targetSatuan: {
          type: String,
          required: true,
        },
        tahunData: [
          {
            tahun: {
              type: Number,
              required: true,
            },
            target: {
              type: mongoose.Schema.Types.Mixed,
              required: true,
            },
            realisasi: {
              type: mongoose.Schema.Types.Mixed,
              required: true,
            },
            persentase: {
              type: Number,
              required: true,
            },
            kategori: {
              type: String,
              enum: ["TERCAPAI", "TIDAK TERCAPAI", "BELUM LAPORAN"],
              required: true,
            },
            keterangan: String,
          },
        ],
      },
    ],
    // Approval system fields
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
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
    rejectionReason: {
      type: String,
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    },
    // Legacy fields for backward compatibility
    indikator: String,
    targetSatuan: String,
    tahunData: [
      {
        tahun: Number,
        target: mongoose.Schema.Types.Mixed,
        realisasi: mongoose.Schema.Types.Mixed,
        persentase: Number,
        kategori: {
          type: String,
          enum: ["TERCAPAI", "TIDAK TERCAPAI", "BELUM LAPORAN"],
        },
        keterangan: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Optional regional regulation document (admin_daerah only)
    regulationDocName: {
      type: String,
      default: null,
      trim: true,
    },
    regulationDocUrl: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ranPaudSchema.index({ klId: 1, status: 1, isActive: 1 });
ranPaudSchema.index({ createdBy: 1, status: 1 });
ranPaudSchema.index({ approvedBy: 1 });
ranPaudSchema.index({ "indikators.tahunData.tahun": 1 });

// Virtual for formatted status
ranPaudSchema.virtual('statusLabel').get(function() {
  const statusMap = {
    draft: 'Draft',
    pending: 'Menunggu Approval',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  };
  return statusMap[this.status] || this.status;
});

// Method to submit for approval
ranPaudSchema.methods.submitForApproval = function() {
  this.status = 'pending';
  this.submittedAt = new Date();
  return this.save();
};

// Method to approve
ranPaudSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to reject
ranPaudSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Method to return to draft
ranPaudSchema.methods.returnToDraft = function() {
  this.status = 'draft';
  this.approvedBy = null;
  this.approvedAt = null;
  this.rejectionReason = null;
  this.submittedAt = null;
  return this.save();
};

// Static method to get by status
ranPaudSchema.statics.getByStatus = function(status) {
  return this.find({ status, isActive: true }).populate('createdBy', 'fullName email klName');
};

// Static method to get pending approvals
ranPaudSchema.statics.getPendingApprovals = function() {
  return this.find({ status: 'pending', isActive: true })
    .populate('createdBy', 'fullName email klName')
    .sort({ submittedAt: -1 });
};

// Static method to get approved data
ranPaudSchema.statics.getApprovedData = function() {
  return this.find({ status: 'approved', isActive: true })
    .populate('createdBy', 'fullName email klName')
    .sort({ approvedAt: -1 });
};

// Static method to get summary by KL
ranPaudSchema.statics.getSummaryByKL = async function() {
  try {
    const summary = await this.aggregate([
      { $match: { isActive: true, status: 'approved' } },
    { $unwind: "$indikators" },
    { $unwind: "$indikators.tahunData" },
    {
      $group: {
        _id: "$klId",
        klName: { $first: "$klName" },
        tercapai: {
          $sum: {
              $cond: [
                { $eq: ["$indikators.tahunData.kategori", "TERCAPAI"] },
                1,
                0,
              ],
            },
        },
        tidakTercapai: {
          $sum: {
              $cond: [
                { $eq: ["$indikators.tahunData.kategori", "TIDAK TERCAPAI"] },
                1,
                0,
              ],
            },
        },
        belumLapor: {
          $sum: {
              $cond: [
                { $eq: ["$indikators.tahunData.kategori", "BELUM LAPORAN"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          klName: 1,
          tercapai: 1,
          tidakTercapai: 1,
          belumLapor: 1,
        },
      },
      { $sort: { klName: 1 } },
    ]);

    return summary;
  } catch (error) {
    console.error("Error getting KL summary:", error);
    return [];
  }
};

module.exports = mongoose.model("RanPaud", ranPaudSchema);
