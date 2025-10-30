const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
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
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    assignedTo: { 
      type: String, 
      default: 'Unassigned' 
    },
    dueDate: { 
      type: Date 
    },
    completedAt: { 
      type: Date 
    },
    tags: [{
      type: String
    }],
    project: {
      type: String,
      default: 'General'
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true // Adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('Task', TaskSchema);
