const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    default: 'BACKLOG'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);