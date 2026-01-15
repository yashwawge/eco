export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'collection' | 'report' | 'reward' | 'system';
  read: boolean;
  createdAt: Date;
}

// In-memory notification store (for demo purposes)
// In production, this would be a database collection
const notifications: Notification[] = [];

export function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type']
): Notification {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date(),
  };

  notifications.push(notification);
  return notification;
}

export function getUserNotifications(userId: string): Notification[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function markAsRead(notificationId: string): boolean {
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
    return true;
  }
  return false;
}

export function sendCollectionReminder(userId: string, eta: number): Notification {
  return createNotification(
    userId,
    'Collection Vehicle Approaching',
    `Your waste collection vehicle will arrive in approximately ${eta} minutes. Please keep your waste ready.`,
    'collection'
  );
}

export function sendReportUpdate(userId: string, reportType: string, status: string): Notification {
  const statusMessages = {
    assigned: 'Your report has been assigned to a cleanup crew.',
    in_progress: 'Cleanup crew is working on your reported issue.',
    resolved: 'Your reported issue has been resolved. Thank you for keeping our city clean!',
  };

  return createNotification(
    userId,
    'Report Status Update',
    statusMessages[status as keyof typeof statusMessages] || `Your report status: ${status}`,
    'report'
  );
}

export function sendPointsAwarded(userId: string, points: number, reason: string): Notification {
  return createNotification(
    userId,
    'Eco-Points Earned! 🌱',
    `You've earned ${points} Eco-Points for ${reason}. Keep up the great work!`,
    'reward'
  );
}
