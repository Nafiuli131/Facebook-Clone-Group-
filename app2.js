var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	User = require("./models/user"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose")
mongoose.connect("mongodb://localhost/loginreg_auth");




var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));



app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var Schema = new mongoose.Schema({
	firstName   : String,
	lastName: String,
	username  : Number,
 eMail:String,
 password:String,
 avatar:String

});

var user = mongoose.model('emp', Schema);

app.get("/new", function(req, res){
	res.render("new");
});

app.post('/new', function(req, res){
	new user({
		firstName  : req.body.firstName,
		lastName: req.body.lastname,
		username   : req.body.username,
    eMail  : req.body.eMail,
    avatar: req.body.avatar,
    password  : req.body.password
	}).save(function(err, doc){
		if(err) res.json(err);
		else    res.send('Successfully inserted!');
	});
});




var server = app.listen(5000, function(){
	console.log("server has started on port 5000");
});
