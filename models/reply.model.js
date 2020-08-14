<<<<<<< HEAD
'use strict'

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const ReplySchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    content: String,
  }
);

module.exports = Mongoose.model('reply', ReplySchema);
=======
  
'use strict'

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const ReplySchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "user" },
    content: String,
  },
  {
    versionKey: false,
  }
);

module.exports = Mongoose.model("reply", ReplySchema);
>>>>>>> d29f17368232473ea4c1d6d23aa2d0ea1d3ea5bf
