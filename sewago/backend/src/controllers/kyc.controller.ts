import { Request, Response } from "express";
import { UserModel } from "../models/User.js";
import { NotificationModel } from "../models/Notification.js";
import { v4 as uuidv4 } from "uuid";

// Submit KYC application
export const submitKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      businessName, 
      categories, 
      description, 
      baseLocation,
      documents,
      address,
      emergencyContact 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can submit KYC" });
    }

    // Check if KYC is already submitted
    if (user.provider?.kycStatus === "PENDING" || user.provider?.kycStatus === "APPROVED") {
      return res.status(400).json({ message: "KYC already submitted or approved" });
    }

    // Validate required documents
    if (!documents || documents.length === 0) {
      return res.status(400).json({ message: "At least one document is required" });
    }

    // Validate document types
    const requiredDocTypes = ["NID", "PASSPORT", "DRIVERS_LICENSE"];
    const hasRequiredDoc = documents.some((doc: any) => 
      requiredDocTypes.includes(doc.documentType)
    );

    if (!hasRequiredDoc) {
      return res.status(400).json({ 
        message: "At least one government-issued ID is required" 
      });
    }

    // Update user with KYC information
    user.provider = {
      ...user.provider,
      businessName: businessName || user.provider?.businessName,
      categories: categories || user.provider?.categories,
      description: description || user.provider?.description,
      baseLocation: baseLocation || user.provider?.baseLocation,
      kycStatus: "PENDING",
      kycSubmittedAt: new Date(),
      kycDocuments: documents.map((doc: any) => ({
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        documentUrl: doc.documentUrl,
        uploadedAt: new Date(),
        verificationStatus: "PENDING"
      })),
      address: address || user.profile?.address,
      emergencyContact: emergencyContact || user.profile?.emergencyContact
    };

    await user.save();

    // Create notification for admin
    await NotificationModel.create({
      userId: "admin", // Will be sent to all admins
      title: "New KYC Application",
      message: `Provider ${user.name} has submitted KYC application`,
      type: "KYC_SUBMITTED",
      priority: "HIGH",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "EMAIL", status: "PENDING" }
      ],
      metadata: {
        providerId: userId,
        providerName: user.name,
        businessName: businessName,
        documentCount: documents.length
      },
      tags: ["kyc", "provider", "verification"]
    });

    res.json({
      success: true,
      message: "KYC application submitted successfully",
      kycStatus: user.provider?.kycStatus,
      submittedAt: user.provider?.kycSubmittedAt
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get KYC status
export const getKYCStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can view KYC status" });
    }

    const kycInfo = {
      status: user.provider?.kycStatus || "NOT_SUBMITTED",
      submittedAt: user.provider?.kycSubmittedAt,
      approvedAt: user.provider?.kycApprovedAt,
      rejectedAt: user.provider?.kycRejectedAt,
      rejectionReason: user.provider?.kycRejectionReason,
      documents: user.provider?.kycDocuments || [],
      businessName: user.provider?.businessName,
      categories: user.provider?.categories,
      description: user.provider?.description,
      baseLocation: user.provider?.baseLocation
    };

    res.json({
      success: true,
      kyc: kycInfo
    });
  } catch (error) {
    console.error("Error getting KYC status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update KYC information
export const updateKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      businessName, 
      categories, 
      description, 
      baseLocation,
      address,
      emergencyContact 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can update KYC" });
    }

    // Only allow updates if KYC is not approved
    if (user.provider?.kycStatus === "APPROVED") {
      return res.status(400).json({ message: "Cannot update approved KYC" });
    }

    // Update KYC information
    if (businessName) user.provider.businessName = businessName;
    if (categories) user.provider.categories = categories;
    if (description) user.provider.description = description;
    if (baseLocation) user.provider.baseLocation = baseLocation;
    if (address) user.profile?.address = address;
    if (emergencyContact) user.profile?.emergencyContact = emergencyContact;

    await user.save();

    res.json({
      success: true,
      message: "KYC information updated successfully",
      kyc: {
        businessName: user.provider.businessName,
        categories: user.provider.categories,
        description: user.provider.description,
        baseLocation: user.provider.baseLocation,
        address: user.profile?.address,
        emergencyContact: user.profile?.emergencyContact
      }
    });
  } catch (error) {
    console.error("Error updating KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add KYC document
export const addKYCDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { documentType, documentNumber, documentUrl } = req.body;

    if (!userId || !documentType || !documentNumber || !documentUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can add KYC documents" });
    }

    // Check if KYC is already approved
    if (user.provider?.kycStatus === "APPROVED") {
      return res.status(400).json({ message: "Cannot add documents to approved KYC" });
    }

    // Check if document type already exists
    const existingDoc = user.provider?.kycDocuments?.find(
      (doc: any) => doc.documentType === documentType
    );

    if (existingDoc) {
      return res.status(400).json({ 
        message: `Document type ${documentType} already exists` 
      });
    }

    // Add document
    const newDocument = {
      documentType,
      documentNumber,
      documentUrl,
      uploadedAt: new Date(),
      verificationStatus: "PENDING"
    };

    if (!user.provider?.kycDocuments) {
      user.provider!.kycDocuments = [];
    }
    user.provider!.kycDocuments.push(newDocument);

    if (user.provider!.kycStatus !== "PENDING") {
      user.provider!.kycStatus = "PENDING";
      user.provider!.kycSubmittedAt = new Date();
    }

    await user.save();

    res.json({
      success: true,
      message: "Document added successfully",
      document: newDocument,
      kycStatus: user.provider?.kycStatus
    });
  } catch (error) {
    console.error("Error adding KYC document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove KYC document
export const removeKYCDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { documentType } = req.params;

    if (!userId || !documentType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can remove KYC documents" });
    }

    // Check if KYC is already approved
    if (user.provider?.kycStatus === "APPROVED") {
      return res.status(400).json({ message: "Cannot remove documents from approved KYC" });
    }

    // Find and remove document
    const docIndex = user.provider?.kycDocuments?.findIndex(
      (doc: any) => doc.documentType === documentType
    );

    if (docIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    user.provider.kycDocuments.splice(docIndex, 1);

    // Update KYC status if no documents remain
    if (user.provider.kycDocuments.length === 0) {
      user.provider.kycStatus = "NOT_SUBMITTED";
      user.provider.kycSubmittedAt = undefined;
    }

    await user.save();

    res.json({
      success: true,
      message: "Document removed successfully",
      remainingDocuments: user.provider.kycDocuments.length,
      kycStatus: user.provider.kycStatus
    });
  } catch (error) {
    console.error("Error removing KYC document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: Get pending KYC applications
export const getPendingKYC = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { page = 1, limit = 20, status } = req.query;

    const filter: any = {
      role: "provider",
      "provider.kycStatus": status || "PENDING"
    };

    const skip = (Number(page) - 1) * Number(limit);

    const providers = await UserModel.find(filter)
      .select("name email phone provider.kycStatus provider.kycSubmittedAt provider.businessName provider.kycDocuments")
      .sort({ "provider.kycSubmittedAt": 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await UserModel.countDocuments(filter);

    res.json({
      success: true,
      providers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error getting pending KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: Approve KYC application
export const approveKYC = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { providerId } = req.params;
    const { notes } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const provider = await UserModel.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.provider?.kycStatus !== "PENDING") {
      return res.status(400).json({ message: "KYC is not pending approval" });
    }

    // Approve KYC
    provider.provider.kycStatus = "APPROVED";
    provider.provider.kycApprovedAt = new Date();
    provider.provider.kycApprovedBy = adminId;
    provider.provider.isVerified = true;

    // Add verified badge
    provider.addBadge("VERIFIED", "KYC verified provider", undefined);

    await provider.save();

    // Create notification for provider
    await NotificationModel.create({
      userId: providerId,
      title: "KYC Approved",
      message: "Your KYC application has been approved. You can now receive bookings.",
      type: "KYC_APPROVED",
      priority: "HIGH",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "EMAIL", status: "PENDING" },
        { channel: "PUSH", status: "PENDING" }
      ],
      metadata: {
        approvedBy: adminId,
        approvedAt: new Date(),
        notes
      },
      tags: ["kyc", "approved", "provider"]
    });

    res.json({
      success: true,
      message: "KYC approved successfully",
      provider: {
        id: provider._id,
        name: provider.name,
        businessName: provider.provider.businessName,
        kycStatus: provider.provider.kycStatus,
        approvedAt: provider.provider.kycApprovedAt
      }
    });
  } catch (error) {
    console.error("Error approving KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: Reject KYC application
export const rejectKYC = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { providerId } = req.params;
    const { reason, notes } = req.body;

    if (!adminId || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const provider = await UserModel.findById(providerId);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.provider?.kycStatus !== "PENDING") {
      return res.status(400).json({ message: "KYC is not pending approval" });
    }

    // Reject KYC
    provider.provider.kycStatus = "REJECTED";
    provider.provider.kycRejectedAt = new Date();
    provider.provider.kycRejectionReason = reason;

    await provider.save();

    // Create notification for provider
    await NotificationModel.create({
      userId: providerId,
      title: "KYC Rejected",
      message: `Your KYC application has been rejected. Reason: ${reason}`,
      type: "KYC_REJECTED",
      priority: "HIGH",
      channels: [
        { channel: "IN_APP", status: "PENDING" },
        { channel: "EMAIL", status: "PENDING" },
        { channel: "PUSH", status: "PENDING" }
      ],
      metadata: {
        rejectedBy: adminId,
        rejectedAt: new Date(),
        reason,
        notes
      },
      tags: ["kyc", "rejected", "provider"]
    });

    res.json({
      success: true,
      message: "KYC rejected successfully",
      provider: {
        id: provider._id,
        name: provider.name,
        businessName: provider.provider.businessName,
        kycStatus: provider.provider.kycStatus,
        rejectionReason: provider.provider.kycRejectionReason
      }
    });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
