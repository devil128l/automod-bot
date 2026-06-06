const { Schema, model, models } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const warnSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warnings: [
    {
      warnId: { type: String, default: () => uuidv4().split('-')[0] },
      modId: String,
      reason: String,
      date: { type: Date, default: Date.now },
    }
  ]
});

module.exports = models.Warning || model('Warning', warnSchema);
