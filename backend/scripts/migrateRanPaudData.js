const mongoose = require("mongoose");
require("dotenv").config();

const RanPaud = require("../models/RanPaud");

const migrateRanPaudData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/paud-hi"
    );
    console.log("📁 Connected to MongoDB");

    // Find all documents that don't have indikators array or have empty indikators
    const legacyData = await RanPaud.find({
      $or: [
        { indikators: { $exists: false } },
        { indikators: { $size: 0 } },
        { indikators: null },
      ],
    });

    console.log(`🔍 Found ${legacyData.length} legacy records to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const record of legacyData) {
      try {
        // Check if this record has legacy fields
        if (record.indikator && record.targetSatuan) {
          // Create new indikators array from legacy data
          const newIndikator = {
            indikator: record.indikator,
            targetSatuan: record.targetSatuan,
            jumlahRO: record.jumlahRO || 1,
            catatan: record.notes || "",
            tahunData: record.tahunData || [],
          };

          // Update the record with new structure
          await RanPaud.findByIdAndUpdate(record._id, {
            $set: {
              indikators: [newIndikator],
              updatedBy: record.createdBy || "system",
            },
          });

          migratedCount++;
          console.log(`✅ Migrated record ${record._id}`);
        } else {
          // Skip records without legacy data
          skippedCount++;
          console.log(`⏭️ Skipped record ${record._id} (no legacy data)`);
        }
      } catch (error) {
        console.error(
          `❌ Error migrating record ${record._id}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Migration completed!");
    console.log(`✅ Migrated: ${migratedCount} records`);
    console.log(`⏭️ Skipped: ${skippedCount} records`);

    // Verify migration
    const totalRecords = await RanPaud.countDocuments();
    const recordsWithIndikators = await RanPaud.countDocuments({
      indikators: { $exists: true, $ne: [] },
    });

    console.log(`\n📊 Verification:`);
    console.log(`Total records: ${totalRecords}`);
    console.log(`Records with indikators: ${recordsWithIndikators}`);
    console.log(
      `Migration success rate: ${(
        (recordsWithIndikators / totalRecords) *
        100
      ).toFixed(1)}%`
    );

    // Add 2025 data to existing records if missing
    console.log("\n🔄 Adding 2025 data to existing records...");
    const recordsToUpdate = await RanPaud.find({
      "indikators.tahunData": {
        $not: {
          $elemMatch: { tahun: 2025 },
        },
      },
    });

    let updatedCount = 0;
    for (const record of recordsToUpdate) {
      try {
        // Add 2025 data to each indikator
        const updatedIndikators = record.indikators.map((indikator) => {
          const has2025 = indikator.tahunData.some(
            (tahun) => tahun.tahun === 2025
          );
          if (!has2025) {
            indikator.tahunData.push({
              tahun: 2025,
              target: null,
              realisasi: null,
              anggaran: "[ISI DISINI]",
              persentase: 0,
              kategori: "BELUM LAPORAN",
            });
          }
          return indikator;
        });

        await RanPaud.findByIdAndUpdate(record._id, {
          $set: {
            indikators: updatedIndikators,
            updatedBy: record.createdBy || "system",
          },
        });

        updatedCount++;
        console.log(`✅ Added 2025 data to record ${record._id}`);
      } catch (error) {
        console.error(`❌ Error updating record ${record._id}:`, error.message);
      }
    }

    console.log(`\n🎯 2025 Data Update:`);
    console.log(`✅ Updated: ${updatedCount} records with 2025 data`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrateRanPaudData();
}

module.exports = { migrateRanPaudData };
