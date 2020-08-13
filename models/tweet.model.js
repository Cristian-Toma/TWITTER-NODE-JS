'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = Schema({
    date : Date,
    likes: { type: Schema.Types.ObjectId, ref: "like" },
    creator : [{type:Schema.Types.ObjectId,ref:'user'}],
    replies: [{ type: Schema.Types.ObjectId, ref: "reply" }],
    content: String
});

module.exports = mongoose.model('tweet',TweetSchema);
