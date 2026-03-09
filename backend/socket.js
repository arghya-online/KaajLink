// Socket.IO live tracking manager for KaajLink
// Handles real-time worker location updates and booking tracking

const activeWorkers = new Map();   // workerId -> { lat, lng, socketId, lastUpdate }
const bookingRooms = new Map();    // bookingId -> { workerId, customerId }

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Worker Events ────────────────────────────────────

    // Worker comes online and shares location
    socket.on('worker:online', ({ workerId, lat, lng }) => {
      activeWorkers.set(workerId, {
        lat,
        lng,
        socketId: socket.id,
        lastUpdate: Date.now(),
      });
      socket.join(`worker:${workerId}`);
      console.log(`Worker online: ${workerId} at ${lat},${lng}`);
    });

    // Worker updates location (called every few seconds while online)
    socket.on('worker:location-update', ({ workerId, lat, lng }) => {
      const existing = activeWorkers.get(workerId) || {};
      activeWorkers.set(workerId, {
        ...existing,
        lat,
        lng,
        socketId: socket.id,
        lastUpdate: Date.now(),
      });

      // Broadcast to any customer tracking this worker
      socket.to(`track:${workerId}`).emit('worker:location-changed', {
        workerId,
        lat,
        lng,
        timestamp: Date.now(),
      });
    });

    // Worker goes offline
    socket.on('worker:offline', ({ workerId }) => {
      activeWorkers.delete(workerId);
      socket.leave(`worker:${workerId}`);
      console.log(`Worker offline: ${workerId}`);
    });

    // ─── Customer Events ──────────────────────────────────

    // Customer starts tracking a worker (after booking is confirmed)
    socket.on('customer:track-worker', ({ workerId, bookingId }) => {
      socket.join(`track:${workerId}`);

      // Send current worker location immediately if available
      const workerLoc = activeWorkers.get(workerId);
      if (workerLoc) {
        socket.emit('worker:location-changed', {
          workerId,
          lat: workerLoc.lat,
          lng: workerLoc.lng,
          timestamp: workerLoc.lastUpdate,
        });
      }

      // Register booking room
      if (bookingId) {
        bookingRooms.set(bookingId, {
          workerId,
          customerSocketId: socket.id,
        });
        socket.join(`booking:${bookingId}`);
      }

      console.log(`Customer tracking worker: ${workerId}`);
    });

    // Customer stops tracking
    socket.on('customer:stop-tracking', ({ workerId }) => {
      socket.leave(`track:${workerId}`);
    });

    // ─── Booking Status Events ────────────────────────────

    // Worker updates booking status (accepted, started, completed)
    socket.on('booking:status-update', ({ bookingId, status, workerId }) => {
      io.to(`booking:${bookingId}`).emit('booking:status-changed', {
        bookingId,
        status,
        timestamp: Date.now(),
      });
    });

    // ─── Get active workers for map ───────────────────────

    socket.on('get:active-workers', (callback) => {
      const workers = [];
      activeWorkers.forEach((data, id) => {
        // Only include workers updated in last 5 minutes
        if (Date.now() - data.lastUpdate < 5 * 60 * 1000) {
          workers.push({ workerId: id, lat: data.lat, lng: data.lng });
        }
      });
      if (typeof callback === 'function') {
        callback(workers);
      }
    });

    // ─── Disconnect ───────────────────────────────────────

    socket.on('disconnect', () => {
      // Clean up worker on disconnect
      for (const [workerId, data] of activeWorkers.entries()) {
        if (data.socketId === socket.id) {
          activeWorkers.delete(workerId);
          console.log(`Worker disconnected: ${workerId}`);
          break;
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Clean up stale workers every minute
  setInterval(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    for (const [workerId, data] of activeWorkers.entries()) {
      if (data.lastUpdate < fiveMinAgo) {
        activeWorkers.delete(workerId);
      }
    }
  }, 60000);

  console.log('Socket.IO live tracking initialized');
}

export default initializeSocket;
