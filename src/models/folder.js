const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

// ✅ Prevent OverwriteModelError by reusing existing model if compiled
module.exports = mongoose.models.Folder || mongoose.model('Folder', folderSchema);