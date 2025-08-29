'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useServiceProgress } from '@/hooks/useServiceProgress';
import { formatDistanceToNow, format } from 'date-fns';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Camera,
  MessageCircle,
  Star,
  Play,
  Pause,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  User,
  Route,
  Activity,
  Zap,
  Award
} from 'lucide-react';

interface ServiceProgressTrackerProps {
  bookingId: string;
  showTimeline?: boolean;
  showQualityChecks?: boolean;
  showIssues?: boolean;
  allowCustomerActions?: boolean;
  compact?: boolean;
  className?: string;
}

export default function ServiceProgressTracker({
  bookingId,
  showTimeline = true,
  showQualityChecks = true,
  showIssues = true,
  allowCustomerActions = true,
  compact = false,
  className = ''
}: ServiceProgressTrackerProps) {
  const {
    progressData,
    isLoading,
    error,
    realTimeUpdates,
    trackProgress,
    submitApproval,
    reportIssue,
    getStageInfo,
    toggleRealTimeUpdates,
    isConnected
  } = useServiceProgress();

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approved: true,
    comments: '',
    rating: 5
  });
  const [issueData, setIssueData] = useState({
    type: 'QUALITY' as const,
    severity: 'MEDIUM' as const,
    description: ''
  });

  useEffect(() => {
    trackProgress(bookingId);
  }, [bookingId, trackProgress]);

  const handleApproval = async () => {
    if (!selectedMilestone) return;
    
    try {
      await submitApproval(
        bookingId,
        selectedMilestone,
        approvalData.approved,
        approvalData.comments,
        approvalData.rating
      );
      setShowApprovalModal(false);
      setSelectedMilestone(null);
    } catch (error) {
      console.error('Failed to submit approval:', error);
    }
  };

  const handleIssueReport = async () => {
    try {
      await reportIssue(
        bookingId,
        issueData.type,
        issueData.severity,
        issueData.description
      );
      setShowIssueModal(false);
      setIssueData({ type: 'QUALITY', severity: 'MEDIUM', description: '' });
    } catch (error) {
      console.error('Failed to report issue:', error);
    }
  };

  const getStageIcon = (stage: string) => {
    const stageInfo = getStageInfo(stage as any);
    return stageInfo.icon;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-yellow-100 text-yellow-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progressData) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Unable to track service progress'}</span>
          </div>
          <Button onClick={() => trackProgress(bookingId)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 bg-white rounded-lg shadow-sm border ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Service Progress</h3>
          <Badge variant="outline">{progressData.progressPercentage}% Complete</Badge>
        </div>
        
        <Progress value={progressData.progressPercentage} className="h-3 mb-3" />
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-2xl">{getStageIcon(progressData.currentStage)}</span>
          <span className="font-medium">{getStageInfo(progressData.currentStage).label}</span>
        </div>
        
        {progressData.estimatedCompletion && (
          <div className="text-xs text-gray-500 mt-2">
            Est. completion: {format(new Date(progressData.estimatedCompletion), 'MMM dd, HH:mm')}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Service Progress Tracker</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {progressData.progressPercentage}% Complete
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleRealTimeUpdates(!realTimeUpdates)}
                className="p-1"
              >
                {realTimeUpdates ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getStageIcon(progressData.currentStage)}</div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {getStageInfo(progressData.currentStage).label}
                  </h3>
                  <p className="text-sm text-gray-600">Current stage</p>
                </div>
              </div>
              <Badge className={getStageInfo(progressData.currentStage).color}>
                Active
              </Badge>
            </div>
            
            <Progress value={progressData.progressPercentage} className="h-4 mb-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {progressData.startedAt && (
                <div>
                  <div className="text-gray-600">Started</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(progressData.startedAt))} ago
                  </div>
                </div>
              )}
              {progressData.estimatedCompletion && (
                <div>
                  <div className="text-gray-600">Est. Completion</div>
                  <div className="font-medium">
                    {format(new Date(progressData.estimatedCompletion), 'HH:mm')}
                  </div>
                </div>
              )}
              <div>
                <div className="text-gray-600">Quality Checks</div>
                <div className="font-medium">
                  {progressData.qualityChecks.filter(q => q.completed).length}/{progressData.qualityChecks.length}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Issues</div>
                <div className="font-medium text-red-600">
                  {progressData.issuesReported.length}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {showTimeline && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Route className="h-4 w-4" />
                <span>Service Timeline</span>
              </h4>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {progressData.stages.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-4"
                    >
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        milestone.timestamp
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-gray-200 border-gray-300 text-gray-500'
                      }`}>
                        {milestone.timestamp ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{milestone.description}</h5>
                          {milestone.timestamp && (
                            <div className="text-sm text-gray-500">
                              {format(new Date(milestone.timestamp), 'MMM dd, HH:mm')}
                            </div>
                          )}
                        </div>
                        
                        {milestone.notes && (
                          <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                        )}
                        
                        {milestone.photos && milestone.photos.length > 0 && (
                          <div className="flex space-x-2 mt-2">
                            {milestone.photos.slice(0, 3).map((photo, photoIndex) => (
                              <img
                                key={photoIndex}
                                src={photo}
                                alt="Service progress"
                                className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80"
                              />
                            ))}
                            {milestone.photos.length > 3 && (
                              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                                +{milestone.photos.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {allowCustomerActions && milestone.timestamp && !progressData.customerApprovals.find(a => a.milestone === milestone.stage) && (
                          <div className="flex space-x-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMilestone(milestone.stage);
                                setShowApprovalModal(true);
                              }}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quality Checkpoints */}
          {showQualityChecks && progressData.qualityChecks.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Quality Checkpoints</span>
              </h4>
              
              <div className="grid gap-3">
                {progressData.qualityChecks.map((checkpoint, index) => (
                  <motion.div
                    key={checkpoint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      checkpoint.completed
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {checkpoint.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-medium">{checkpoint.name}</span>
                        {checkpoint.required && (
                          <Badge variant="outline" className="text-xs">Required</Badge>
                        )}
                      </div>
                      {checkpoint.score && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{checkpoint.score}/5</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{checkpoint.description}</p>
                    
                    {checkpoint.completedAt && (
                      <div className="text-xs text-gray-500">
                        Completed {formatDistanceToNow(new Date(checkpoint.completedAt))} ago
                      </div>
                    )}
                    
                    {checkpoint.photos && checkpoint.photos.length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {checkpoint.photos.map((photo, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt="Quality check"
                            className="w-10 h-10 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {showIssues && progressData.issuesReported.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Reported Issues</span>
              </h4>
              
              <div className="space-y-3">
                {progressData.issuesReported.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium capitalize">{issue.type.replace('_', ' ')}</span>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={
                        issue.status === 'RESOLVED' ? 'text-green-600' :
                        issue.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-red-600'
                      }>
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Reported by {issue.reportedBy}</span>
                      <span>{formatDistanceToNow(new Date(issue.reportedAt))} ago</span>
                    </div>
                    
                    {issue.resolution && (
                      <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                        <div className="font-medium text-green-800">Resolution:</div>
                        <div className="text-green-700">{issue.resolution}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Actions */}
          {allowCustomerActions && (
            <div className="flex space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowIssueModal(true)}
                className="flex-1"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button
                variant="outline"
                onClick={() => trackProgress(bookingId)}
                className="px-4"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Connection status */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Real-time tracking active' : 'Reconnecting...'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="font-semibold text-lg mb-4">Approve Service Milestone</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Are you satisfied with this milestone?
                  </label>
                  <div className="flex space-x-4">
                    <Button
                      variant={approvalData.approved ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApprovalData(prev => ({ ...prev, approved: true }))}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant={!approvalData.approved ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApprovalData(prev => ({ ...prev, approved: false }))}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        onClick={() => setApprovalData(prev => ({ ...prev, rating }))}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            rating <= approvalData.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comments (optional)</label>
                  <textarea
                    value={approvalData.comments}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={3}
                    placeholder="Add any comments about this milestone..."
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button onClick={handleApproval} className="flex-1">
                  Submit Approval
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Report Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="font-semibold text-lg mb-4">Report an Issue</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Issue Type</label>
                  <select
                    value={issueData.type}
                    onChange={(e) => setIssueData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="QUALITY">Quality Issue</option>
                    <option value="DELAY">Service Delay</option>
                    <option value="EQUIPMENT">Equipment Problem</option>
                    <option value="COMMUNICATION">Communication Issue</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <select
                    value={issueData.severity}
                    onChange={(e) => setIssueData(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={issueData.description}
                    onChange={(e) => setIssueData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                    rows={4}
                    placeholder="Please describe the issue in detail..."
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleIssueReport} 
                  className="flex-1"
                  disabled={!issueData.description.trim()}
                >
                  Report Issue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}