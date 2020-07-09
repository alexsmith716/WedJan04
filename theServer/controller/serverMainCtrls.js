
var request = require('request');
var passport = require('passport');
var pugCompiler = require('../../shared/pugCompiler.js');
var mailer = require('../../shared/mailer.js');
var sanitizeInputModule = require('../../shared/sanitizeInput.js');
require('../../shared/sessionPrototype');

// page 156
console.log('####### > serverMainCtrls > process.env.NODE_ENV: ', process.env.NODE_ENV);

var apiOptions = {
  server : 'https://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = "https://my-awesome-app123.com";
}

module.exports.manageSession = function(req, res, next){
  if (!req.session.username) {
    return next();
  }else{

  }
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
// 302 ERROR !!!!!! had authentication on the login/signup api endpoint route!!

var handleError = function (req, res, statusCode) {
  console.log('####### > serverMainCtrls > handleError > statusCode: ', statusCode)
  var title, content;
  if (statusCode === 404) {
    title = '404, page not found';
    content = 'The page you requested cannot be found. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 for assistance.';
  } else if (statusCode === 500) {
    title = '500, internal server error';
    content = 'There is a problem with our server. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 for assistance.';
  } else {
    title = statusCode + ', error processing request';
    content = 'An Error has occurred processing your request. Please try again. \n\n If this problem continues, please contact our Help Desk at 555-555-1234 for assistance.';
  }
  console.log('####### > serverMainCtrls > handleError > content: ', content);
  res.status(statusCode);
  res.render('basicView', {
    title : title,
    pageHeader: {
      header: title
    },
    content : content
  });
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getIndex = function(req, res){
  console.log('####### > serverMainCtrls > getIndex > req.user: ', req.user)
  console.log('####### > serverMainCtrls > getIndex > req.sessionID: ', req.sessionID)
  console.log('####### > serverMainCtrls > getIndex > req.session: ', req.session)
  var requestOptions, path;
  path = '/api/index';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response) {
    if(err){
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      res.render('indexView', {
        title: 'ThisGreatApp!',
        pageHeader: {
          title: htitle
        },
        subtitle: stitle
      })
    }else{
      handleError(req, res, response.statusCode);
    }
  });
};/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getUserHome = function(req, res){
  console.log('####### > serverMainCtrls.js > getUserHome XXXXXXXXXXXXXXXXX')
  var requestOptions, path;
  path = '/api/userhome';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response) {
    if(err){
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      res.render('userHome', {
        title: 'ThisGreatApp!',
        pageHeader: {
          title: htitle
        },
        subtitle: stitle
      })
    }else{
      handleError(req, res, response.statusCode);
    }
  });
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getComments = function(req, res){
  var requestOptions, path;
  path = '/api/comments';
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response, body) {
    if(err){
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      var htitle = 'Election App 2016!';
      var stitle = 'Log In or Sign Up to join the discussion';
      var message;
      if (!(body instanceof Array)) {
        message = 'API path error!';
        body = [];
      } else {
        if (!body.length) {
          //message = "No data found!";
        }
      }
      res.render('commentsView', {
        csrfToken: req.csrfToken(),
        sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?',
        responseBody: body,
        message: message
      })
    }else{
      handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// sanitize
module.exports.getUserProfile = function(req, res) {
  var requestOptions, path;
  path = '/api/userprofile/' + res.locals.currentUser.id;
  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  request(requestOptions, function(err, response, body) {
    if(err){
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      res.render('userProfile', {
        csrfToken: req.csrfToken(),
        title: 'User Profile',
        pageHeader: {
          header: 'User Profile'
        },
        responseBody: body,
        error: req.query.err
      });
    }else{
      handleError(req, res, response.statusCode);
    }
  });
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */



module.exports.putUserProfile = function(req, res){ 
  var requestOptions, path, postdata;
  path = "/api/userprofile/" + res.locals.currentUser.id;
  var reqBody = req.body;
  var userProfileChangeKey;
  var userProfileChangeValue;

  for (var v in reqBody){
    if (typeof reqBody[v] !== 'function') {
      if(v !== '_csrf') {
        userProfileChangeKey = v;
        userProfileChangeValue = reqBody[v];
      }
    }
  }

  var val = userProfileChangeValue;
  if(userProfileChangeKey === 'state'){
    val = JSON.parse(userProfileChangeValue);
  }

  postdata = {
    [userProfileChangeKey]: val
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : "PUT",
    json : postdata
  };

  var objKey = Object.keys(postdata)

  if (!objKey[0]) {
    var m = 'All User Profile fields required'
    res.redirect('/userprofile/' + res.locals.currentUser.id + '/?err='+m);

  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 200) {
        res.redirect('/userprofile')

      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
        handleError(req, res, response.statusCode);

      } else if (response.statusCode === 404) {

      } else {
        if (body.message){
          m = body.message
          res.redirect('/signup/?err='+m);
        }
        handleError(req, res, response.statusCode);
      }
    });
  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.postMainComment = function(req, res){
  var requestOptions, path, postdata;
  path = '/api/comments/mainComment';

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    candidate: req.body.candidate,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.candidate || !postdata.comment) {
    m = 'All Sign up fields required';
    res.redirect('/comments/?err='+m);
  } else {
    request(requestOptions, function(err, httpResponse, body) {
      if (httpResponse.statusCode === 201) {
        res.redirect('/comments');
      } else if (httpResponse.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred (serverMainCtrls.js > requestAddNewComment)';
          res.redirect('/comments/?err='+m);
      } else {
          handleError(req, res, httpResponse.statusCode);
      }
    });
  }
};



module.exports.postSubComment = function(req, res){
  var requestOptions, path, postdata;
  var sanitizeSubcommentid = sanitizeInputModule(req.params.subcommentid);
  path = '/api/comments/subcomment/' + sanitizeSubcommentid;

  postdata = {
    displayname: res.locals.currentUser.displayname,
    commenterId: res.locals.currentUser.id,
    city: res.locals.currentUser.city,
    state: res.locals.currentUser.state,
    comment: req.body.comment
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.displayname || !postdata.commenterId || !postdata.city || !postdata.state || !postdata.comment) {
    m = 'All Comment Reply fields required';
    res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
  } else {
    request(requestOptions, function(err, response, body) {
      if (response.statusCode === 201) {
        res.redirect('/comments');
      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
          m = 'Error has ocurred > serverMainCtrls.js > postSubComment)';
          res.redirect('/comments/subcomment/' + sanitizeInput1 + '/?err='+m);
      } else {
          handleError(req, res, response.statusCode);
      }
    });
  }
};



/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getAddNewComment = function(req, res) {
    res.render('addNewCommentView', {
    title: 'MEANCRUDApp',
    sideBlurb: 'The 2016 presidential election is upon us! Who do you support and what are your comments regarding this hotly contested event?'
    });
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

// router.get("/logout", auth.ensureAuthenticated, auth.sessDestroy, serverControllers.getLogout);
module.exports.getLogout = function(req, res){
  console.log('####### > serverMainCtrls > getLogout > req.session1: ', req.session);
  req.session.logout(function(err) {
    if(err){
      console.log('####### > serverMainCtrls > getLogout > ERROR:' + err); 
    }else{
      req.logout();
      res.redirect('/');
    }
  });
  //delete req.session
  //req.logout();
  //res.redirect('/');
  console.log('####### > serverMainCtrls > getLogout > req.session2: ', req.session);
};



// URL parameter
// redirect: Redirects to the URL derived from the specified path, with specified status
// render: Renders a view and sends the rendered HTML string to the client.



module.exports.getResetPassword = function(req, res){
  console.log('FUCKKKKKKKKK1')
  var hostname = req.headers.host;
  var requestOptions, path, m;
  path = '/api/resetpassword';

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'GET',
    json : {}
  };
  if (!req.body.email || !req.body.password) {
    m = 'Error prosessing Password Reset request. Please try again.';
  }
  request(requestOptions, function(err, response) {
    if(err){
      console.log('FUCKKKKKKKKK13333333')
      handleError(req, res, err);
    }else if (response.statusCode === 200) {
      console.log('FUCKKKKKKKKK1222222')
      console.log("RRRRRRRRR: ", response.content)
      m = 'Please check your email. Instructions have been sent to your email address on how to reset your password.';

      res.render('login', {
        csrfToken: req.csrfToken(),
        title: 'Log In',
        pageHeader: {
          header: 'Welcome back!!!!!!'
        },
        message: m,
        passwordResetConfirmed: true
      });

    }else{
      handleError(req, res, response.statusCode);
    }
  });
};

module.exports.getLogin = function(req, res) {
  console.log('####### > serverMainCtrls > getLogin')
  req.session.loginSignup(function(err) {
    if(err){
      console.log('####### > serverMainCtrls > getLogin > ERROR:' + err); 
    }else{
      console.log('####### > serverMainCtrls > getLogin > SUCCESS'); 
      res.render('login', {
        csrfToken: req.csrfToken(),
        title: 'Log In',
        pageHeader: {
          header: 'Welcome back!'
        },
        error: req.query.err,
        passwordResetConfirmed: false
      });
    }
  });
};


/*
module.exports.postLogin = function(req, res){
  console.log('####### > serverMainCtrls.js > postLogin !!!!!')
  //console.log('####### > serverMainCtrls.js > postLogin !!!!! > csrf:', req.body._csrf)
  var requestOptions, path, postdata, m;
  path = '/api/login';

  postdata = {
    email: req.body.email,
    password: req.body.password
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };
  if (!postdata.email || !postdata.password) {
    console.log('####### > serverMainCtrls.js > postLogin 2')
    m = 'All fields required'
    res.redirect('/login/?err='+m);
  } else {
    console.log('####### > serverMainCtrls.js > postLogin 3')

    request(requestOptions, function(err, response, body) {

        if (response.statusCode === 201) {
          console.log('####### > serverMainCtrls.js > postLogin 5')
          //res.redirect('/userhome');
      
          req.session.save(function (err) {
            if (err) {
              console.log('####### > serverMainCtrls.js > req.session.save > ERROR')
            }
            console.log('####### > serverMainCtrls.js > req.session.save > YESSSSS')
            res.redirect('/userhome');
          })
          
        }else if (response.statusCode === 400) {
          console.log('####### > serverMainCtrls.js > postLogin 6')
          return res.redirect('/login/?err='+body);

        }else {
          console.log('####### > serverMainCtrls.js > postLogin 7')
          handleError(req, res, response.statusCode);
        }
    });
  }
};
*/

module.exports.postLogin = function(req, res, next){
  console.log('####### > serverMainCtrls.js > postLogin')
  console.log('####### > serverMainCtrls.js > postLogin > req.body.email: ', req.body.email)
  console.log('####### > serverMainCtrls.js > postLogin > req.body.password: ', req.body.password)
  var requestOptions, path, postdata, m;
  path = '/api/login';

  postdata = {
    email: req.body.email,
    password: req.body.password
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };
  if (!postdata.email || !postdata.password) {

    console.log('####### > serverMainCtrls.js > postLogin 222222')
    m = 'All fields required'
    res.redirect('/login/?err='+m);

  } else {

    passport.authenticate('local', function(err, user, info){
      if (err) {
        m = 'Authentication Error'
        return res.redirect('/login/?err='+m);
      }
      if (!user) { 
        m = 'Invalid login credentials'
        return res.redirect('/login/?err='+m);
      }
      req.logIn(user, function(err) {
        if (err) { 
          m = 'Authentication Login Error1'
          return res.redirect('/login/?err='+m);
        }
        path = '/api/login/' + user.id;
        requestOptions = {
          rejectUnauthorized: false,
          url : apiOptions.server + path,
          method : 'PUT'
        };
        request(requestOptions, function(err, response, body) {
          if (response.statusCode === 200) {
            res.redirect('/userhome');
          }else{
            handleError(req, res, response.statusCode);
          }
        });
      });
    })(req, res, next);

  }
};
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.postSignup = function(req, res, next){
  console.log('####### > serverMainCtrls.js > postSignup')
  var requestOptions, path, postdata, m;
  path = '/api/signup';
  var stateJsonObj = JSON.parse(req.body.state);
  req.body.state = stateJsonObj;

  postdata = {
    displayname: req.body.displayname,
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    city: req.body.city,
    state: req.body.state
  };

  requestOptions = {
    rejectUnauthorized: false,
    url : apiOptions.server + path,
    method : 'POST',
    json : postdata
  };

  if (!postdata.email || !postdata.displayname || !postdata.password || !postdata.firstname || !postdata.lastname || !postdata.city || !postdata.state) {
    m = 'All Sign up fields required'
    res.redirect('/signup/?err='+m);

  } else {

    request(requestOptions, function(err, response, body) {

      if (response.statusCode === 201) {
        console.log('####### > serverMainCtrls.js > postSignup > 11111')
        
        passport.authenticate('local', function(err, user, info){
          console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 000:', err)
          if (err) {
            console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 111')
            handleError(req, res, response.statusCode);
            return;
          }
          if (info) {
            console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 11000:', info)
            handleError(req, res, response.statusCode);
            return;
          }


          if(user){
            console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 222')
            req.logIn(user, function(err) {
              if (err) { 
                console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 333')
                handleError(req, res, response.statusCode);
                return;
              }
              req.session.save(function (err) {
                if (err) {
                  console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 444')
                  handleError(req, res, response.statusCode);
                  return;
                }
                res.redirect('/userhome');
              })
            });
          } else {
            console.log('####### > serverMainCtrls.js > postSignup > passport.authenticate 555:', err)
            handleError(req, res, response.statusCode);
          }
        })(req, res, next);


      } else if (response.statusCode === 409 ) {
         console.log('####### > serverMainCtrls.js > postSignup > 22222')
        m = body.message
        res.redirect('/signup/?err='+m);

      } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError' ) {
         console.log('####### > serverMainCtrls.js > postSignup > 33333')
        handleError(req, res, response.statusCode);

      } else {
         console.log('####### > serverMainCtrls.js > postSignup > 44444')
        if (body.message){
          m = body.message
          res.redirect('/signup/?err='+m);
        }
        handleError(req, res, response.statusCode);
      }
    });
  }
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.getSignup = function(req, res) {
  req.session.loginSignup(function(err) {
    if(err){
      console.log('####### > serverMainCtrls > getSignup > ERROR:' + err); 
    }else{
      console.log('####### > serverMainCtrls > getSignup > LOGIN:' + req.session._loggedInAt); 
      res.render('signup', {
        csrfToken: req.csrfToken(),
        title: 'Sign Up',
        pageHeader: {
          header: 'Sign up'
        },
        error: req.query.err
      });
    }
  });
};



module.exports.getMembersOnly = function(req, res) {
  //console.log('####### > serverMainCtrls > getMembersOnly1 > req.user: ', req.user + ' ::::req.sessionID: ' + req.sessionID)
  console.log('####### > serverMainCtrls > getMembersOnly > req.sessionID: ' + req.sessionID)
  console.log('####### > serverMainCtrls > getMembersOnly > req.session: ', req.session)

  res.render('membersonly', {
    title: 'Members Only Page',
    pageHeader: {
      header: 'Hello Authorized Users!'
    },
    error: req.query.err
  });

};

module.exports.getLoginOrSignup = function(req, res) {
  res.render('loginorsignup', {
    title: 'Sign Up or Login',
    pageHeader: {
      header: 'Not a member? <br> <h2>Join now and participate in the discussion!</h2>'
    },
    error: req.query.err
  });
};

module.exports.getResouces = function(req, res) {
  res.render('resources', {
    title: 'Resources',
    pageHeader: {
      header: 'Resouces for Election App 2016'
    },
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  });
};

module.exports.getDummyPage = function(req, res) {
  res.render('dummypage', {
    title: 'About',
    pageHeader: {
      header: '+++ Test Page !!!'
    }
  });
};

module.exports.getAbout = function(req, res) {
  res.render('basicView', {
    title: 'About',
    pageHeader: {
      header: 'About ThisGreatApp!'
    },
    content: 'ThisGreatApp! is all about people sharing their favorite novelties across America.\n\nAut tenetur sit quam aliquid quia dolorum voluptate. Numquam itaque et hic reiciendis. Et eligendi quidem officia maiores. Molestiae ex sed vel architecto nostrum. Debitis culpa omnis perspiciatis vel eum. Vitae doloremque dolor enim aut minus.\n\nPossimus quaerat enim voluptatibus provident. Unde commodi ipsum voluptas ut velit. Explicabo voluptas at alias voluptas commodi. Illum et nihil ut nihil et. Voluptas iusto sed facere maiores.'
  });
};

module.exports.getContact = function(req, res) {
  res.render('basicView', {
    title: 'Contact',
    pageHeader: {
      header: 'Contact ThisGreatApp!'
    },
    content: 'ThisGreatApp! can be contacted by calling 1-800-555-1234.\n\nDolorem necessitatibus aliquam libero magni. Quod quaerat expedita at esse. Omnis tempora optio laborum laudantium culpa pariatur eveniet consequatur.'
  });
};

module.exports.getTeam = function(req, res) {
  res.render('basicView', {
    title: 'Team',
    pageHeader: {
      header: 'Meet the Team'
    },
    content: 'The team behind ThisGreatApp! are a dedicated bunch who enjoy sharing favorite places and experiences.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.'
  });
};

