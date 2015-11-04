// Requires \\
var express = require('express');
var bodyParser = require('body-parser');

// Connect to DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/eventshare')

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
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'picture'],
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ userID: profile.id },
      {userID : profile.id, 
        username : profile.name.givenName + ' ' + profile.name.familyName, events : [], 
        email : profile.emails[0].value,
        picture : profile.photos[0].value},
        function(err, user) {
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
  var userList = []
  for(var i = 0; i < req.body.invites.length; i++){
    userList.push(req.body.invites[i]._id)
  }
  for(var i=0; i < userList.length; i++){
    User.findOneAndUpdate(
    {_id : userList[i]},
    {$push : {events : {invites: req.body.invites, host : req.body.host, eventName : req.body.eventName, eventDescription : req.body.eventDescription, eventType : req.body.eventType, tasks : []}}},
    {safe : true, upsert : true},
    function(err, model){
      console.log(err)
    }
    )
  }
  res.send("done")
})

app.post('/createTask', function(req,res){
  User.find({_id : req.body.eventHost._id}, function(err, doc){
    for(var i = 0 ; i < req.body.eventHost.events.length ; i++){
      // Search for a matching event based on the current event name
      if(req.body.eventHost.events[i].eventName === req.body.currentEvent){
        // Save task in matching event
        doc[0].events[i].tasks.push({taskUsers : req.body.taskUsers, taskName : req.body.taskName, taskComplete : false, taskUrgent : req.body.taskUrgent})
        doc[0].markModified('events') 
        doc[0].save(function(err){
          if(err){
            console.log(err)
          }
        })
      }
    }

  })
  res.send("done")
})

app.post('/removeTask', function(req, res){
  User.findOne({_id : req.body.user._id}, function(err, doc){
    // Look over every item in user events and search for a matching event name
    for(var i=0 ; i < req.body.user.events.length; i++){
      if(req.body.user.events[i].eventName === req.body.currentEvent){
        // Look over every item in iser event taks and search for a matching task name
        for(var x = 0; x < req.body.user.events[i].tasks.length; x++){
          if(req.body.user.events[i].tasks[x].taskName === req.body.task.taskName){
           // Delete task in matching event
           doc.events[i].tasks.splice(x, 1)
           doc.markModified('events')
           doc.save(function(err){
            if(err){
              console.log(err)
            }
           })
          
          }
        }
      }
    }
  })
  
  res.send("done")

})

app.get('/findAllTasks', function(req, res){
  console.log(req.query)
  User.find({_id : req.query.id}, function(err, doc){
    if(err){
      res.send(err)
    }
    else{
      res.send(doc)
    }
  })
})

app.get('/findAllEvents', function(req, res){
  User.find({_id : req.query.id}, function(err, doc){
    if(err){
      res.send(err)
    }
    else{
      res.send(doc)
    }
  })
})

app.get('/findSpecificEvent', function(req, res){
  var matchingEvent 
  User.find({_id : req.query.id}, function(err, doc){
    if(err){
      res.send(err)
    }
    else{
      for(var i = 0; i < doc[0].events.length; i ++){
        if(doc[0].events[i].eventName === req.query.eventName){
          matchingEvent = req.query.eventName
          res.send(doc[0].events[i])
        }
      }
      
    }
  })
})

app.post('/removeEvent', function(req, res){
  // console.log(req.body)
  User.findOne({_id : req.body.user}, function(err, doc){
    console.log("PRE", doc)
    doc.events.splice(req.body.index, 1)
    doc.markModified('events')
    doc.save(function(err){
      if(err){
        console.log(err)
      }
    })
    console.log("POST", doc)
  })
  res.send("done")
})

app.get('/updateAllUsers', function(req, res){
  User.find({}, function(err, doc){
    res.send(doc)
  })
})

app.get('/findAllUsers', function(req, res){
  
  User.find({_id : {$ne : req.query.id}}, function(err, doc){
    if(err){
      res.send(err)
    }
    else{
      for(var i = 0; i < doc.length; i++){
        
      }
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