
var User = require('../model/userSchema.js');
var Comment = require('../model/commentsSchema');
var paginate = require('mongoose-range-paginate');
var pugCompiler = require('../../shared/pugCompiler');
var nodemailer = require('nodemailer');
var passport = require('passport');
var mongoose    = require('mongoose');

var sortKey = 'time'
var sort = '-' + sortKey
var sortDocsFrom = 0;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getIndexResponse = function(req, res) {
  sendJSONresponse(res, 200), { "message": "getIndexResponse Response!!!" };
};

module.exports.getUserHomeResponse = function(req, res) {
  console.log('####### > apiMainCtrls.js > getUserHomeResponse XXXXXXXXXXXXXXXXX')
  sendJSONresponse(res, 200), { "message": "getUserHomeResponse Response!!!" };
};

var buildGetCommentsResponse = function(req, res, results) {
  var responseBody = [];
  results.forEach(function(doc) {
    responseBody.push({
      id: doc._id,
      displayname: doc.displayname,
      commenterId: doc.commenterId,
      city: doc.city,
      state: doc.state,
      datecreated: doc.datecreated,
      candidate: doc.candidate,
      comment: doc.comment,
      recommended: doc.recommended,
      subComments: doc.subComments
    });
  });
  return responseBody;
};


/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

function getQuery() {
  return Comment.find()
    .where({})
}

module.exports.getCommentsResponse = function(req, res) {
  paginate(getQuery(), { sort: sort, limit: 5 }).exec(function (err, results) {
    var responseBody;
    if (err) {
      sendJSONresponse(res, 404, err);
    } else {
      sortDocsFrom = 4;
      responseBody = buildGetCommentsResponse(req, res, results);
      sendJSONresponse(res, 200, responseBody);
    }
  })
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getUserProfileResponse = function(req, res) {
  if (req.params && req.params.userid) {
    User.findById(req.params.userid).exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, { "message": "userid not found" });
          return;
        } else if (err) {
          sendJSONresponse(res, 404, err);
          return;
        }
        sendJSONresponse(res, 200, user);
      });
  } else {
    sendJSONresponse(res, 404, { "message": "No userid in request" });
  }
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */


var doAddComment = function(req, res, location, author) {
  if (!location) {
    sendJSONresponse(res, 404, "locationid not found");
  } else {
    location.reviews.push({
      author: author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
      var thisReview;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};


module.exports.postMainCommentResponse = function(req, res) {
  Comment.create({
    displayname: req.body.displayname,
    commenterId: req.body.commenterId,
    city: req.body.city,
    state: req.body.state,
    candidate: req.body.candidate,
    comment: req.body.comment
  }, function(err, electioncomment) {
    if (err) {
      sendJSONresponse(res, 400, err);
    } else {
      sendJSONresponse(res, 201, electioncomment);
    }
  });
};


module.exports.postSubCommentResponse = function(req, res) {
  if (!req.params.subcommentid) {
    sendJSONresponse(res, 404, { 'message': "subcommentid not found" });
    return; 
  }
  Comment.findById(req.params.subcommentid).select('subComments').exec(function(err, comment) {
    if (err) {
      sendJSONresponse(res, 400, err);
    }else{
      comment.subComments.push({
        displayname: req.body.displayname,
        commenterId: req.body.commenterId,
        city: req.body.city,
        state: req.body.state,
        comment: req.body.comment
      });
      comment.save(function(err, comment) {
        var newComment;
        if (err) {
          sendJSONresponse(res, 400, err);
        } else {
          newComment = comment.subComments[comment.subComments.length - 1];
          sendJSONresponse(res, 201, newComment);
        }
      });
    }
  });
};

var getCommentUser = function(req, res, callback) {
  if (req.payload.email) {
    User.findOne({ email : req.payload.email }).exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, { "message": "User not found" });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        console.log(user);
        callback(req, res, user.name);
      });
  } else {
    sendJSONresponse(res, 404, { "message": "User not found" });
    return;
  }
};


/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getOneCommentResponse = function(req, res) {
  if (req.params && req.params.commentid) {
    User.findById(req.params.commentid).exec(function(err, results) {
        if (!results) {
          sendJSONresponse(res, 404, {"message": "commentid not found"});
        } else if (err) {
          sendJSONresponse(res, 404, err);
        }
        sendJSONresponse(res, 200, results);
      });
  } else {
    sendJSONresponse(res, 404, {
      "message": "No commentid in request"
    });
  }
};


module.exports.editOneComment = function(req, res) {
  //
};

module.exports.deleteOneComment = function(req, res) {
  var commentsid = req.params.commentsid;
  if (!commentsid) {
    sendJsonResponse(res, 404, {
    "message": "Not found, locationid and reviewid are both required"
  });
    return; 
  }
  
  if (commentsid) {
    User.findByIdAndRemove(commentsid).exec(function(err, comment) {
          if (err) {
            sendJSONresponse(res, 404, err);
          }
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, { "message": "No commentid in request" });
  }
};


/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.getResetPasswordResponse = function(req, res) {
  sendJSONresponse(res, 200), { "message": "getResetPasswordResponse Response!!!" };
};


module.exports.putUserProfileResponse = function(req, res) {
  if (!req.params.userid) {
    sendJSONresponse(res, 404, { "message": "Not found, userid is required" });
    return;
  }
  User.findById(req.params.userid).exec(function(err, user) {
    if (!user || user === null) {
      sendJSONresponse(res, 404, {"message": "userid not found"});
      return;
    } else if (err) {
      sendJSONresponse(res, 400, err);
      return;
    } 

    var reqBodyKey, reqBodyValue;
    for (var z in req.body){
      reqBodyKey = z;
      reqBodyValue = req.body[z];
    }

    var objKey = Object.keys(req.body)
    user[objKey] = reqBodyValue;

    user.save(function(err, success) {
      if (err) {
        sendJSONresponse(res, 404, err);
      } else {
        sendJSONresponse(res, 200, success);
      }
    });
  });
};

// http://www.ryanray.me/sending-emails-with-jade-node-js-and-nodemailer
// https://github.com/ryanray/nodemailer-demo/


module.exports.ajaxEvaluateUserEmail = function(req, res, next) {
  console.log('#### ajaxEvaluateUserEmail');
  
  if(!req.body.email) {
    console.log('#### ajaxEvaluateUserEmail > !req.body.email: ', req.body.email);
    sendJSONresponse(res, 400, { 'message': 'error' });
  }else{
    User.findOne( { email: req.body.email } ).exec(function(err, user) {
      if (err) {
        console.log('#### ajaxEvaluateUserEmail > User.findOne > err:', err);
        sendJSONresponse(res, 404, { 'message': 'error' });
        return;
      }
      // expect user false (sign up)
      if(!req.body.expectedResponse){
        console.log('#### ajaxEvaluateUserEmail > User.findOne > !req.body.expectedResponse:', req.body.expectedResponse);
        if (user) {
          console.log('#### ajaxEvaluateUserEmail > User.findOne > user:', user);
          sendJSONresponse(res, 201, { 'message': 'error' });
          return;
        }
        console.log('#### ajaxEvaluateUserEmail > User.findOne > !req.body.expectedResponse > SUCCESS');
        sendJSONresponse(res, 201, { 'message': 'success' });
      }
      // expect user true (forgotpassword)
      if(req.body.expectedResponse){
        console.log('#### ajaxEvaluateUserEmail > User.findOne > req.body.expectedResponse:', req.body.expectedResponse);
        if (!user) {
          console.log('#### ajaxEvaluateUserEmail > User.findOne > !user:', user);
          sendJSONresponse(res, 201, { 'message': 'error' });
          return;
        }
        console.log('#### ajaxEvaluateUserEmailajaxEvaluateUserEmail > User.findOne > req.body.expectedResponse > SUCCESS');
        sendJSONresponse(res, 201, { 'message': 'success' });
      }
    });
  }
};

module.exports.ajaxEvaluateRegisteredUser = function(req, res, next) {
  console.log('ajaxEvaluateRegisteredUser +++++++++')
  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, { 'message': 'error' });
  }else{

    passport.authenticate('local', function(err, user, info){
      if (err) {
        sendJSONresponse(res, 404, { 'message': 'error' });
        return;
      }
      if (info) {
        // returns message either incorrect username or password
        sendJSONresponse(res, 401, { 'message': 'error' });
        return;
      }
      if(user){
        console.log('ajaxEvaluateRegisteredUser 201 success +++++++++')
        sendJSONresponse(res, 201, { 'message': 'success' });
      }
    })(req, res, next);
    
  }
};



module.exports.postValidateLogin = function(req, res, next) {
  console.log('#### postValidateLogin');

  if(!req.body.email || !req.body.password) {
    console.log('#### postValidateLogin > error 1');
    sendJSONresponse(res, 400, { 'message': 'All fields required' });

  }else{

    passport.authenticate('local', function(err, user, info){
      if (err) {
        console.log('#### postValidateLogin > error 2');
        sendJSONresponse(res, 404, err);
        return;
      }
      if (info) {
        console.log('#### postValidateLogin > error 3');
        sendJSONresponse(res, 401, info);
        return;
      }
      if(user){
        console.log('#### postValidateLogin > USER: ', user.id);
        req.logIn(user, function(err) {
          if (err) { 
            console.log('#### postValidateLogin > error 4');
            sendJSONresponse(res, 404, err);
            return;
          }
          User.findById(user.id).exec(function(err, user) {
            if (err) {
              console.log('#### postValidateLogin > error 5');
              sendJSONresponse(res, 404, err);
              return;
            }
            if(user){
              user.previouslogin = user.lastlogin;
              user.lastlogin = new Date();
              user.save(function(err, success) {
                if (err) {
                  console.log('#### postValidateLogin > error 6');
                  sendJSONresponse(res, 404, err);
                } else { 
                  var htitle = 'Election App 2016!';
                  var stitle = 'Log In or Sign Up to join the discussion';
                  var data = {
                    title: 'ThisGreatApp!',
                    pageHeader: {
                      title: htitle
                    },
                    subtitle: stitle,
                    prevLogin: req.user.previouslogin
                  };
                  sendJSONresponse(res, 201, { 'message': 'success' });
                  /*
                  var relativeTemplatePath = 'userHome';
                  pugCompiler.compile(relativeTemplatePath, data, function(err, html){
                    if(err){
                      console.log('####### > apiMainCtrls > postAuthenticateLogin > pugCompiler.compile > ERROR: ' + err);
                    }
                    console.log('####### > apiMainCtrls > postAuthenticateLogin > pugCompiler.compile > SUCCESS');
                    sendJSONresponse(res, 201, html);
                  });
                  */
                  /*
                  var relativeTemplatePath = 'userHome';
                  var absoluteTemplatePath = process.cwd() + '/theServer/views/' + relativeTemplatePath + '.pug';
                  pug.renderFile(absoluteTemplatePath, data, function(err, html){
                    if(err){
                      console.log('#### pug.renderFile111 > ERROR: ' + err);
                    }
                    sendJSONresponse(res, 200, html);
                  });
                  */
                }
              });
            }else{
              sendJSONresponse(res, 404, { 'message': 'userid not found' });
            }
          });
        });
      } else {
        sendJSONresponse(res, 401, { 'message': 'error' });
      }
    })(req, res, next);
  }
};

module.exports.postLoginResponse = function(req, res, next) {
  console.log('#### apiMainCtrls > postLoginResponse !!!!!!!!')
  console.log('#### apiMainCtrls > postLoginResponse > HERE 1111 !!!!!!!!! req.user: ', req.user);

  if(!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, { "message": "All fields required" });
  }else{

    passport.authenticate('local', function(err, user, info){
      if (err) {
        console.log('#### apiMainCtrls > postLoginResponse > error 2');
        sendJSONresponse(res, 404, err);
        return;
      }
      if (info) {
        console.log('#### apiMainCtrls > postLoginResponse > error 3');
        sendJSONresponse(res, 401, info);
        return;
      }
      //sendJSONresponse(res, 201, user);
      /*
      req.session.save(function (err) {
        if (err) {
          console.log('####### > serverMainCtrls.js > req.session.save > ERROR')
        }
        console.log('#### apiMainCtrls > postLoginResponse > HERE 22222 !!!!!!!!! req.user: ', req.user);
        req.logIn(user, function(err) {
          console.log('#### apiMainCtrlsX > postLoginResponse > req.logIn');
          if (err) { 
            console.log('#### apiMainCtrls > postLoginResponse > req.logIn > error 4');
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log('#### apiMainCtrls > postLoginResponse > req.logIn > USER: ', user);
          console.log('#### apiMainCtrls > postLoginResponse > HERE 33333 !!!!!!!!! req.user: ', req.user);
          user.previouslogin = user.lastlogin;
          user.lastlogin = new Date();
          user.save(function(err, success) {
            if (err) {
              console.log('#### apiMainCtrls > postLoginResponse > error 6');
              sendJSONresponse(res, 404, err);
            } else { 
              console.log('#### apiMainCtrls > postLoginResponse > req.logIn SUCCESSSSSSSSS');
              sendJSONresponse(res, 201, { 'message': 'success' });
            }
          });
        });
      })
      */

      if(user){
        console.log('#### apiMainCtrls > postLoginResponse > passport.authenticate > HERE 2222 !!!!!!!!! req.user: : ', req.user);

        req.logIn(user, function(err) {
          console.log('#### apiMainCtrlsX > postLoginResponse > req.logIn');
          if (err) { 
            console.log('#### apiMainCtrls > postLoginResponse > req.logIn > error 4');
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log('#### apiMainCtrls > postLoginResponse > req.logIn > HERE 3333 !!!!!!!!! req.user: : ', req.user);
          user.previouslogin = user.lastlogin;
          user.lastlogin = new Date();
          user.save(function(err, success) {
            if (err) {
              console.log('#### apiMainCtrls > postLoginResponse > error 6');
              sendJSONresponse(res, 404, err);
            } else { 
              console.log('#### apiMainCtrls > postLoginResponse > req.logIn SUCCESSSSSSSSS');
              sendJSONresponse(res, 201, { 'message': 'success' });
            }
          });
        });
      }

    })(req, res, next);
  }
};


module.exports.postLoginResponseXXX = function(req, res) {
  console.log("####### > apiMainCtrls > postLoginResponse")
  if(!req.body.email) {
    sendJSONresponse(res, 400, { "message": "All fields required" });
  }else{
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) {
        sendJSONresponse(res, 400, err);
        return;
      } 
      if (!user || user === null) {
        sendJSONresponse(res, 404, user);
        return;
      }
      console.log("####### > apiMainCtrls > postLoginResponse > sendJSONresponse123")
      sendJSONresponse(res, 201, user);
    });
  }
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

module.exports.updateUserResponse = function(req, res) {
  if (!req.params.userid) {
    sendJSONresponse(res, 404, { "message": "All fields required" });
    return;
  }
  User.findById(req.params.userid).exec(function(err, user) {
    if (err) {
      sendJSONresponse(res, 400, err);
      return;
    } 
    if (!user || user === null) {
      sendJSONresponse(res, 404, user);
      return;
    }
    user.previouslogin = user.lastlogin;
    user.lastlogin = new Date();
    user.save(function(err, success) {
      if (err) {
        sendJSONresponse(res, 404, err);
      } else {
        sendJSONresponse(res, 200, success);
      }
    });
  });
};

/* +++++++++++++++++++++++++++++++++++++++++++++++++ */
/* +++++++++++++++++++++++++++++++++++++++++++++++++ */


module.exports.postSignUpResponse = function(req, res) {
  console.log("####### > apiMainCtrls > postSignUpResponse")
  if (!req.body.displayname || !req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname || !req.body.city || !req.body.state) {
    console.log("####### > apiMainCtrls > postSignUpResponse > err 1")
    sendJSONresponse(res, 400, { message: "All fields required" });
    return; 
  }

  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log("####### > apiMainCtrls > postSignUpResponse > err 2")
      sendJSONresponse(res, 400, err);
      return;
    }

    if (user) {
      console.log("####### > apiMainCtrls > postSignUpResponse > err 3")
      sendJSONresponse(res, 409, { "message": "Please use a different email address." });
      return;
    }
    if (!user) {
      console.log("####### > apiMainCtrls > postSignUpResponse > err 4")
      var newUser = new User();
      newUser.displayname = req.body.displayname;
      newUser.email = req.body.email;
      newUser.firstname = req.body.firstname;
      newUser.lastname = req.body.lastname;
      newUser.city = req.body.city;
      newUser.state = req.body.state;
      //newUser.setPassword(req.body.password);

      //newUser.setPassword(undefined, function(err) {
      newUser.setPassword(req.body.password, function(err, result){
        if (err) {
          console.log("####### > apiMainCtrls > postSignUpResponse > newUser.setPassword 1")
          sendJSONresponse(res, 400, err);
        }
        newUser.save(function(err) {
          if (err) {
            console.log("####### > apiMainCtrls > postSignUpResponse > newUser.setPassword 2")
            sendJSONresponse(res, 400, err);
          } else {
            console.log("####### > apiMainCtrls > postSignUpResponse > newUser.setPassword 3 > result:", result)
            sendJSONresponse(res, 201, result);
          }
        });
      });


      /*
	    newUser.setPassword(req.body.password, function(err, user) {
        console.log("####### > apiMainCtrls > postSignUpResponse > newUser.setPassword: ", e)
     		newUser.save(function(err, result) {
        		if (err) {
              console.log("####### > apiMainCtrls > postSignUpResponse > err 5")
          		sendJSONresponse(res, 400, err);
        		} else {
              console.log("####### > apiMainCtrls > postSignUpResponse > err 6")
          		sendJSONresponse(res, 201, result);
        		}
      	});
      });
      */

      /*newUser.save(function(err, result) {
        if (err) {
          sendJSONresponse(res, 400, err);
  
        } else {
          sendJSONresponse(res, 201, result);
        }
      });*/
    }
  });
};






















