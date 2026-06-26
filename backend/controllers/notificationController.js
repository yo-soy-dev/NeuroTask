import Notification from '../models/Notification.js';
import { sendResponse } from '../utils/response.js';

// @desc    Get my notifications
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limitNum),
      Notification.countDocuments({ recipient: req.user._id }),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    return sendResponse(res, 200, true, 'Notifications fetched.', { notifications, unreadCount }, {
      total, page: pageNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return sendResponse(res, 200, true, 'Marked as read.');
  } catch (error) { next(error); }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return sendResponse(res, 200, true, 'All notifications marked as read.');
  } catch (error) { next(error); }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    return sendResponse(res, 200, true, 'Notification deleted.');
  } catch (error) { next(error); }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};