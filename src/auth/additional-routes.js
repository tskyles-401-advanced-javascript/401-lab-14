'use strict';

const express = require('express');
const router = express.Router();
const Roles = require('../model/roles-model');

const capabilities = {
  admin: ['create','read','update','delete', 'superuser'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

router.post('/roles', (req, res, next) => {
  let roleArr = [];
  Object.keys(capabilities).map(role => {
    let rolesRecord = new Roles({type: role, capabilities: capabilities[role]});
    roleArr.push(rolesRecord.save());
  });
  Promise.all(roleArr);
  res.send('roles saved');
});

module.exports = router;