const mongoose = require('mongoose');
const pool = require('../dbPostgres');
require('dotenv').config();

// Define schemas just for reading (simplified)
const UserSchema = new mongoose.Schema({}, { strict: false });
const FAQSchema = new mongoose.Schema({}, { strict: false });
const PembelajaranSchema = new mongoose.Schema({}, { strict: false });
const RanPaudSchema = new mongoose.Schema({}, { strict: false });

const MongoUser = mongoose.model('User_Migrate', UserSchema, 'users');
const MongoFAQ = mongoose.model('FAQ_Migrate', FAQSchema, 'faqs');
const MongoPembelajaran = mongoose.model('Pembelajaran_Migrate', PembelajaranSchema, 'pembelajarans');
const MongoRanPaud = mongoose.model('RanPaud_Migrate', RanPaudSchema, 'ranpauds');

async function migrate() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi_dev';
        console.log('⏳ Connecting to MongoDB...');
        console.log('URI:', mongoURI);

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoURI);
        }
        console.log('✅ MongoDB connected');

        // 0. Clear existing data
        console.log('🧹 Clearing existing PostgreSQL data...');
        await pool.query('TRUNCATE users, faqs, pembelajaran, ran_paud CASCADE');
        console.log('✅ Tables cleared');

        // 1. Migrate Users
        console.log('\n🚀 User Migration...');
        const users = await MongoUser.find({}).lean();
        console.log(`📦 Found ${users.length} users`);
        for (const u of users) {
             try {
                // Konversi _id ke string agar compatible dengan TEXT primary key
                const userId = u._id.toString(); 

                await pool.query(`
                    INSERT INTO users (id, username, email, password, full_name, role, kl_id, kl_name, region_name, province, city, permissions, is_active, last_login, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    userId,
                    u.username,
                    u.email,
                    u.password,
                    u.fullName,
                    u.role || 'admin_kl',
                    u.klId || null,
                    u.klName || null,
                    u.regionName || null,
                    u.province || null,
                    u.city || null,
                    JSON.stringify(u.permissions || {}),
                    u.isActive !== undefined ? u.isActive : true,
                    u.lastLogin || null,
                    u.createdAt || new Date(),
                    u.updatedAt || new Date()
                ]);
             } catch (e) {
                 console.error(`❌ User failed [${u.email}]:`, e.message);
             }
        }

        // 2. Migrate FAQs
        console.log('\n🚀 FAQ Migration...');
        const faqs = await MongoFAQ.find({}).lean();
        console.log(`📦 Found ${faqs.length} FAQs`);
        for (const f of faqs) {
            try {
                await pool.query(`
                    INSERT INTO faqs (id, question, answer, category, tags, is_active, "order", created_by, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    f._id.toString(),
                    f.question,
                    f.answer,
                    f.category,
                    f.tags || [],
                    f.isActive !== undefined ? f.isActive : true,
                    f.order || 0,
                    f.createdBy ? f.createdBy.toString() : null, // FK to Users
                    f.createdAt || new Date(),
                    f.updatedAt || new Date()
                ]);
            } catch (e) {
                console.error(`❌ FAQ failed:`, e.message);
            }
        }

        // 3. Migrate Pembelajaran
        console.log('\n🚀 Pembelajaran Migration...');
        const pemb = await MongoPembelajaran.find({}).lean();
        console.log(`📦 Found ${pemb.length} Items`);
        for (const p of pemb) {
            try {
                await pool.query(`
                    INSERT INTO pembelajaran (
                        id, title, description, type, category, author, age_group, aspect, tags, stakeholder, thumbnail,
                        pdf_url, youtube_id, duration, format, features, usage, pages,
                        views, downloads, likes, rating, is_active, publish_date,
                        created_by, created_by_fullname, created_by_kl, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    p._id.toString(),
                    p.title,
                    p.description,
                    p.type,
                    p.category,
                    p.author,
                    p.ageGroup || null,
                    p.aspect || null,
                    p.tags || [],
                    p.stakeholder || null,
                    p.thumbnail || null,

                    p.pdfUrl || null,
                    p.youtubeId || null,
                    p.duration || null,
                    p.format || null,
                    p.features || [],
                    p.usage || null,
                    p.pages || 0,

                    p.views || 0,
                    p.downloads || 0,
                    p.likes || 0,
                    p.rating || 0,
                    p.isActive !== undefined ? p.isActive : true,
                    p.publishDate || new Date(),

                    p.createdBy || 'Unknown ID',
                    p.createdByFullName || 'System',
                    p.createdByKL || null,
                    p.createdAt || new Date(),
                    p.updatedAt || new Date()
                ]);
            } catch (e) {
                 if (e.code === '23503') { // ForeignKeyViolation
                     console.warn(`⚠️ Pembelajaran orphan found [${p.title}]. Retrying with created_by=NULL...`);
                     try {
                        await pool.query(`
                            INSERT INTO pembelajaran (
                                id, title, description, type, category, author, age_group, aspect, tags, stakeholder, thumbnail,
                                pdf_url, youtube_id, duration, format, features, usage, pages,
                                views, downloads, likes, rating, is_active, publish_date,
                                created_by, created_by_fullname, created_by_kl, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
                            ON CONFLICT (id) DO NOTHING
                        `, [
                            p._id.toString(),
                            p.title,
                            p.description,
                            p.type,
                            p.category,
                            p.author,
                            p.ageGroup || null,
                            p.aspect || null,
                            p.tags || [],
                            p.stakeholder || null,
                            p.thumbnail || null,

                            p.pdfUrl || null,
                            p.youtubeId || null,
                            p.duration || null,
                            p.format || null,
                            p.features || [],
                            p.usage || null,
                            p.pages || 0,

                            p.views || 0,
                            p.downloads || 0,
                            p.likes || 0,
                            p.rating || 0,
                            p.isActive !== undefined ? p.isActive : true,
                            p.publishDate || new Date(),

                            null, // FALLBACK TO NULL
                            p.createdByFullName || 'System',
                            p.createdByKL || null,
                            p.createdAt || new Date(),
                            p.updatedAt || new Date()
                        ]);
                     } catch(err2) {
                        console.error(`❌ Pembelajaran failed retry [${p.title}]:`, err2.message);
                     }
                } else {
                    console.error(`❌ Pembelajaran failed [${p.title}]:`, e.message);
                }
            }
        }

        // 4. Migrate RAN PAUD
        console.log('\n🚀 RAN PAUD Migration...');
        const rans = await MongoRanPaud.find({}).lean();
        console.log(`📦 Found ${rans.length} RAN Data`);
        for (const r of rans) {
            try {
                await pool.query(`
                    INSERT INTO ran_paud (
                        id, kl_id, kl_name, program, jumlah_ro, indikators,
                        status, approved_by, approved_at, rejection_reason, submitted_at,
                        regulation_doc_name, regulation_doc_url,
                        is_active, created_by, updated_by, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    r._id.toString(),
                    r.klId,
                    r.klName,
                    r.program,
                    r.jumlahRO || 0,
                    JSON.stringify(r.indikators || []),
                    
                    r.status || 'draft',
                    r.approvedBy ? r.approvedBy.toString() : null,
                    r.approvedAt || null,
                    r.rejectionReason || null,
                    r.submittedAt || null,

                    r.regulationDocName || null,
                    r.regulationDocUrl || null,

                    r.isActive !== undefined ? r.isActive : true,
                    r.createdBy ? r.createdBy.toString() : null,
                    r.updatedBy ? r.updatedBy.toString() : null,
                    r.createdAt || new Date(),
                    r.updatedAt || new Date()
                ]);
            } catch (e) {
                if (e.code === '23503') { // ForeignKeyViolation
                     console.warn(`⚠️ RAN PAUD orphan found. Retrying with created_by=NULL...`);
                     try {
                        await pool.query(`
                            INSERT INTO ran_paud (
                                id, kl_id, kl_name, program, jumlah_ro, indikators,
                                status, approved_by, approved_at, rejection_reason, submitted_at,
                                regulation_doc_name, regulation_doc_url,
                                is_active, created_by, updated_by, created_at, updated_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                            ON CONFLICT (id) DO NOTHING
                        `, [
                            r._id.toString(),
                            r.klId,
                            r.klName,
                            r.program,
                            r.jumlahRO || 0,
                            JSON.stringify(r.indikators || []),
                            
                            r.status || 'draft',
                            null, // Fallback
                            r.approvedAt || null,
                            r.rejectionReason || null,
                            r.submittedAt || null,

                            r.regulationDocName || null,
                            r.regulationDocUrl || null,

                            r.isActive !== undefined ? r.isActive : true,
                            null, // Fallback
                            null, // Fallback
                            r.createdAt || new Date(),
                            r.updatedAt || new Date()
                        ]);
                     } catch(err2) {
                         console.error(`❌ RAN PAUD failed retry:`, err2.message);
                     }
                } else {
                    console.error(`❌ RAN PAUD failed:`, e.message);
                }
            }
        }

        console.log('\n✅ All migrations complete!');

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();
