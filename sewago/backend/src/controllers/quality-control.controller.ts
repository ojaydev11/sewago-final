import { Request, Response } from "express";
import { QualityControlModel } from "../models/QualityControl.js";
import { ServiceModel } from "../models/Service.js";
import { UserModel } from "../models/User.js";
import { BookingModel } from "../models/Booking.js";

// Get service guarantees
export const getServiceGuarantees = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({});
    }

    let guarantees = qualityControl.serviceGuarantees;
    
    if (serviceId) {
      guarantees = guarantees.filter(g => g.serviceId.toString() === serviceId);
    }

    res.json({
      success: true,
      guarantees
    });
  } catch (error) {
    console.error("Error getting service guarantees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create service guarantee
export const createServiceGuarantee = async (req: Request, res: Response) => {
  try {
    const { serviceId, guaranteeType, description, terms, validityHours, compensation } = req.body;

    if (!serviceId || !guaranteeType || !description) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({});
    }

    const guarantee = {
      serviceId,
      guaranteeType,
      description,
      terms: terms || "",
      validityHours: validityHours || 24,
      compensation: compensation || {
        type: "REFUND",
        amount: 0,
        percentage: 0
      }
    };

    if (!qualityControl.serviceGuarantees) {
      qualityControl.serviceGuarantees = [];
    }
    (qualityControl.serviceGuarantees as any).push(guarantee);
    await qualityControl.save();

    res.json({
      success: true,
      message: "Service guarantee created successfully",
      guarantee
    });
  } catch (error) {
    console.error("Error creating service guarantee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get quality metrics
export const getQualityMetrics = async (req: Request, res: Response) => {
  try {
    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      // Initialize with default metrics
      qualityControl = await QualityControlModel.create({
        qualityMetrics: [
          {
            metricName: "Response Time",
            metricType: "RESPONSE_TIME",
            target: 15, // minutes
            current: 0,
            unit: "minutes",
            weight: 0.3
          },
          {
            metricName: "Completion Rate",
            metricType: "COMPLETION_RATE",
            target: 95, // percentage
            current: 0,
            unit: "percentage",
            weight: 0.4
          },
          {
            metricName: "Customer Satisfaction",
            metricType: "CUSTOMER_SATISFACTION",
            target: 4.5, // rating
            current: 0,
            unit: "rating",
            weight: 0.3
          }
        ]
      });
    }

    // Update current metrics with real data
    await updateQualityMetrics(qualityControl);

    res.json({
      success: true,
      metrics: qualityControl.qualityMetrics
    });
  } catch (error) {
    console.error("Error getting quality metrics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get provider quality scores
export const getProviderQualityScores = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({});
    }

    let scores = qualityControl.providerQualityScores;
    
    if (providerId) {
      scores = scores.filter(s => s.providerId.toString() === providerId);
    }

    // Populate provider information
    const scoresWithProviders = await Promise.all(
      scores.map(async (score) => {
        const provider = await UserModel.findById(score.providerId).select("name avatarUrl provider");
        return {
          ...score.toObject(),
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
      scores: scoresWithProviders
    });
  } catch (error) {
    console.error("Error getting provider quality scores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Report quality incident
export const reportQualityIncident = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookingId, incidentType, severity, description } = req.body;

    if (!userId || !bookingId || !incidentType || !severity || !description) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Verify booking exists and user has access
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId && booking.providerId?.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({});
    }

    const incident = {
      bookingId,
      incidentType,
      severity,
      description,
      reportedBy: userId,
      reportedAt: new Date(),
      status: "REPORTED",
      resolution: {}
    };

    if (!qualityControl.qualityIncidents) {
      qualityControl.qualityIncidents = [];
    }
    (qualityControl.qualityIncidents as any).push(incident);
    await qualityControl.save();

    // Trigger quality assurance process
    await triggerQualityAssurance(incident, qualityControl);

    res.json({
      success: true,
      message: "Quality incident reported successfully",
      incidentId: incident._id,
      nextSteps: getIncidentNextSteps(severity)
    });
  } catch (error) {
    console.error("Error reporting quality incident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Resolve quality incident
export const resolveQualityIncident = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { incidentId } = req.params;
    const { action, compensation } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      return res.status(404).json({ message: "Quality control not found" });
    }

    const incident = (qualityControl.qualityIncidents as any).id(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // Update incident resolution
    incident.resolution = {
      action,
      compensation: compensation || "",
      resolvedAt: new Date(),
      resolvedBy: userId
    };

    incident.status = "RESOLVED";
    await qualityControl.save();

    res.json({
      success: true,
      message: "Incident resolved successfully",
      resolution: incident.resolution
    });
  } catch (error) {
    console.error("Error resolving quality incident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get quality assurance settings
export const getQualityAssuranceSettings = async (req: Request, res: Response) => {
  try {
    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({
        qualityAssurance: {
          autoReviewThreshold: 4.0,
          manualReviewRequired: true,
          reviewFrequency: "WEEKLY",
          escalationRules: [
            {
              condition: "Rating below 3.0",
              action: "Immediate review required",
              threshold: 3.0
            },
            {
              condition: "Multiple complaints",
              action: "Provider suspension",
              threshold: 5
            }
          ]
        }
      });
    }

    res.json({
      success: true,
      qualityAssurance: qualityControl.qualityAssurance
    });
  } catch (error) {
    console.error("Error getting quality assurance settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update quality assurance settings
export const updateQualityAssuranceSettings = async (req: Request, res: Response) => {
  try {
    const { autoReviewThreshold, manualReviewRequired, reviewFrequency, escalationRules } = req.body;

    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({});
    }

    qualityControl.qualityAssurance = {
      autoReviewThreshold: autoReviewThreshold || 4.0,
      manualReviewRequired: manualReviewRequired !== undefined ? manualReviewRequired : true,
      reviewFrequency: reviewFrequency || "WEEKLY",
      escalationRules: escalationRules || qualityControl.qualityAssurance?.escalationRules || []
    };

    await qualityControl.save();

    res.json({
      success: true,
      message: "Quality assurance settings updated successfully",
      qualityAssurance: qualityControl.qualityAssurance
    });
  } catch (error) {
    console.error("Error updating quality assurance settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get feedback analysis
export const getFeedbackAnalysis = async (req: Request, res: Response) => {
  try {
    let qualityControl = await QualityControlModel.findOne();
    if (!qualityControl) {
      qualityControl = await QualityControlModel.create({
        feedbackAnalysis: {
          sentimentScores: [],
          commonIssues: [],
          improvementSuggestions: []
        }
      });
    }

    // Update feedback analysis with real data
    await updateFeedbackAnalysis(qualityControl);

    res.json({
      success: true,
      feedbackAnalysis: qualityControl.feedbackAnalysis
    });
  } catch (error) {
    console.error("Error getting feedback analysis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions
async function updateQualityMetrics(qualityControl: any) {
  try {
    // Update response time metric
    const responseTimeMetric = qualityControl.qualityMetrics.find((m: any) => m.metricType === "RESPONSE_TIME");
    if (responseTimeMetric) {
      const recentBookings = await BookingModel.find({
        status: { $in: ["CONFIRMED", "PROVIDER_ASSIGNED"] },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (recentBookings.length > 0) {
        const totalResponseTime = recentBookings.reduce((sum, booking) => {
          const responseTime = new Date(booking.updatedAt).getTime() - new Date(booking.createdAt).getTime();
          return sum + (responseTime / (1000 * 60)); // Convert to minutes
        }, 0);
        responseTimeMetric.current = Math.round(totalResponseTime / recentBookings.length);
      }
    }

    // Update completion rate metric
    const completionRateMetric = qualityControl.qualityMetrics.find((m: any) => m.metricType === "COMPLETION_RATE");
    if (completionRateMetric) {
      const totalBookings = await BookingModel.countDocuments();
      const completedBookings = await BookingModel.countDocuments({ status: "COMPLETED" });
      completionRateMetric.current = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    }

    // Update customer satisfaction metric
    const satisfactionMetric = qualityControl.qualityMetrics.find((m: any) => m.metricType === "CUSTOMER_SATISFACTION");
    if (satisfactionMetric) {
      const providers = await UserModel.find({ role: "provider" });
      const totalRating = providers.reduce((sum, p) => sum + (p.provider?.rating || 0), 0);
      satisfactionMetric.current = providers.length > 0 ? Math.round((totalRating / providers.length) * 10) / 10 : 0;
    }

    await qualityControl.save();
  } catch (error) {
    console.error("Error updating quality metrics:", error);
  }
}

async function triggerQualityAssurance(incident: any, qualityControl: any) {
  try {
    // Check if incident meets escalation criteria
    const escalationRules = qualityControl.qualityAssurance?.escalationRules || [];
    
    for (const rule of escalationRules) {
      if (incident.severity === "CRITICAL" || incident.severity === "HIGH") {
        // Auto-escalate critical incidents
        incident.status = "ESCALATED";
        await qualityControl.save();
        break;
      }
    }

    // Send notifications (in real app, this would use notification service)
    console.log(`Quality incident escalated: ${incident._id}`);
  } catch (error) {
    console.error("Error triggering quality assurance:", error);
  }
}

function getIncidentNextSteps(severity: string): string[] {
  switch (severity) {
    case "CRITICAL":
      return ["Immediate escalation", "Provider suspension", "Customer compensation"];
    case "HIGH":
      return ["Priority investigation", "Provider review", "Quality improvement plan"];
    case "MEDIUM":
      return ["Standard investigation", "Provider feedback", "Monitoring"];
    case "LOW":
      return ["Documentation", "Provider notification", "Follow-up"];
    default:
      return ["Investigation", "Resolution", "Follow-up"];
  }
}

async function updateFeedbackAnalysis(qualityControl: any) {
  try {
    // Get recent reviews and feedback
    const recentBookings = await BookingModel.find({
      status: "COMPLETED",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).limit(100);

    // Calculate sentiment scores (mock calculation)
    const totalBookings = recentBookings.length;
    const positiveBookings = Math.floor(totalBookings * 0.7);
    const neutralBookings = Math.floor(totalBookings * 0.2);
    const negativeBookings = totalBookings - positiveBookings - neutralBookings;

    qualityControl.feedbackAnalysis.sentimentScores = [
      {
        period: "Last 30 days",
        positive: positiveBookings,
        neutral: neutralBookings,
        negative: negativeBookings,
        total: totalBookings
      }
    ];

    // Common issues (mock data)
    qualityControl.feedbackAnalysis.commonIssues = [
      {
        issue: "Late arrival",
        frequency: Math.floor(totalBookings * 0.1),
        category: "Timeliness"
      },
      {
        issue: "Service quality",
        frequency: Math.floor(totalBookings * 0.05),
        category: "Quality"
      }
    ];

    await qualityControl.save();
  } catch (error) {
    console.error("Error updating feedback analysis:", error);
  }
}
