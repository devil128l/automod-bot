const { Schema, model } = require('mongoose');

const settingsSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  automodEnabled: { type: Boolean, default: false },
  antiLink: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: false },
  antiGhostPing: { type: Boolean, default: false },
  logChannelId: { type: String, default: null },
  spamThreshold: { type: Number, default: 5 },
  spamInterval: { type: Number, default: 5000 },
  warnThreshold: { type: Number, default: 3 },
  warnAction: { type: String, enum: ['none', 'timeout', 'kick', 'ban'], default: 'timeout' },
  warnActionDuration: { type: Number, default: 3600000 },
  lockedChannels: { type: [String], default: [] },
});

module.exports = model('GuildSettings', settingsSchema);
