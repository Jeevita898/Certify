const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message:    { type: String, required: true },
    type:       { type: String, enum: ['approved', 'rejected', 'info'], default: 'info' },
    read:       { type: Boolean, default: false },
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
