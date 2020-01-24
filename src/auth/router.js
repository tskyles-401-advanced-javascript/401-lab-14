'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./users-model');
const auth = require('./basicAuth');
const oauth = require('./oauth/google');
const bearerAuth = require('./bearerAuth');

authRouter.get('/users', (req, res, next) => {
  User.find({})
    .then(results => {
      const data = {
        count: results.length,
        results: results,
      };
      res.json(data);
    });
});

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then( (user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth, (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

authRouter.get('/user', bearerAuth, (req, res, next) => {
  res.status(200).json(req.user);
});

authRouter.get('/oauth', (req,res,next) => {
  console.log(req);
  oauth.authorize(req)
    .then( token => {
      res.status(200).send(token);
    })
    .catch(next);
});

module.exports = authRouter;
