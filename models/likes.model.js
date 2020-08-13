'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = Schema({
  interactors: [{ type: Schema.Types.ObjectId, ref: "user" }],
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model('like',LikeSchema);