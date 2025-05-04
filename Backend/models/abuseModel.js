// models/abuseModel.js
const mongoose = require('mongoose');

const abuseSchema = mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    count: { type: Number, default: 1 },
    lastAbuseType: { type: String, enum: ['text', 'image', 'video', 'audio'], required: true },
  },
  { timestamps: true }
);

const Abuse = mongoose.model('Abuse', abuseSchema);
module.exports = Abuse;
