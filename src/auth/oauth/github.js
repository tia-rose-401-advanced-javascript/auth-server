'use strict';
const superagent = require('superagent');
const Users = require('../users-model.js');
const API = 'http://localhost:3000';
const SERVICE = 'https://github.com/login/oauth/access_token';
const ACCESS_API = 'https://api.github.com/user';

let authorize = (request) => {
  // console.log(request);
  console.log(request.query);
  
  console.log('(1)', request.query.code);
  
  return superagent.get(SERVICE)
    .type('form')
    // .set('Accept', 'application/json')
    .send({
      code: request.query.code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: `${API}/oauth`,
    })
    .then( response => {
      let access_token = response.body.access_token;
      console.log(response);
      console.log('(2)', access_token);
      return access_token;
    })
    .then(token => {
      console.log(SERVICE, token);
      return superagent.get(ACCESS_API)
        .set('Authorization', `Bearer ${token}`)
        .then( response => {
          let user = response.body;
          console.log('(3)', user);
          return user;
        });
    })
    .then( oauthUser => {
      console.log('(4) Create Our Account');
      console.log(oauthUser);
      return Users.createFromOauth(oauthUser.name);
    })
    .then( actualUser => {
      return actualUser.generateToken(); 
    })
    .catch( error => error );
};


module.exports = {authorize};