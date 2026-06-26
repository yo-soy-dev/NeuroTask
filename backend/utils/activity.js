import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';

export const logActivity = async (
  userId,
  action,
  entity,
  entityId = null,
  entityTitle = '',
  meta = {}
) => {
  try {
    await Activity.create({
      user: userId,
      action,
      entity,
      entityId,
      entityTitle,
      meta,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

export const createNotification = async (
  recipientId,
  senderId,
  type,
  title,
  message,
  entityId = null,
  link = '/tasks'
) => {
  try {
    // Don't notify yourself
    if (String(recipientId) === String(senderId)) return;

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      link,
      entityId,
    });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};