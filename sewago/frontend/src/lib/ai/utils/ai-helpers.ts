import { prisma } from '../../prisma'
import { logger } from '../../log'

export interface SystemAlertData {
  level: 'INFO' | 'WARNING' | 'CRITICAL'
  title: string
  message: string
  details?: any
}

export interface AutomatedActionData {
  module: string
  trigger: string
  actionTaken: string
  details: any
  success: boolean
}

/**
 * Creates a system alert in the database
 */
export async function createSystemAlert(alertData: SystemAlertData): Promise<void> {
  try {
    await prisma.systemAlert.create({
      data: {
        level: alertData.level,
        title: alertData.title,
        message: alertData.message,
        details: alertData.details,
        status: 'UNREAD',
      },
    })
    
    logger.info(`System Alert Created: [${alertData.level}] ${alertData.title}`)
  } catch (error) {
    logger.error('Failed to create system alert:', error)
  }
}

/**
 * Logs an automated action to the audit trail
 */
export async function logAutomatedAction(actionData: AutomatedActionData): Promise<void> {
  try {
    await prisma.automatedActionLog.create({
      data: {
        module: actionData.module,
        trigger: actionData.trigger,
        actionTaken: actionData.actionTaken,
        details: actionData.details,
        success: actionData.success,
      },
    })
    
    const status = actionData.success ? 'SUCCESS' : 'FAILED'
    logger.info(`AI Action Logged: [${actionData.module}] ${actionData.actionTaken} - ${status}`)
  } catch (error) {
    logger.error('Failed to log automated action:', error)
  }
}

/**
 * Utility function to format time differences for alerts
 */
export function formatTimeDifference(startTime: Date, endTime: Date): string {
  const diffMs = endTime.getTime() - startTime.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`
  }
  return `${diffMinutes}m`
}

/**
 * Utility function to get week ending date for reports
 */
export function getWeekEndingDate(date: Date = new Date()): Date {
  const dayOfWeek = date.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const weekEnding = new Date(date)
  weekEnding.setDate(date.getDate() + daysUntilSunday)
  weekEnding.setHours(23, 59, 59, 999)
  return weekEnding
}

/**
 * Utility function to check if an alert level should trigger immediate notifications
 */
export function shouldTriggerImmediateNotification(level: string): boolean {
  return level === 'CRITICAL'
}