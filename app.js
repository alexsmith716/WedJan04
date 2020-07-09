// cd documents/node3/oct31tonov1/fridec30

//npm install -g nodemon
// https://www.npmjs.com/package/cors
/*
200 (OK)            > A successful GET or PUT request
201 (CREATED)       > A successful POST request
204 (NO CONTENT)    > A successful DELETE request
// something about the request was bad, the client made a mistake and it’s not the server’s fault
400 (BAD REQUEST)   > An unsuccessful GET, POST, or PUT request, due to invalid content
401 (UNAUTHORIZED)  > Requesting a restricted URL with incorrect credentials
404 (NOT FOUND)     > Unsuccessful request due to an incorrect parameter in the URL
500 (SERVER ERROR)  > Request method not allowed for the given URL

show dbs
use pec2016s
show collections
db.users.find().pretty()
use pec2016s
db.dropDatabase()

*/


/*
    DO ASYNCHRONOUS ###################################

    userSchema.methods.name = function() {
        return this.displayname || this.email;
    };
    
    DO ASYNCHRONOUS ###################################
*/

// https://github.com/pillarjs/understanding-csrf
// SESSION (re-generate sessions on login, signup & after a given amount of time)
// SESSION (save last page visited & pagenate range on comments. will save the range of comment ID's last visited)
// ERROR handling
// CLEAN-UP NODE_MODULES & PACKAGE.JSON
// LOOK OVER CSRF
// LOOK OVER FIXATION ATTACK
// GO OVER 'Secure Your Node.js Web Application'
// PUT ON HEROKU & MONGODB hosting
// https://mlab.com/

// http://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
// $ heroku config:set SESSION_SECRET=superSolidSecret

/* ++++++ HOMEBREW ++++++
platform as a service providers such as Google Cloud Platform, Nodejitsu, OpenShift, and Heroku
brew help
brew list
brew info <package name>
http://braumeister.org/
http://searchbrew.com
https://toolbelt.heroku.com/standalone
brew upgrade <formula>
node --version
npm --version
heroku login    page 398
+++++++++++++++++++++++++ */ 
process.env.NODE_ENV = 'development';

require('dotenv').load();
var express 		= require('express');
var helmet 			= require('helmet');
var https 			= require('https');
var path 			= require('path');
//var favicon = require('serve-favicon');
var cookieParser 	= require("cookie-parser");
var bodyParser 		= require('body-parser');
var fs        = require('fs');
var logger 			= require("morgan");
var passport    	= require('passport');
var methodOverride 	= require('method-override');
var parseurl 		= require('parseurl');
var session     	= require('express-session');
var MongoStore 		= require('connect-mongo')(session);
var setUpAuthentication = require('./theAPI/model/authentication');
var serverRoutes 	= require('./theServer/routes/serverRoutes');
var apiRoutes 		= require('./theAPI/routes/apiRoutes');
require('./theAPI/model/dbConnector');
var serverControllers = require('./theServer/controller/serverMainCtrls');
var sanitize = require('./shared/sanitizeInput.js');
require('./shared/sessionPrototype');
var app       		= express();
app.disable('x-powered-by');

// cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.pem')
// Let's Encrypt: free, automated open CA, by Internet Security Research Group (ISRG)
// encourages adoption of SSL

// node does not automatically redirect from http to https
// set up a http request handler for redirection
// need a node http request handler for https redirection
// use Nginx serverin front the app to habdle SSL connection

var options = {
	key: fs.readFileSync(__dirname + '/ssl/thisgreatappPEM.pem'),
	cert: fs.readFileSync(__dirname + '/ssl/thisgreatappCRT.crt')
};

setUpAuthentication();

app.set('views', path.join(__dirname, 'theServer', 'views'));
app.set('view engine', 'pug');
//app.set('view cache', true);

//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(helmet());

app.use(cookieParser());

var cookieExpiryDate = new Date( Date.now() + 14 * 24 * 60 * 60 );
var sessionExpireDate = 6 * 60 * 60 * 1000; // 6 hours
// var sessionExpireDate = 20 * 60 * 1000; // 20 minutes
// 31,536,000 seconds in a year
// 60 * 60 * 1000 = 3,600,000 == 1 hour
// 20 * 60 * 1000 = 1,200,000 == 20 min
// 86,400,000 (24 × 60 × 60 × 1000) milliseconds – one day
// 18,000,000 === 5 hours
// var oneHour = 3,600,000
// req.session.destroy();

// 'express-session' directly reads and writes cookies on 'req'/'res'
// To store or access session data, use the request property 'req.session'
// To get the ID of the loaded session, access the request property 'req.sessionID'. 
// This is simply a read-only value set when a session is loaded/created.
// Session data is _not_ saved in the cookie itself, just the session ID.
// Session data is stored server-side.

/* 
Session ID stored in Cookie
Show user the last page they were on at login
'We found a cookie of yours!'
'The last page you were on when you logged out was...'
Check security book PDF
You regenerate session ID's (SID) to avoid session fixation
When user Log's In, app will check for cookies to see if user has an existing session
You don't need external 
*/

// Session Fixation: attackers set the target's sessionID, and once the session
// is authenticated, they use that knowledge to hijack the session.

// Possible 2-tier session system (a short TTL with high-level access) & (a longer TTL with low-level access)

/*
Session fixation and session hijacking are both attacks that have a common goal i.e. to gain access to a legitimate session of another user. 
But the attack vectors are different.
In a session fixation attack, the attacker already has access to a valid session and tries to force the victim to use this particular session. 
While in a session hijacking attack, the attacker tries to get the ID of a victim's session to use his/ her session.
*/

//https://github.com/expressjs/session/blob/master/session/session.js

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

app.use(session({
  	store: new MongoStore({
  		url: 'mongodb://localhost/pec2016s',
  		autoRemove: 'native'
  	}),
  	name: 'id',
    secret: process.env.SESSION_SECRET,
  	resave: false,
    rolling: true,
  	saveUninitialized: false,
  	cookie: {
  		secure: true,
  		httpOnly: true,
  		maxAge: sessionExpireDate
  	}
}));

app.use(passport.initialize());
app.use(passport.session());
app.locals.basedir = app.get('views');



// Below, using variable '/' to define where middleware functions are loaded ('/')
// Then, you can read the value of the parameter from the route handler

// To Set a session variable, attach it to 'req.session' object 
// req.session.name = 'foober';


app.use('/', function (req, res, next) {
  next();
});

/* ++++++++ GLOBAL MIDDLEWARE FUNCTION +++++++++++ */
app.use(function(req, res, next){
  //console.log('####### > app.js > app.use > req(method/url): ', req.method, " :: ", req.url)

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  var views = req.session.views;
  if (!views) {
    views = req.session.views = {}
  }
  var pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) + 1;
  //console.log('####### > app.js > app.use2 > You have viewed ' + req.url + ' ' + req.session.views[req.url] + ' times')

  // req.session._csrf = req.csrfToken();
  // res.locals._csrfToken = req.csrfToken();
  // var voo = req.isAuthenticated();
  // res.locals.currentUserFOO = req.user;
  // console.log('####### > app.js > app.use > req.user: ', req.user)
  // console.log('####### > app.js > app.use > res.locals: ', res.locals)
  // console.log('####### > app.js > app.use > req.isAuthenticated(): ', voo)
  // console.log('####### > app.js > app.use > res.locals._csrfToken1: ', res.locals._csrfToken1)
  // console.log('####### > app.js > app.use1 > res.locals: ', res.locals)
  // req.session.cookie.expires = new Date(Date.now() + oneHour);
  next();
});

/*
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}));
*/

app.use(function (req, res, next) {
	//res.header('Cache-Control', 'no-cache="Set-Cookie, Set-Cookie2"'); 
	next();
});

app.use('/', serverRoutes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Catch UnauthorizedError error
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// Catch CSRF validation fail
app.use(function (err, req, res, next) {
  console.log('EBADCSRFTOKEN >>>>>>>>> err.code:', err.code)
  //if (err.code === 'EBADCSRFTOKEN') {
  	if (err.code !== 'EBADCSRFTOKEN') {
    console.log('EBADCSRFTOKEN 2222222222')
    res.status(403);
    res.json({"message" : err.code + ": " + 'Form Tampered With!'});
    return next(err)
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

app.set('port', process.env.PORT || 3000);
https.createServer(options, app).listen(app.get('port'));
