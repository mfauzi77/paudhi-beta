// migrations/fix-permissions-structure.js
const mongoose = require('mongoose');

async function migratePermissions() {
  try {
    console.log('🔧 Starting permissions migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/paudhi');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // 1. Backup existing data
    console.log('📋 Creating backup...');
    const backupCollection = db.collection('users_backup_' + Date.now());
    const allUsers = await usersCollection.find({}).toArray();
    if (allUsers.length > 0) {
      await backupCollection.insertMany(allUsers);
      console.log(`✅ Backup created with ${allUsers.length} users`);
    }
    
    // 2. Find users with old permissions structure (array format)
    const usersWithArrayPermissions = await usersCollection.find({
      permissions: { $type: "array" }
    }).toArray();
    
    console.log(`📊 Found ${usersWithArrayPermissions.length} users with old permissions structure`);
    
    // 3. Convert array permissions to object permissions
    for (const user of usersWithArrayPermissions) {
      console.log(`🔄 Converting permissions for user: ${user.email}`);
      
      const newPermissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: false, read: false, update: false, delete: false }
      };
      
      // Map old permissions to new format if they exist
      if (Array.isArray(user.permissions)) {
        user.permissions.forEach(perm => {
          if (perm.module && perm.actions && Array.isArray(perm.actions)) {
            // Map module names
            const moduleMap = {
              'ran_paud': 'ranPaud',
              'ranPaud': 'ranPaud',
              'news': 'news',
              'pembelajaran': 'pembelajaran',
              'faq': 'faq',
              'users': 'users'
            };
            
            const moduleName = moduleMap[perm.module] || perm.module;
            
            if (newPermissions[moduleName]) {
              newPermissions[moduleName] = {
                create: perm.actions.includes('create'),
                read: perm.actions.includes('read'),
                update: perm.actions.includes('update'),
                delete: perm.actions.includes('delete')
              };
            }
          }
        });
      }
      
      // Set permissions based on role
      if (['admin_utama', 'admin', 'super_admin'].includes(user.role)) {
        newPermissions.users = { create: true, read: true, update: true, delete: true };
      }
      
      // Update user with new permissions structure
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { permissions: newPermissions },
          $unset: { permissions_old: 1 } // Remove any old backup field
        }
      );
      
      console.log(`✅ Updated permissions for: ${user.email}`);
    }
    
    // 4. Find users with missing permissions
    const usersWithoutPermissions = await usersCollection.find({
      $or: [
        { permissions: { $exists: false } },
        { permissions: null },
        { permissions: {} }
      ]
    }).toArray();
    
    console.log(`📊 Found ${usersWithoutPermissions.length} users without permissions`);
    
    // 5. Add default permissions for users without permissions
    for (const user of usersWithoutPermissions) {
      console.log(`🔄 Adding default permissions for user: ${user.email}`);
      
      const defaultPermissions = {
        ranPaud: { create: true, read: true, update: true, delete: true },
        news: { create: true, read: true, update: true, delete: true },
        pembelajaran: { create: true, read: true, update: true, delete: true },
        faq: { create: true, read: true, update: true, delete: true },
        users: { create: false, read: false, update: false, delete: false }
      };
      
      // Set permissions based on role
      if (['admin_utama', 'admin', 'super_admin'].includes(user.role)) {
        defaultPermissions.users = { create: true, read: true, update: true, delete: true };
      }
      
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { permissions: defaultPermissions } }
      );
      
      console.log(`✅ Added default permissions for: ${user.email}`);
    }
    
    // 6. Verify migration
    const totalUsers = await usersCollection.countDocuments({});
    const usersWithNewPermissions = await usersCollection.countDocuments({
      'permissions.faq.create': { $exists: true }
    });
    
    console.log(`📊 Migration Summary:`);
    console.log(`   - Total users: ${totalUsers}`);
    console.log(`   - Users with new permissions structure: ${usersWithNewPermissions}`);
    console.log(`   - Migration success rate: ${((usersWithNewPermissions / totalUsers) * 100).toFixed(1)}%`);
    
    if (usersWithNewPermissions === totalUsers) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️ Some users may still have issues. Check manually.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Direct execution check
if (require.main === module) {
  migratePermissions()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migratePermissions };