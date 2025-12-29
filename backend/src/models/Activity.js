const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  action: {
    type: String,
    enum: ['task_created', 'status_changed', 'assignee_changed', 'priority_changed', 'title_changed'],
    required: true
  },
  from: String,
  to: String,
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});


activitySchema.index({ taskId: 1, timestamp: -1 });
activitySchema.index({ projectId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);