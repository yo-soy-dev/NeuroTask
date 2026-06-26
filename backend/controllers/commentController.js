import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { sendResponse, sendError } from '../utils/response.js';
import { logActivity, createNotification } from '../utils/activity.js';

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });
    return sendResponse(res, 200, true, 'Comments fetched.', { comments });
  } catch (error) { next(error); }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:taskId/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return sendError(res, 400, 'Comment text is required.');

    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, 404, 'Task not found.');

    const comment = await Comment.create({ task: task._id, author: req.user._id, text });
    await comment.populate('author', 'name email avatar role');

    await logActivity(req.user._id, 'task_commented', 'task', task._id, task.title);

    // Notify task assignee
    if (task.assignedTo && String(task.assignedTo) !== String(req.user._id)) {
      await createNotification(
        task.assignedTo, req.user._id, 'task_commented',
        'New Comment',
        `${req.user.name} commented on "${task.title}"`,
        task._id
      );
    }
    // Notify task creator
    if (String(task.createdBy) !== String(req.user._id)) {
      await createNotification(
        task.createdBy, req.user._id, 'task_commented',
        'New Comment',
        `${req.user.name} commented on "${task.title}"`,
        task._id
      );
    }

    return sendResponse(res, 201, true, 'Comment added.', { comment });
  } catch (error) { next(error); }
};

// @desc    Edit comment
// @route   PUT /api/comments/:id
const editComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found.');
    if (String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied.');
    }
    comment.text = text;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', 'name email avatar role');
    return sendResponse(res, 200, true, 'Comment updated.', { comment });
  } catch (error) { next(error); }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 404, 'Comment not found.');
    if (String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') {
      return sendError(res, 403, 'Access denied.');
    }
    await comment.deleteOne();
    return sendResponse(res, 200, true, 'Comment deleted.');
  } catch (error) { next(error); }
};

export {
  getComments,
  addComment,
  editComment,
  deleteComment,
};