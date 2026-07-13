const mongoose = require('mongoose');
const idPlugin = require('./plugins/idPlugin');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, default: null },
  // sparse: true so multiple users can have googleId: null without
  // tripping the unique index (Mongo's unique index treats null as a value
  // unless the field is sparse - unlike MySQL, which allows many NULLs).
  googleId: { type: String, default: null, sparse: true },
  avatarUrl: { type: String, default: null }
}, { timestamps: true });

idPlugin(userSchema);

module.exports = mongoose.model('User', userSchema);
