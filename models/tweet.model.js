'use strict'

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const TweetSchema = Schema({
    date : Date,
<<<<<<< HEAD
    likes: { type: Schema.Types.ObjectId, ref: 'like'},
    creator : [{type:Schema.Types.ObjectId,ref: 'user'}],
    replies: [{ type: Schema.Types.ObjectId, ref: 'reply' }],
    content: String
});

module.exports = Mongoose.model('tweet',TweetSchema);
=======
    likes: { type: Schema.Types.ObjectId, ref: "like" },
    creator : [{type:Schema.Types.ObjectId,ref:'user'}],
    replies: [{ type: Schema.Types.ObjectId, ref: "reply" }],
    content: String
});

module.exports = mongoose.model('tweet',TweetSchema);
>>>>>>> d29f17368232473ea4c1d6d23aa2d0ea1d3ea5bf
