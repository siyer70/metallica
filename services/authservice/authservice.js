'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');

// Express configuration
const authservice = express();
authservice.set('view engine', 'ejs');
authservice.use(bodyParser.json({ extended: false }));
authservice.use(bodyParser.urlencoded({ extended: false }));
authservice.use(errorHandler());
authservice.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
authservice.use(passport.initialize());
authservice.use(passport.session());

// Passport configuration
require('./auth');

authservice.get('/', routes.site.index);
authservice.get('/login', routes.site.loginForm);
authservice.post('/login', routes.site.login);
authservice.get('/logout', routes.site.logout);
authservice.get('/account', routes.site.account);

authservice.get('/dialog/authorize', routes.oauth2.authorization);
authservice.post('/dialog/authorize/decision', routes.oauth2.decision);
authservice.post('/oauth/token', routes.oauth2.token);

authservice.get('/api/userinfo', routes.user.info);
authservice.get('/api/clientinfo', routes.client.info);

module.exports = authservice;
