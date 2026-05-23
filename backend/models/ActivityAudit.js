const mongoose = require('mongoose');

const activityAuditSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actionByName: {
      type: String,
      required: true
    },
    actionType: {
      type: String,
      enum: ['approved', 'rejected'],
      required: true
    },
    oldStatus: String,
    newStatus: String,
    oldPoints: {
      type: Number,
      default: 0
    },
    newPoints: {
      type: Number,
      default: 0
    },
    remark: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityAudit', activityAuditSchema);