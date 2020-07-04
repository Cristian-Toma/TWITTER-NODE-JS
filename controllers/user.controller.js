'use strict'

const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Tweet = require('../models/tweet.model');
const jwt = require('../services/jwt');
const {getAction} = require('twitter-command');

const commands = async (req, res) => {
  try {
    res.send(await actions(req.user, getAction(req)));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'ERROR EN EL SERVIDOR' });
  }
};

const register = async (args) => {
  const user = User();
  try {
    let userExists = await User.findOne({
      $or: [{ email: args[1] }, { username: args[2] }],
    });
    if (userExists) return { message: 'ESTE USUARIO YA EXISTE' };
    else {
      user.name = args[0];
      user.email = args[1];
      user.username = args[2];
      const password = await pass(args[3]);
      if (!password) return { message: 'ERROR AL CREAR LA CONTRASEÑA' };
      else {
        user.password = password;
        let accountCreated = await user.save();
        if (!accountCreated) return { message: 'ERROR AL CREAR LA CUENTA' };
        else {
          return accountCreated;
        }
      }
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR' };
  }
};

const pass = async (password) => {
  return await new Promise((res, rej) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) rej(err);
      res(hash);
    });
  });
};

const login = async (args) => {
  try {
    const userFound = await User.findOne({
      $or: [{ username: args[0] }, { email: args[0] }],
    });

    if (!userFound) return { message: 'USUARIO O EMAIL ERRONEOS'};
    else {
      const correctPassword = await bcrypt.compare(args[1], userFound.password);
      if (!correctPassword) return { message: 'CONTRASEÑA INCORRECTA' };
      else {
        return { token: jwt.createToken(userFound) };
      }
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR' };
  }
};

const listTweets = async (args) => {
  try {
    const userFound = await User.findOne({ username: args[0] });
    if (!userFound)
      return { message: 'NO EXISTE ESE USUARIO' };
    else {
      const tweets = await Tweet.find({ creator: userFound._id }).populate(
        'creator',
        '-_id username'
      );
      if (!tweets) return { message: 'NO PUEDES VER LOS TWEETS' };
      else if (tweets.length === 0)
        return { message: `${userFound.username} AUN NO HAY TWEET'S` };
      else return tweets;
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR' };
  }
};

const createTweet = async (user, args) => {
  try {
    let newTweet = new Tweet();
    newTweet.creator = user.sub;
    newTweet.date = new Date();
    newTweet.content = args[0];

    const newTweetAdded = await (await newTweet.save()).populate('creator','-password -following -followers -email -_id').execPopulate();
    if (!newTweetAdded) return { message: 'ERROR AL CREAR TU TWEET' };
    else return newTweetAdded;
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR' };
  }
};

const editNDelete = async (user, args, operation) => {
  try {
    let resultTweet;
    let tweetFound;
    if (operation === 0) tweetFound = await Tweet.findById(args[1]);
    else tweetFound = await Tweet.findById(args[0]);

    if (!tweetFound) return { message: 'ESE TWEET NO EXISTE'};
    else {
      if (String(user.sub) !== String(tweetFound.creator)) {
        return { message: 'NO TIENES PERMISO DE HACER ALGO CON ESTE TWEET' };
      } else {
        if (operation === 0) {
          resultTweet = await Tweet.findByIdAndUpdate(
            args[1],
            { content: args[0] },
            { new: true }
          );
        } else {
          resultTweet = await Tweet.findByIdAndRemove(args[0]);
        }
        if (!resultTweet)
          return { message: 'OCURRIO UN ERROR :(' };
        else {
          if (operation === 0) return resultTweet;
          else return { message: 'TWEET BORRADO' };
        }
      }
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR' };
  }
};

const profile = async (user, args) =>{
  try {
      const following = await User.findOne({username: args[0] }).populate(
          "following", "-following -password -followers -name -email",
      ).populate("followers", "-followers -password -following -name -email")
      if(!following){
          return {message: 'ESTE PERFIL NO EXISTE'}
      }else{
          return following;
      }
  } catch (error) {

  }
};

const follow = async (user, args) => {
  try {
    const toFollow = await User.findOne({ username: args[0] });
    if (!toFollow)
      return { message: 'NO EXISTE ESE USUARIO' };
    else {
      const alreadyFollowed = await User.findOne({
        $and: [{ _id: user.sub }, { following: { _id: toFollow._id } }],
      });
      if (alreadyFollowed)
        return { message: `YA SIGUES A ${toFollow.username}` };
      else {
        const addFollowing = await User.findByIdAndUpdate(
          user.sub,
          { $push: { following: toFollow } },
          { new: true }
        ).populate('following','-password -following -followers -name -email').populate('followers','-password -following -followers -name -email');
        const addFollower = await User.findByIdAndUpdate(toFollow._id, {
          $push: { followers: user.sub },
        });
        if (addFollowing && addFollower) {
          return addFollowing;
        } else {
          return { message: `ERROR AL SEGUIR A ${toFollow.username}` };
        }
      }
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR'};
  }
};

const unfollow = async (user, args) => {
  try {
    const toUnFollow = await User.findOne({ username: args[0] });
    if (!toUnFollow)
      return { message: 'NO EXISTE ESE USUARIO' };
    else {
      const following = await User.findOne({
        $and: [{ _id: user.sub }, { following: { _id: toUnFollow._id } }],
      });
      if (!following)
        return { message: `NO SIGUES A ${toUnFollow.username}` };
      else {
        const stopFollowing = await User.findByIdAndUpdate(
          user.sub,
          { $pull: { following:toUnFollow._id } },
          { new: true },
        ).populate('following', '-following -password -followers -name -email')
         .select('username');

        const removeFollower = await User.findByIdAndUpdate(toUnFollow._id, {
          $pull: { followers:user.sub  },
        });

        if (stopFollowing && removeFollower) {
          return stopFollowing;
        } else {
          return { message: `ERROR AL DEJAR DE SEGUIR A ${toUnFollow.username}` };
        }
      }
    }
  } catch (err) {
    return { message: 'ERROR EN EL SERVIDOR'};
  }
};

const actions = async (user, { command, args }) => {
  try {
    if (command === 'invalid command') return { message: 'COMANDO INVALIDO' };
    else if (args === 'invalid arguments')
      return { message: 'ARGUMENTOS INVALIDOS' };
    else {
      switch (command.toLowerCase()) {
        case 'register':
          return await register(args);
          break;
        case 'login':
          return await login(args);
          break;
        case 'view_tweets':
          return await listTweets(args);
        break
        case 'add_tweet':
          return await createTweet(user, args);
        break;
        case 'edit_tweet':
          return await editNDelete(user, args, 0);
        break;
        case 'delete_tweet':
          return await editNDelete(user, args, 1);
        break;
        case 'view_tweets':
          return await listTweets(args);
        break;
        case 'profile':
          return await profile(user, args);
        break
        case 'follow':
          return await follow(user, args);
        break;
        case 'unfollow':
          return await unfollow(user, args);
        break;
        default:
          return { message: 'COMANDO INVALIDO' };
      }
    }
  } catch (err) {
        return err;
  }
};

module.exports = {
  commands,
};