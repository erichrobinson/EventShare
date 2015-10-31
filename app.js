// Requires \\
var express = require('express');
var bodyParser = require('body-parser');

// Connect to DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/passport-demo')

// Auth Requires
var session = require('express-session');
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;

var passportConfig = require('./config/passport'); // Load in our passport configuration that decides how passport actually runs and authenticates

// Create Express App Object \\
var app = express();

var User = require("./models/user.js")

// Session Setup
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: false
}));

// FACEBOOK AUTH AND SAVE TO DB
passport.use(new FacebookStrategy({
    clientID: 418580371685513,
    clientSecret: "533cfca3455663985fc8eb0a61b4f9f4",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ userID: profile.id },{userID : profile.id, username : profile.name.givenName + ' ' + profile.name.familyName, events : []},function(err, user) {
      console.log()
      console.log(profile)
      if(err){
          console.log("error")
          done(err)
        }
        else{
          done(null, user)
        }
    });
  }
));

// Hook in passport to the middleware chain
app.use(passport.initialize());

// Hook in the passport session management into the middleware chain.
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

// Application Configuration \\
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes \\
var authenticationController = require('./controllers/authentication');

// This wil point to the Loged-out home page
app.get('/', function(req, res){
 	res.sendFile('/html/home.html', {root : './public'})
});

// Our get request for viewing the login page
app.get('/auth/login', authenticationController.login);

// Post received from submitting the login form
app.post('/auth/login', authenticationController.processLogin);

// Post received from submitting the signup form
app.post('/auth/signup', authenticationController.processSignup);

// Any requests to log out can be handled at this url
app.get('/auth/logout', authenticationController.logout);

// This route is designed to send back the logged in user (or undefined if they are NOT logged in)
app.get('/api/me', function(req, res){
	res.send(req.user)
})

app.get('/getUserName', function(req, res){
  User.find({_id : req.query.id}, function(err, docs){
    if(err){
      res.send(err)
    }
    else{
      res.send(docs)
    }
  })
})

app.post('/createEvent', function(req,res){
  User.findOneAndUpdate(
    {_id : req.body.userID},
    {$push : {events : {eventName : req.body.eventName}}},
    {safe : true, upsert : true},
    function(err, model){
      console.log(err)
    }
    )
  res.send("done")
})

app.get('/findAllEvents', function(req, res){
  console.log(req.query.id)
  User.find({_id : req.query.id}, function(err, doc){
    if(err){
      res.send(err)
    }
    else{
      res.send(doc)
    }
  })
})

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook', {scope : ['email']}));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

// ***** IMPORTANT ***** //
// By including this middleware (defined in our config/passport.js module.exports),
// We can prevent unauthorized access to any route handler defined after this call
// to .use()
// app.use(passportConfig.ensureAuthenticated);

// this should change to route to the logged in home page
app.get('/', function(req, res){
  res.sendFile('/html/home.html', {root : './public'})
});

// Creating Server and Listening for Connections \\
var port = 3000
app.listen(port, function(){
  console.log('Server running on port ' + port);

});