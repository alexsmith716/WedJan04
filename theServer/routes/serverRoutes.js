
var cookieParser      = require('cookie-parser')
var csrf              = require('csurf')
var bodyParser        = require('body-parser')
var express 			    = require("express");
var router 				    = express.Router();
var serverControllers = require("../controller/serverMainCtrls");
var auth              = require("../../shared/auth");
var csrfProtection 		= csrf({ cookie: true });

// To store or access session data, use the request property 'req.session'
// To get the ID of the loaded session, access the request property 'req.sessionID'. 
// This is simply a read-only value set when a session is loaded/created.

router.use(function(req, res, next) {
  console.log("####### > serverRoutes > router.use > req(method/url): ", req.method, " :: ", req.url);
  //console.log('####### > serverRoutes > router.use > req: ', req)
 // console.log('####### > serverRoutes > router.use > req.user: ', req.user + ' ::::req.sessionID: ' + req.sessionID)
  res.locals.currentUser = req.user;
    res.locals.currentURL = req.url;
    if(res.locals.currentUser){
      req.session.paginateFrom = res.locals.sortDocsFrom;
      req.session.lastPageVisited = "/indexView";
    }
    next();
});


router.get("/", serverControllers.getIndex);

router.get("/userhome", csrfProtection, auth.ensureAuthenticated, serverControllers.getUserHome);

router.get("/comments", csrfProtection, auth.ensureAuthenticated, serverControllers.getComments);

router.post("/comments/maincomment", csrfProtection, auth.ensureAuthenticated, serverControllers.postMainComment);

router.post("/comments/subcomment/:subcommentid", csrfProtection, auth.ensureAuthenticated, serverControllers.postSubComment);

router.get("/signup", csrfProtection, serverControllers.getSignup);
router.post("/signup", csrfProtection, serverControllers.postSignup);

router.get("/login", csrfProtection, serverControllers.getLogin);
router.post("/login", csrfProtection, serverControllers.postLogin);

router.get("/resetpassword", csrfProtection, auth.ensureNotAuthenticated, serverControllers.getResetPassword);

router.get("/userprofile", csrfProtection, auth.ensureAuthenticated, serverControllers.getUserProfile);
//router.put("/userprofile", csrfProtection, auth.ensureAuthenticated, serverControllers.putUserProfile);

router.get("/membersonly", auth.ensureAuthenticated, serverControllers.getMembersOnly);

router.get("/loginorsignup", auth.ensureNotAuthenticated, serverControllers.getLoginOrSignup);

router.get("/dummypage", serverControllers.getDummyPage);

router.get("/resources", serverControllers.getResouces);
router.get("/about", serverControllers.getAbout);
router.get("/contact", serverControllers.getContact);
router.get("/team", serverControllers.getTeam);

router.get("/logout", auth.ensureAuthenticated, serverControllers.getLogout);


module.exports = router;




