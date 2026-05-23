// 

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Workshop', 'Hackathon', 'Seminar', 'Cultural', 'Sports', 'NSS/NCC'],
      required: true,
    },
    date:        { type: Date, required: true },
    points:      { type: Number, required: true, min: 1, max: 100 },
    seats:       { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // participants array — students who registered
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Virtual: seats left
eventSchema.virtual('seatsLeft').get(function () {
  return this.seats - this.participants.length;
});

eventSchema.virtual('isFull').get(function () {
  return this.participants.length >= this.seats;
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);