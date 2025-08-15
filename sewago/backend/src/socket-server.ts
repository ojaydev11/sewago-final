import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { BookingModel } from "./models/Booking.js";
import { ProviderModel } from "./models/Provider.js";

export function createSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store active connections
  const activeConnections = new Map<string, string>(); // socketId -> userId
  const userRooms = new Map<string, string[]>(); // userId -> roomIds[]

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join booking room for real-time tracking
    socket.on("joinBookingRoom", async (data: { bookingId: string; userId: string }) => {
      try {
        const { bookingId, userId } = data;
        
        // Verify user has access to this booking
        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
          socket.emit("error", { message: "Booking not found" });
          return;
        }

        if (booking.userId.toString() !== userId && booking.providerId?.toString() !== userId) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        // Join the booking room
        socket.join(`booking:${bookingId}`);
        
        // Track user's rooms
        if (!userRooms.has(userId)) {
          userRooms.set(userId, []);
        }
        userRooms.get(userId)!.push(`booking:${bookingId}`);
        
        // Store connection mapping
        activeConnections.set(socket.id, userId);
        
        console.log(`User ${userId} joined booking room: ${bookingId}`);
        
        // Send current booking status
        socket.emit("bookingStatus", { 
          status: booking.status,
          providerId: booking.providerId 
        });
        
      } catch (error) {
        console.error("Error joining booking room:", error);
        socket.emit("error", { message: "Failed to join booking room" });
      }
    });

    // Provider location update
    socket.on("providerLocationUpdate", async (data: { 
      providerId: string; 
      lat: number; 
      lng: number;
      isOnline: boolean;
    }) => {
      try {
        const { providerId, lat, lng, isOnline } = data;
        
        // Update provider location in database
        await ProviderModel.findByIdAndUpdate(providerId, {
          currentLat: lat,
          currentLng: lng,
          isOnline: isOnline,
        });

        // Broadcast location update to all users tracking this provider
        const providerBookings = await BookingModel.find({
          providerId: providerId,
          status: { $in: ["PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] }
        });

        providerBookings.forEach(booking => {
          io.to(`booking:${booking._id}`).emit("providerLocationUpdated", {
            providerId,
            lat,
            lng,
            isOnline,
            timestamp: new Date(),
          });
        });

        console.log(`Provider ${providerId} location updated: ${lat}, ${lng}`);
        
      } catch (error) {
        console.error("Error updating provider location:", error);
      }
    });

    // Provider status update
    socket.on("providerStatusUpdate", async (data: { 
      providerId: string; 
      isOnline: boolean;
    }) => {
      try {
        const { providerId, isOnline } = data;
        
        // Update provider status in database
        await ProviderModel.findByIdAndUpdate(providerId, {
          isOnline: isOnline,
        });

        // Broadcast status update to all users tracking this provider
        const providerBookings = await BookingModel.find({
          providerId: providerId,
          status: { $in: ["PROVIDER_ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] }
        });

        providerBookings.forEach(booking => {
          io.to(`booking:${booking._id}`).emit("providerStatusUpdated", {
            providerId,
            isOnline,
            timestamp: new Date(),
          });
        });

        console.log(`Provider ${providerId} status updated: ${isOnline}`);
        
      } catch (error) {
        console.error("Error updating provider status:", error);
      }
    });

    // Booking status update
    socket.on("bookingStatusUpdate", async (data: { 
      bookingId: string; 
      status: string;
      providerId?: string;
    }) => {
      try {
        const { bookingId, status, providerId } = data;
        
        // Update booking status in database
        const updateData: any = { status };
        if (providerId) {
          updateData.providerId = providerId;
        }
        
        await BookingModel.findByIdAndUpdate(bookingId, updateData);

        // Broadcast status update to all users in the booking room
        io.to(`booking:${bookingId}`).emit("bookingStatusUpdated", {
          bookingId,
          status,
          providerId,
          timestamp: new Date(),
        });

        console.log(`Booking ${bookingId} status updated: ${status}`);
        
      } catch (error) {
        console.error("Error updating booking status:", error);
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      const userId = activeConnections.get(socket.id);
      if (userId) {
        // Clean up user's rooms
        const rooms = userRooms.get(userId) || [];
        rooms.forEach(roomId => {
          socket.leave(roomId);
        });
        userRooms.delete(userId);
        activeConnections.delete(socket.id);
        
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  return io;
}

// Helper function to emit events from outside socket context
export function emitToBookingRoom(io: SocketIOServer, bookingId: string, event: string, data: any) {
  io.to(`booking:${bookingId}`).emit(event, data);
}

// Helper function to emit events to specific user
export function emitToUser(io: SocketIOServer, userId: string, event: string, data: any) {
  const userRooms = Array.from(io.sockets.adapter.rooms.entries())
    .filter(([roomId, sockets]) => roomId.startsWith(`user:${userId}`))
    .map(([roomId]) => roomId);
  
  userRooms.forEach(roomId => {
    io.to(roomId).emit(event, data);
  });
}
