const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,
  criteria: {
    type: { type: String, enum: ['steps', 'phases', 'days', 'custom'], required: true },
    threshold: { type: Number, required: true }
  }
});

const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now }
});

module.exports = {
  Badge: mongoose.model("Badge", badgeSchema),
  UserBadge: mongoose.model("UserBadge", userBadgeSchema)
};