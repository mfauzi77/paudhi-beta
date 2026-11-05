// utils/websocket.js - WebSocket Real-time Updates untuk RAN PAUDHI
const { authenticateSocket } = require('../middleware/auth');

// ===== WEBSOCKET SETUP FUNCTION =====
const setupWebSocket = (io) => {
  console.log('🔌 Setting up WebSocket for RAN PAUDHI...');
  
  // Middleware untuk authentication
  io.use(authenticateSocket);
  
  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id} (${socket.user?.email})`);
    
    // Emit connection success dengan user info
    socket.emit('connection_success', {
      socketId: socket.id,
      user: {
        email: socket.user.email,
        role: socket.user.role,
        klId: socket.user.klId
      },
      timestamp: new Date().toISOString()
    });

    // ===== ROOM MANAGEMENT =====
    
    // Join admin room
    socket.on('join_admin', (data) => {
      if (['super_admin', 'admin'].includes(socket.user.role)) {
        socket.join('admin_room');
        socket.emit('room_joined', { room: 'admin_room', timestamp: new Date().toISOString() });
        
        // Broadcast admin user count update
        const adminSockets = io.sockets.adapter.rooms.get('admin_room');
        io.to('admin_room').emit('admin_users_update', {
          count: adminSockets ? adminSockets.size : 0,
          timestamp: new Date().toISOString()
        });
        
        console.log(`👤 Admin joined room: ${socket.user.email}`);
      } else {
        socket.emit('error', { message: 'Tidak memiliki akses admin', timestamp: new Date().toISOString() });
      }
    });

    // Join RAN PAUD room
    socket.on('join_ranpaud', (data) => {
      socket.join('ranpaud_room');
      socket.emit('room_joined', { room: 'ranpaud_room', timestamp: new Date().toISOString() });
      
      // Send current dashboard data if available
      socket.emit('ranpaud_status', {
        message: 'Connected to RAN PAUDHI real-time updates',
        timestamp: new Date().toISOString()
      });
      
      console.log(`🎯 User joined RAN PAUD room: ${socket.user.email} (${socket.user.role})`);
    });

    // Join K/L specific room
    socket.on('join_kl_room', (data) => {
      const { klId } = data;
      
      // Check if user can access this K/L
      if (socket.user.klId && socket.user.klId !== klId && !['super_admin', 'admin'].includes(socket.user.role)) {
        socket.emit('error', { 
          message: `Tidak memiliki akses ke data ${klId}`, 
          timestamp: new Date().toISOString() 
        });
        return;
      }
      
      const roomName = `kl_${klId}`;
      socket.join(roomName);
      socket.emit('room_joined', { room: roomName, klId, timestamp: new Date().toISOString() });
      
      console.log(`🏢 User joined K/L room: ${socket.user.email} -> ${klId}`);
    });

    // ===== DATA SUBSCRIPTION =====
    
    // Subscribe to dashboard updates
    socket.on('subscribe_dashboard', () => {
      socket.join('dashboard_updates');
      socket.emit('subscription_confirmed', { 
        type: 'dashboard', 
        timestamp: new Date().toISOString() 
      });
      console.log(`📊 Dashboard subscription: ${socket.user.email}`);
    });

    // Subscribe to data changes
    socket.on('subscribe_data_changes', (filters = {}) => {
      socket.join('data_changes');
      socket.filterPreferences = filters; // Store user filter preferences
      socket.emit('subscription_confirmed', { 
        type: 'data_changes', 
        filters,
        timestamp: new Date().toISOString() 
      });
      console.log(`📝 Data changes subscription: ${socket.user.email}`, filters);
    });

    // Subscribe to import/export progress
    socket.on('subscribe_import_progress', () => {
      socket.join('import_progress');
      socket.emit('subscription_confirmed', { 
        type: 'import_progress', 
        timestamp: new Date().toISOString() 
      });
      console.log(`📥 Import progress subscription: ${socket.user.email}`);
    });

    // ===== REAL-TIME QUERIES =====
    
    // Request live stats
    socket.on('request_live_stats', async () => {
      try {
        // This would typically fetch from database
        const stats = await getLiveStats();
        socket.emit('live_stats', {
          data: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('error', { 
          message: 'Gagal mengambil live stats', 
          error: error.message,
          timestamp: new Date().toISOString() 
        });
      }
    });

    // Request K/L specific data
    socket.on('request_kl_data', async (klId) => {
      try {
        // Check access permission
        if (socket.user.klId && socket.user.klId !== klId && !['super_admin', 'admin'].includes(socket.user.role)) {
          socket.emit('error', { 
            message: `Tidak memiliki akses ke data ${klId}`, 
            timestamp: new Date().toISOString() 
          });
          return;
        }
        
        const klData = await getKLData(klId);
        socket.emit('kl_data', {
          klId,
          data: klData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        socket.emit('error', { 
          message: 'Gagal mengambil data K/L', 
          error: error.message,
          timestamp: new Date().toISOString() 
        });
      }
    });

    // ===== USER ACTIONS =====
    
    // User started editing
    socket.on('editing_start', (data) => {
      const { recordId, recordType } = data;
      
      // Notify other users about editing session
      socket.to('ranpaud_room').emit('user_editing', {
        recordId,
        recordType,
        user: {
          email: socket.user.email,
          role: socket.user.role
        },
        action: 'start',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✏️ Editing started: ${socket.user.email} -> ${recordType}:${recordId}`);
    });

    // User stopped editing
    socket.on('editing_stop', (data) => {
      const { recordId, recordType } = data;
      
      socket.to('ranpaud_room').emit('user_editing', {
        recordId,
        recordType,
        user: {
          email: socket.user.email,
          role: socket.user.role
        },
        action: 'stop',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✏️ Editing stopped: ${socket.user.email} -> ${recordType}:${recordId}`);
    });

    // Heartbeat to keep connection alive
    socket.on('heartbeat', () => {
      socket.emit('heartbeat_ack', { timestamp: new Date().toISOString() });
    });

    // ===== DISCONNECTION HANDLING =====
    
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${socket.user?.email}) - Reason: ${reason}`);
      
      // Notify about editing sessions that were interrupted
      socket.to('ranpaud_room').emit('user_editing', {
        user: {
          email: socket.user.email,
          role: socket.user.role
        },
        action: 'disconnected',
        timestamp: new Date().toISOString()
      });
      
      // Update admin count if was admin
      if (['super_admin', 'admin'].includes(socket.user.role)) {
        setTimeout(() => {
          const adminSockets = io.sockets.adapter.rooms.get('admin_room');
          io.to('admin_room').emit('admin_users_update', {
            count: adminSockets ? adminSockets.size : 0,
            timestamp: new Date().toISOString()
          });
        }, 100);
      }
    });

    // ===== ERROR HANDLING =====
    
    socket.on('error', (error) => {
      console.error(`🔥 Socket error for ${socket.user?.email}:`, error);
      socket.emit('error', { 
        message: 'Terjadi error pada koneksi', 
        timestamp: new Date().toISOString() 
      });
    });
  });

  return io;
};

// ===== BROADCAST FUNCTIONS =====

// Broadcast RAN PAUD data update
const broadcastRanPaudUpdate = (io, updateData) => {
  const { type, data, klId, userId } = updateData;
  
  const broadcast = {
    type: 'ran_paud_update',
    updateType: type, // 'create', 'update', 'delete'
    data: data,
    klId: klId,
    userId: userId,
    timestamp: new Date().toISOString()
  };

  // Broadcast to all RAN PAUD users
  io.to('ranpaud_room').emit('data_update', broadcast);
  
  // Also broadcast to specific K/L room if applicable
  if (klId) {
    io.to(`kl_${klId}`).emit('kl_data_update', broadcast);
  }
  
  // Broadcast to dashboard subscribers
  io.to('dashboard_updates').emit('dashboard_data_update', {
    ...broadcast,
    affectedMetrics: ['totalRO', 'klStats', 'yearlyProgress'] // Which dashboard metrics are affected
  });
  
  console.log(`🎯 RAN PAUD update broadcasted: ${type} for ${klId || 'all K/L'}`);
};

// Broadcast dashboard stats update
const broadcastDashboardUpdate = (io, stats) => {
  io.to('dashboard_updates').emit('dashboard_stats_update', {
    type: 'stats_update',
    data: stats,
    timestamp: new Date().toISOString()
  });
  
  console.log('📊 Dashboard stats update broadcasted');
};

// Broadcast import progress
const broadcastImportProgress = (io, progressData) => {
  const { sessionId, progress, status, results, userId } = progressData;
  
  io.to('import_progress').emit('import_progress_update', {
    sessionId,
    progress,
    status, // 'processing', 'completed', 'failed'
    results,
    userId,
    timestamp: new Date().toISOString()
  });
  
  // Also notify specific user if socket ID available
  if (progressData.socketId) {
    io.to(progressData.socketId).emit('import_status', {
      sessionId,
      progress,
      status,
      results,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log(`📥 Import progress broadcasted: ${progress}% (${status})`);
};

// Broadcast system notification
const broadcastSystemNotification = (io, notification) => {
  const { title, message, type, targetRoles = ['super_admin', 'admin'] } = notification;
  
  const notificationData = {
    id: Date.now(),
    title,
    message,
    type, // 'info', 'warning', 'error', 'success'
    timestamp: new Date().toISOString()
  };
  
  // Send to admin room
  io.to('admin_room').emit('system_notification', notificationData);
  
  // Also send to specific users based on role
  io.sockets.sockets.forEach((socket) => {
    if (socket.user && targetRoles.includes(socket.user.role)) {
      socket.emit('notification', notificationData);
    }
  });
  
  console.log(`📢 System notification broadcasted: ${title} (${type})`);
};

// Broadcast user activity
const broadcastUserActivity = (io, activity) => {
  const { userId, action, resource, klId } = activity;
  
  const activityData = {
    userId,
    action, // 'created', 'updated', 'deleted', 'imported'
    resource, // 'ran_paud_data', 'report', 'import'
    klId,
    timestamp: new Date().toISOString()
  };
  
  // Send to admin room for monitoring
  io.to('admin_room').emit('user_activity', activityData);
  
  console.log(`👤 User activity broadcasted: ${userId} ${action} ${resource}`);
};

// ===== UTILITY FUNCTIONS =====

// Get live statistics (mock implementation)
const getLiveStats = async () => {
  // This would typically query the database
  return {
    totalRO: 99,
    totalKL: 11,
    tercapai: 45,
    tidakTercapai: 30,
    belumLapor: 24,
    lastUpdated: new Date().toISOString()
  };
};

// Get K/L specific data (mock implementation)
const getKLData = async (klId) => {
  // This would typically query the database for specific K/L
  return {
    klId,
    klName: `K/L ${klId}`,
    totalRO: 10,
    progress: {
      tercapai: 6,
      tidakTercapai: 2,
      belumLapor: 2
    },
    lastUpdated: new Date().toISOString()
  };
};

// Get connected users count
const getConnectedUsersCount = (io) => {
  const rooms = {
    total: io.engine.clientsCount,
    admin: io.sockets.adapter.rooms.get('admin_room')?.size || 0,
    ranpaud: io.sockets.adapter.rooms.get('ranpaud_room')?.size || 0,
    dashboard: io.sockets.adapter.rooms.get('dashboard_updates')?.size || 0
  };
  
  return rooms;
};

// Cleanup inactive connections
const cleanupConnections = (io) => {
  console.log('🧹 Cleaning up inactive WebSocket connections...');
  
  io.sockets.sockets.forEach((socket) => {
    if (!socket.connected) {
      socket.disconnect(true);
    }
  });
  
  console.log(`🧹 Cleanup completed. Active connections: ${io.engine.clientsCount}`);
};

// ===== MONITORING AND HEALTH =====

// Monitor WebSocket health
const monitorWebSocketHealth = (io) => {
  setInterval(() => {
    const stats = {
      totalConnections: io.engine.clientsCount,
      rooms: getConnectedUsersCount(io),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    // Log stats every 5 minutes
    console.log('🔌 WebSocket Health:', JSON.stringify(stats, null, 2));
    
    // Broadcast to admin room
    io.to('admin_room').emit('websocket_health', stats);
    
    // Cleanup inactive connections every 30 minutes
    if (Math.floor(process.uptime()) % 1800 === 0) {
      cleanupConnections(io);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

// ===== FRONTEND INTEGRATION HELPERS =====

// Client-side WebSocket setup (for documentation)
const clientWebSocketSetup = `
// Frontend WebSocket Setup (React)
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || '', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

// Connection handlers
socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join RAN PAUD room
  socket.emit('join_ranpaud');
  
  // Subscribe to dashboard updates
  socket.emit('subscribe_dashboard');
});

// Data update handlers
socket.on('data_update', (data) => {
  console.log('RAN PAUD data updated:', data);
  // Update your local state/cache
});

socket.on('dashboard_stats_update', (stats) => {
  console.log('Dashboard stats updated:', stats);
  // Update dashboard metrics
});

// Import progress handler
socket.on('import_progress_update', (progress) => {
  console.log('Import progress:', progress);
  // Update progress bar
});

// Error handler
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

export default socket;
`;

module.exports = {
  setupWebSocket,
  broadcastRanPaudUpdate,
  broadcastDashboardUpdate,
  broadcastImportProgress,
  broadcastSystemNotification,
  broadcastUserActivity,
  getConnectedUsersCount,
  cleanupConnections,
  monitorWebSocketHealth,
  clientWebSocketSetup // For documentation
};