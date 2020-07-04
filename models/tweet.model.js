'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TweetSchema = Schema({
    date : Date,
    creator : [{type:Schema.Types.ObjectId,ref:'user'}],
    content: String
});

module.exports = mongoose.model('tweet',TweetSchema);