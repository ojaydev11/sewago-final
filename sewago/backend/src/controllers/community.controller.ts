import { Request, Response } from "express";
import { CommunityModel } from "../models/Community.js";
import { UserModel } from "../models/User.js";
import { BookingModel } from "../models/Booking.js";
import mongoose from "mongoose";

// Create user story
export const createUserStory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content, images, serviceCategory, location } = req.body;

    if (!userId || !title || !content) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let community = await CommunityModel.findOne();
    if (!community) {
      community = await CommunityModel.create({});
    }

    const userStory = {
      userId,
      title,
      content,
      images: images || [],
      serviceCategory,
      location,
      rating: 0,
      likes: [],
      comments: [],
      isVerified: false,
      isFeatured: false,
      status: "DRAFT"
    };

    community.userStories.push(userStory);
    await community.save();

    res.json({
      success: true,
      message: "User story created successfully",
      userStory
    });
  } catch (error) {
    console.error("Error creating user story:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user stories
export const getUserStories = async (req: Request, res: Response) => {
  try {
    const { category, location, page = 1, limit = 10 } = req.query;

    let community = await CommunityModel.findOne();
    if (!community) {
      return res.json({ success: true, userStories: [], total: 0 });
    }

    let filteredStories = community.userStories.filter(story => 
      story.status === "PUBLISHED"
    );

    // Apply filters
    if (category) {
      filteredStories = filteredStories.filter(story => 
        story.serviceCategory === category
      );
    }

    if (location) {
      filteredStories = filteredStories.filter(story => 
        story.location === location
      );
    }

    // Pagination
    const total = filteredStories.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedStories = filteredStories.slice(startIndex, endIndex);

    // Populate user information
    const storiesWithUsers = await Promise.all(
      paginatedStories.map(async (story) => {
        const user = await UserModel.findById(story.userId).select("name avatarUrl");
        return {
          ...story.toObject(),
          user: user ? { name: user.name, avatarUrl: user.avatarUrl } : null
        };
      })
    );

    res.json({
      success: true,
      userStories: storiesWithUsers,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error("Error getting user stories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Like/unlike user story
export const toggleStoryLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { storyId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const community = await CommunityModel.findOne();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const story = community.userStories.id(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const likeIndex = story.likes.indexOf(userId);
    if (likeIndex > -1) {
      story.likes.splice(likeIndex, 1);
    } else {
      story.likes.push(userId);
    }

    await community.save();

    res.json({
      success: true,
      message: likeIndex > -1 ? "Story unliked" : "Story liked",
      likes: story.likes.length
    });
  } catch (error) {
    console.error("Error toggling story like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add comment to user story
export const addStoryComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { storyId } = req.params;
    const { content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const community = await CommunityModel.findOne();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const story = community.userStories.id(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    story.comments.push({
      userId,
      content,
      timestamp: new Date()
    });

    await community.save();

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: story.comments[story.comments.length - 1]
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create provider spotlight
export const createProviderSpotlight = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, achievements, specializations, images, videoUrl } = req.body;

    if (!userId || !title || !description) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Check if user is a provider
    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(400).json({ message: "Only providers can create spotlights" });
    }

    let community = await CommunityModel.findOne();
    if (!community) {
      community = await CommunityModel.create({});
    }

    // Get provider stats
    const bookings = await BookingModel.find({ providerId: userId });
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === "COMPLETED").length;
    const averageRating = user.provider?.rating || 0;

    const spotlight = {
      providerId: userId,
      title,
      description,
      achievements: achievements || [],
      specializations: specializations || [],
      images: images || [],
      videoUrl,
      stats: {
        totalBookings,
        averageRating,
        responseTime: 0, // Will be calculated based on actual data
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
      },
      isActive: true,
      startDate: new Date()
    };

    community.providerSpotlights.push(spotlight);
    await community.save();

    res.json({
      success: true,
      message: "Provider spotlight created successfully",
      spotlight
    });
  } catch (error) {
    console.error("Error creating provider spotlight:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get provider spotlights
export const getProviderSpotlights = async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    let community = await CommunityModel.findOne();
    if (!community) {
      return res.json({ success: true, spotlights: [], total: 0 });
    }

    let filteredSpotlights = community.providerSpotlights.filter(spotlight => 
      spotlight.isActive
    );

    // Apply category filter
    if (category) {
      filteredSpotlights = filteredSpotlights.filter(spotlight => 
        spotlight.specializations.includes(category)
      );
    }

    // Pagination
    const total = filteredSpotlights.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedSpotlights = filteredSpotlights.slice(startIndex, endIndex);

    // Populate provider information
    const spotlightsWithProviders = await Promise.all(
      paginatedSpotlights.map(async (spotlight) => {
        const provider = await UserModel.findById(spotlight.providerId).select("name avatarUrl provider");
        return {
          ...spotlight.toObject(),
          provider: provider ? { 
            name: provider.name, 
            avatarUrl: provider.avatarUrl,
            businessName: provider.provider?.businessName
          } : null
        };
      })
    );

    res.json({
      success: true,
      spotlights: spotlightsWithProviders,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error("Error getting provider spotlights:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get social proof statistics
export const getSocialProof = async (req: Request, res: Response) => {
  try {
    let community = await CommunityModel.findOne();
    if (!community) {
      // Initialize with default values
      community = await CommunityModel.create({
        socialProof: {
          totalUsers: 0,
          totalBookings: 0,
          averageRating: 0,
          totalReviews: 0,
          activeProviders: 0,
          citiesCovered: 0
        }
      });
    }

    // Update statistics from actual data
    const totalUsers = await UserModel.countDocuments();
    const totalBookings = await BookingModel.countDocuments();
    const activeProviders = await UserModel.countDocuments({ role: "provider" });

    // Calculate average rating
    const providers = await UserModel.find({ role: "provider" });
    const totalRating = providers.reduce((sum, p) => sum + (p.provider?.rating || 0), 0);
    const averageRating = providers.length > 0 ? totalRating / providers.length : 0;

    community.socialProof = {
      totalUsers,
      totalBookings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: community.userStories.filter(s => s.status === "PUBLISHED").length,
      activeProviders,
      citiesCovered: community.userStories.reduce((cities: string[], story) => {
        if (story.location && !cities.includes(story.location)) {
          cities.push(story.location);
        }
        return cities;
      }, [] as string[]).length
    };

    await community.save();

    res.json({
      success: true,
      socialProof: community.socialProof
    });
  } catch (error) {
    console.error("Error getting social proof:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create community event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, type, startDate, endDate, maxParticipants, rewards } = req.body;

    if (!userId || !title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let community = await CommunityModel.findOne();
    if (!community) {
      community = await CommunityModel.create({});
    }

    const event = {
      title,
      description,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      participants: [userId],
      maxParticipants: maxParticipants || null,
      rewards: rewards || [],
      status: "UPCOMING"
    };

    community.events.push(event);
    await community.save();

    res.json({
      success: true,
      message: "Event created successfully",
      event
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Join community event
export const joinEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const community = await CommunityModel.findOne();
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const event = community.events.id(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.participants.includes(new mongoose.Types.ObjectId(userId))) {
      return res.status(400).json({ message: "Already participating in this event" });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" });
    }

    event.participants.push(new mongoose.Types.ObjectId(userId));
    await community.save();

    res.json({
      success: true,
      message: "Joined event successfully",
      participants: event.participants.length
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
