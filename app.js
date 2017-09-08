var express                 = require("express");
var app                     = express();
var bodyParser              = require("body-parser");
var mongoose                = require("mongoose");
var methodOverride          = require("method-override");
var expressSanitizer        = require('express-sanitizer');
var passport                = require("passport");
//LOAD DB MODELS FROM EXTERNAL FILES
var User                    = require("./models/user");
var Ticket                  = require("./models/ticket");
//END LOAD DB MODELS FROM EXTERNAL FILES
var localStrategy           = require("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");

//APP + MONGOOSE CONFIGURATION
//mongodb://<dbuser>:<dbpassword>@ds127864.mlab.com:27864/sla-me
// mongoose.connect("mongodb://localhost/SLAme");
mongoose.connect("mongodb://scaccoman:caccacacca@ds127864.mlab.com:27864/sla-me");
mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//PASSPORT SETUP
app.use(require("express-session")({
    secret: "Things you need to do in your life to survive",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//====================================================
//  RESTFUL ROUTES SETUP START!!!!!
//====================================================

app.get("/", function(req, res){
    res.redirect("/tickets");
});

//INDEX ROUTE
app.get("/tickets", function(req, res){
    Ticket.find({}, function(err, ticket){
        if(err){
            console.log(err);
        } else {
            res.render("index", {ticket: ticket});
        }
    });
});

//NEW ROUTE
app.get("/tickets/new", isLoggedIn, function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/tickets", function(req,res){
    //create ticket
    req.body.ticket.description = req.sanitize(req.body.ticket.description);
    Ticket.create(req.body.ticket, function(err, newTicket){
        if(err){
            res.render("new");
        } else {
            res.redirect("/tickets");
        }
    });
    //then, redirect to index
});

//SHOW ROUTE
app.get("/tickets/:id", function(req, res) {
    Ticket.findById(req.params.id, function(err, foundTicket){
        if(err){
            console.log(err);
            res.redirect("/tickets");
        } else {
            res.render("show", {ticket: foundTicket});
        }
    });
});

//EDIT ROUTE
app.get("/tickets/:id/edit", isLoggedIn, function(req, res) {
    Ticket.findById(req.params.id, function(err, foundTicket){
        if(err){
            res.redirect("/tickets");
        } else {
            res.render("edit", {ticket: foundTicket});
        }
    });
});

//UPDATE ROUTE
app.put("/tickets/:id", function(req, res){
    req.body.ticket.description = req.sanitize(req.body.ticket.description);
    // Blog.findByIdAndUpdate(id, newData, callback)
    Ticket.findByIdAndUpdate(req.params.id, req.body.ticket, function(err, updatedTicket){
        if(err){
            res.redirect("/tickets");
        } else {
            res.redirect("/tickets/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/tickets/:id", isLoggedIn, function(req, res){
    Ticket.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/tickets");
        } else {
            res.redirect("/tickets");
        }
    });
});

//==============
//AUTH ROUTES
//==============

//Sign Up
app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log("error registering the user");
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/tickets");
            });
        }
    });
})

//Log In
app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/tickets",
    failureRedirect: "/login"
}), function(req, res) {
});

//Log Out
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/tickets");
});

//MIDDLEWARE TO RESTRIC ACCESS TO SPECIFIC PAGES
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//SEARCH ROUTE
app.post("/tickets/search", function(req, res) {
    Ticket.findById(req.body.ticket._id, function(err, foundTicket){
        if(err){
            console.log(err);
            res.redirect("/tickets");
        } else {
            res.render("show", {ticket: foundTicket});
        }
    });
});

//STATISTICS PAGE ROUTE
app.get("/stats", function(req, res) {
    Ticket.find({}, function(err, ticket){
        if(err){
            console.log(err);
        } else {
            res.render("stats", {ticket: ticket});
        }
    });
})


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("ticket server is running...");  
})