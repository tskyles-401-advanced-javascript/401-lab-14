'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles-model');

let capabilities = {
  user: ['read'],
  editor: ['read', 'create', 'update'],
  admin: ['read', 'create', 'update', 'delete'],
};

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
}, {toObject: {virtuals: true}, toJSON: {virtuals: true}});

users.virtual('userRole', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'type',
  justOne: false,
});

users.pre('save', async function() {
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

users.statics.createFromOAuth = function(oauthUser) {
  console.log('user', oauthUser);

  if(!oauthUser) { return Promise.reject('Validation Error'); }

  return this.findOne( {email: `${oauthUser.email}`} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch( error => {
      console.log('Creating new user');
      let username = oauthUser.email;
      let password = 'none';
      let email = oauthUser.email;
      return this.create({username, password, email});
    });
};

users.statics.authenticateToken = function(token){
  if(usedTokens.has(token)){
    return Promise.reject('invalid token');
  }
  let parsedToken = jwt.verify(token, SECRET);

  // (SINGLE_USE_TOKENS) && parsedToken.type !== 'key' && usedTokens.add(token);

  let query = {_id: parsedToken.id };
  return this.findOne(query);
};

users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

users.methods.generateToken = function() {

  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    role: this.role,
  };

  return jwt.sign(token, process.env.SECRET);
};

module.exports = mongoose.model('users', users);
