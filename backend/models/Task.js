import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'completed'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['general', 'bug', 'feature', 'design', 'devops', 'documentation', 'testing', 'research'],
      default: 'general',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        publicId: String,
        size: Number,
        mimetype: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        },
      },
    ],
  },
  { timestamps: true }
);

// Set completedAt when status changes to completed
taskSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'completed') {
    if (!this.completedAt) this.completedAt = new Date();
    this.progress = 100;
  }
  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = null;
  }
});

// Indexes for search and filter performance
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ category: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;