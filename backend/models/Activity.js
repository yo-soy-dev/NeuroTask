import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'task_created', 'task_updated', 'task_deleted', 'task_status_changed',
        'task_assigned', 'task_commented', 'task_attachment_added',
        'user_created', 'user_updated', 'user_deleted',
        'user_login', 'user_register',
      ],
      required: true,
    },
    entity: { type: String, enum: ['task', 'user', 'auth'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    entityTitle: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ entityId: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;