import Activity from '../models/Activity.js';
import { sendResponse } from '../utils/response.js';

// @desc    Get activity log
// @route   GET /api/activity
const getActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, entity } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (req.user.role === 'employee') query.user = req.user._id;
    if (entity) query.entity = entity;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('user', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limitNum),
      Activity.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Activity log fetched.', { activities }, {
      total, page: pageNum, pages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

export { getActivity };