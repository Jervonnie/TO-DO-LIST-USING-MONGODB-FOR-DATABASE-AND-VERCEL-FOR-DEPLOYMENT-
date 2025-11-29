const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date, default: null },
  status: { type: String, enum: ['Pending', 'Working', 'Completed'], default: 'Pending' },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
