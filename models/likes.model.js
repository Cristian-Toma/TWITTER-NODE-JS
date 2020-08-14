<<<<<<< HEAD
'use strict'

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const LikeSchema = Schema({
  interactors: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  likes: { type: Number, default: 0 },
});

module.exports = Mongoose.model('like',LikeSchema);
=======
'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = Schema({
  interactors: [{ type: Schema.Types.ObjectId, ref: "user" }],
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model('like',LikeSchema);
>>>>>>> d29f17368232473ea4c1d6d23aa2d0ea1d3ea5bf
