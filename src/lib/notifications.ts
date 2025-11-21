import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'approval_required' 
  | 'approved' 
  | 'rejected' 
  | 'expiring_soon' 
  | 'expired' 
  | 'payment_required';

export interface NotificationData {
  type: string; // 'Traueranzeige' or 'Gedenkseite'
  deceased_name: string;
  view_url?: string;
  extend_url?: string;
  expiry_date?: string;
  [key: string]: any;
}

/**
 * Send a notification to a user with automatic email queuing
 */
export async function sendNotification(
  userId: string,
  notificationType: NotificationType,
  templateData: NotificationData,
  scheduleFor?: Date
) {
  try {
    console.log('Sending notification:', { userId, notificationType, templateData });

    const { data, error } = await supabase.functions.invoke('send-notifications', {
      body: {
        userId,
        type: notificationType,
        templateData,
        scheduleFor: scheduleFor?.toISOString()
      }
    });

    if (error) {
      console.error('Error sending notification:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }

    console.log('Notification sent successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error in sendNotification:', error);
    throw error;
  }
}

/**
 * Send approval required notification
 */
export async function sendApprovalRequiredNotification(
  userId: string,
  itemType: 'Traueranzeige' | 'Gedenkseite',
  deceasedName: string
) {
  return sendNotification(userId, 'approval_required', {
    type: itemType,
    deceased_name: deceasedName
  });
}

/**
 * Send approval granted notification
 */
export async function sendApprovalGrantedNotification(
  userId: string,
  itemType: 'Traueranzeige' | 'Gedenkseite',
  deceasedName: string,
  viewUrl: string
) {
  return sendNotification(userId, 'approved', {
    type: itemType,
    deceased_name: deceasedName,
    view_url: viewUrl
  });
}

/**
 * Send rejection notification
 */
export async function sendRejectionNotification(
  userId: string,
  itemType: 'Traueranzeige' | 'Gedenkseite',
  deceasedName: string
) {
  return sendNotification(userId, 'rejected', {
    type: itemType,
    deceased_name: deceasedName
  });
}

/**
 * Send expiry warning notification
 */
export async function sendExpiryWarningNotification(
  userId: string,
  itemType: 'Traueranzeige' | 'Gedenkseite',
  deceasedName: string,
  expiryDate: string,
  extendUrl: string
) {
  return sendNotification(userId, 'expiring_soon', {
    type: itemType,
    deceased_name: deceasedName,
    expiry_date: expiryDate,
    extend_url: extendUrl
  });
}

/**
 * Send expired notification
 */
export async function sendExpiredNotification(
  userId: string,
  itemType: 'Traueranzeige' | 'Gedenkseite',
  deceasedName: string,
  expiryDate: string,
  extendUrl: string
) {
  return sendNotification(userId, 'expired', {
    type: itemType,
    deceased_name: deceasedName,
    expiry_date: expiryDate,
    extend_url: extendUrl
  });
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('dde_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('dde_notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('dde_notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Process email queue manually (for testing)
 */
export async function processEmailQueue() {
  try {
    const { data, error } = await supabase.functions.invoke('process-email-queue', {
      body: {}
    });

    if (error) {
      console.error('Error processing email queue:', error);
      throw new Error(`Failed to process email queue: ${error.message}`);
    }

    console.log('Email queue processed:', data);
    return data;
  } catch (error: any) {
    console.error('Error in processEmailQueue:', error);
    throw error;
  }
}

/**
 * Format date for German locale
 */
export function formatDateForNotification(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate URLs for notifications
 */
export function generateUrls(itemType: 'obituary' | 'memorial', itemId: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    viewUrl: `${baseUrl}/${itemType === 'obituary' ? 'traueranzeige' : 'gedenkseite'}/${itemId}`,
    extendUrl: `${baseUrl}/user-bereich?extend=${itemType}&id=${itemId}`
  };
}