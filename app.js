var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	User = require("./models/user"),
	Group = require("./models/group"),
	Post = require("./models/post"),
	Todo = require("./models/todo"),	
	LocalStrategy = require("passport-local"),
	multer = require('multer'),
	passportLocalMongoose = require("passport-local-mongoose"),
	path = require('path'),
	dburl = "mongodb://localhost:27017",
	userprofile =  null,
	usr_id = null,
	todo_id = null,
	groupID = 1;
	userID = 1;
	chats = "chatss"
	MongoClient = require("mongodb").MongoClient;
	

const app = express();
const mongoOptions = {useNewUrlParser : true};


mongoose.connect('mongodb://localhost:27017/groupee' , { useNewUrlParser: true });


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
	secret: "secret message",
	resave: false,
	saveUninitialezed: false
}));
app.use(passport.initialize());
app.use(passport.session());



var storage = multer.diskStorage({
  			destination: function (req, file, cb) {
    			cb(null, 'data')
  			},
  			filename: function (req, file, cb) {
    			cb(null, Date.now() + file.originalname)
  			}
})

var upload = multer({ storage: storage })


// parses json data sent to us by the user 
app.use(bodyParser.json());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.static(__dirname + '/views'));


//creating a new group from home page
app.get("/", function(req, res){
	res.render("Firstpage");
});

app.get("/homepage", function(req, res){
	res.render("Homepage");
});

//createGroup

app.get("/grouphome", isLoggedIn, function(req, res){
	res.render("grouphome");
});


//handling Group Creation the Logical Part
app.post("/grouphome", function(req, res){
	console.log(userprofile+ " is trying to create a group");
	var groupinfo = new Group({ //You're entering a new bug here, giving it a name, and specifying it's type.
	groupName: req.body.groupName, 
	type: req.body.type, 
	objective: req.body.objective,
	groupID : 	groupID,
	adminName : userprofile,
	userID :  userID,
	chats : chats,
 	});
	groupinfo.save(function(error) {
		if (error) {
	    console.error(error);
		 }
		else{
			console.log("Your group has been saved!");
		}});
		MongoClient.connect(dburl, (err, client) => {
			if (err) {
			  console.error(err)
			  return
			}
			else{
				const dbPosts = client.db('groupee');
				const collectiondbPosts = dbPosts.collection('posts');
				collectiondbPosts.find().toArray((err, items) => {
					Infos = items;
					 console.log(items);
					res.render('group', {'infos': items});
				  });
			}
		});
});

//creating user post -------->
app.get("/createPost", isLoggedIn, function(req, res){
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbPosts = client.db('groupee');
			const collectiondbPosts = dbPosts.collection('posts');
			collectiondbPosts.find().toArray((err, items) => {
				Infos = items;
				 console.log(items);
            	res.render('group', {'infos': items});
			  });
		}
	});
});


app.post("/createPost",upload.single('postFile'), function(req, res){
	console.log(userprofile+ " is trying to create a User post");
	
	if(req.file) {
		var postinfo = new Post({ 
			post : req.body.post,
			createdby: userprofile,
			postID : 1,
    		poll: null,
			pollID : 1,
			postDateTime : Date.now(),
			fileName : req.file.filename,
			originalName : req.file.originalname
 		});
	}
	else {
		var postinfo = new Post({ 
			post : req.body.post,
			createdby: userprofile,
			postID : 1,
    		poll: null,
			pollID : 1,
			postDateTime : Date.now()
 		});
	}
	postinfo.save(function(error) {
		if (error) {
	    console.error(error);
		 }
		else{
			console.log("Your post has been saved!");
		}
	});
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbPosts = client.db('groupee');
			const collectiondbPosts = dbPosts.collection('posts');
			collectiondbPosts.find().toArray((err, items) => {
				Infos = items;
         		console.log(items);
            	res.render('group', {'infos': items});
			  });
		}
	});
});


app.get("/secret", isLoggedIn, function(req, res){  //using middleware and a facade design pattern
	res.render("secret");
});

//handling user signup the View Rendering Part
app.get("/register", function(req, res){
	res.render("Firstpage");
});

//handling user signup the Logical Part
app.post("/register", function(req, res){
	req.body.firstName
	req.body.lastName
	req.body.username
	req.body.eMail
	req.body.password
	userprofile = req.body.username
	User.register(new User({
		firstName: req.body.firstName, 
		lastName: req.body.lastName, 
		username: req.body.username, 
		eMail: req.body.eMail, 
	}), 
	req.body.password, function(err, user){ //use of middleware
		if(err){
			console.log(err);
			return res.render('Firstpage');
		}
		passport.authenticate("local")(req, res, function(){
			res.render("Homepage");
			console.log("User account creation successful for "+ req.body.username);
			console.log("a new user added to the users collection");
		});
	});
});

//handling user login the View Rendering Part
app.get("/login", function(req, res){
	res.render("Firstpage");
});

app.get('/download/:file(*)',(req, res) => {
  var file = req.params.file;
  var fileLocation = path.join('./data',file);
  res.download(fileLocation, file);
});

//Invite Member Starts
function groupMake(groupID, renderGroup, res){

	
	try{
		var groupOID = mongoose.Types.ObjectId(groupID);
	}
	catch{
		console.log("Invalid group id");
	}

	MongoClient.connect(dburl, (err, client) => {
		if (err) {
			console.log(err);				
		}
		else{
			const dbGroupee = client.db('groupee');
			const collectionGroup = dbGroupee.collection('groups');
			collectionGroup.find({_id : groupOID}).toArray((err, items) => {
				if(err){
					console.log(err);
				}
				else{
					if(items.length==0){
						console.log("No such group exists");
					}
					else{
						console.log("Group exists");
						renderGroup(res, groupID);
					}				
				}
			});
		}
	});
}

function renderGroup(res, groupID){
	res.render("invite", {"groupID" : groupID} );
}

app.get('/group/:group(*)',(req,res) => {
	var groupID = req.params.group;
	groupMake(groupID, renderGroup, res);
});


function  inviteMember(userName, updateMember, res, groupID){

	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbGroupee = client.db('groupee'); 
			const collectionUser = dbGroupee.collection('users');
			collectionUser.find({username : userName}).toArray((err, items) => {
				if(err){
					res.redirect('/group/'+groupID);
				}
				else{ 
					if(items.length!=0){
						updateMember(userName, groupID);
					}
					else{
						console.log("User name does not exists");
					}
					res.redirect('/group/'+groupID);
				}
			});
		}
	});

}

function updateMember(username, groupID){


	try{
		var groupOID = mongoose.Types.ObjectId(groupID);
	}
	catch{
		console.log("Not a valid objectID");
		res.redirect('/');
	}

	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbGroupee = client.db('groupee'); 
			const collectionGroup = dbGroupee.collection('groups');
			collectionGroup.findOneAndUpdate({_id : groupOID}, {$push: {memberIDs : username}}, {new: true}, 
				function (err, items) {
				if(err){
					console.log(err);
				}
				else{
					console.log("Added Member");		
				}
			});
		}
	});
}



app.post('/group/:group(*)/invite', (req,res) => { // needs to implement username validation check 
	var username = req.body.username;
	var groupID = req.params.group;
	inviteMember(username, updateMember, res, groupID);
});

//Invite Member Ends

//handling user login the Logical Part
app.post("/login", function(req, res){
	req.body.username
	req.body.password
	userprofile = req.body.username
	//profilename = userprofile
	passport.authenticate("local")(req, res, function(){
		MongoClient.connect(dburl, (err, client) => {
			if (err) {
			  console.error(err)
			  return
			}
			else{
				const dbUserInfo = client.db('groupee');
				const collectiondbUserInfo = dbUserInfo.collection('users');
				collectiondbUserInfo.find().toArray((err, items) => {
					Infos = items;
					for (var i = 0; i < items.length; i++) { 
						if(items[i].username == userprofile){
							console.log(userprofile + "you are trying to read information of "+ items[i].username + items[i]._id);
							usr_id = items[i]._id;
							res.render('profile', {'infos': items[i]});
						}
					}
				  });
			}
		});
		console.log("hello "+ userprofile);
		});
}, passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}));

app.get("/logout", function(req, res){
	req.logout(); 	//use of facade design pattern
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


/////////////code for todo list section/////////////
//todo list read

//create

app.post("/myToDos", function(req, res){
	console.log(userprofile+ " is trying to create a todo");
	var todoinfo = new Todo({ 
	createdby: userprofile,
    todoList : req.body.todo,
 	});
	todoinfo.save(function(error) {
		console.log("Your todo has been saved!");
		if (error) {
	    console.error(error);
		}
		else{
			console.log(userprofile+ " inserted his new todo " +req.body.todo);
		}
	});
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbToDos = client.db('groupee');
			const collectiondbToDos = dbToDos.collection('todos');
			collectiondbToDos.find().toArray((err, items) => {
				Infos = items;
				console.log(items);
				res.render('todo', {'infos': items,
											viewTitle: "Update todo",
											'profile': userprofile});
				for (var i = 0; i < items.length; i++) { 
					if(items[i].createdby == userprofile){
						console.log(items[i].createdby + " you are trying to read information of " + items[i]._id + items[i].todoList);
						todo_id = items[i]._id;
						console.log(items[i]._id);
						console.log(items[i].todoList);
					}
				}
			  });
		}
	});
});

app.get('/myToDos', isLoggedIn, function(req, res) {
	
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbToDos = client.db('groupee');
			const collectiondbToDos = dbToDos.collection('todos');
			collectiondbToDos.find().toArray((err, items) => {
				Infos = items;
				console.log(items);
				res.render('todo', {'infos': items,
											viewTitle: "Update todo",
											'profile': userprofile});
				for (var i = 0; i < items.length; i++) { 
					if(items[i].createdby == userprofile){
						console.log(items[i].createdby + " you are trying to read information of " + items[i]._id + items[i].todoList);
						todo_id = items[i]._id;
						console.log(items[i].todoList + "contains" + todo_id);
						console.log( "created by " + items[i].createdby);
					}
				}
			  });
		}
	});
    
});

app.post('/updateTodo', (req, res) => {
		updateTodo(req, res);
		MongoClient.connect(dburl, (err, client) => {
			if (err) {
				console.error(err)
				return
			}
			else{
				const dbToDos = client.db('groupee');
				const collectiondbToDos = dbToDos.collection('todos');
				collectiondbToDos.find().toArray((err, items) => {
					Infos = items;
					console.log(items);
					res.render('todo', {'infos': items,
												viewTitle: "Update todo",
												'profile': userprofile});
					for (var i = 0; i < items.length; i++) { 
						if(items[i].createdby == userprofile){
							console.log(items[i].createdby + " you are trying to read information of " + items[i]._id + items[i].todoList);
							todo_id = items[i]._id;
							console.log(items[i]._id);
							console.log(items[i].todoList);
						}
					}
					});
			}
		});
});

function updateTodo(req, res) {
	console.log(todo_id);
    Todo.findOneAndUpdate({ _id: todo_id },{$set: {todoList: req.body.todo}}, { new: true }, (err, infos) => {
        if (!err){ 
			console.log(infos);
			console.log(req.body.todo);
		}
		else{
			console.log(err);
		}
    });
}


app.get('/delete/:id', (req, res) => {
    Todo.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
			console.log("todo removed from collection");
        }
        else { console.log('Error in employee delete :' + err); }
		});
		MongoClient.connect(dburl, (err, client) => {
			if (err) {
				console.error(err)
				return
			}
			else{
				const dbToDos = client.db('groupee');
				const collectiondbToDos = dbToDos.collection('todos');
				collectiondbToDos.find().toArray((err, items) => {
					Infos = items;
					console.log(items);
					res.render('todo', {'infos': items,
												viewTitle: "Update todo",
												'profile': userprofile});
					for (var i = 0; i < items.length; i++) { 
						if(items[i].createdby == userprofile){
							console.log(items[i].createdby + " you are trying to read information of " + items[i]._id + items[i].todoList);
							todo_id = items[i]._id;
							console.log(items[i]._id);
							console.log(items[i].todoList);
						}
					}
					});
			}
		});
});



// update
app.put('/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const todoID = req.params.id;
    // Document used to update
    const userInput = req.body;
	// Find Document By ID and Update
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo}},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});

//profile view section
app.post('/editProfile', (req, res) => {
    updateRecord(req, res);
});


function updateRecord(req, res) {
	console.log(req.body._id);
    User.findOneAndUpdate({ _id: usr_id }, req.body, { new: true }, (err, doc) => {
        if (!err){ 
					res.render("profile", {
						viewTitle: 'Profile',
						infos: req.body
				});
		}
        else {
            if (err.name == 'ValidationError') {
                // handleValidationError(err, req.body);
                res.render("profile", {
                    viewTitle: 'Profile',
                    infos: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}

app.get('/profile', isLoggedIn, function(req, res){
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbUserInfo = client.db('groupee');
			const collectiondbUserInfo = dbUserInfo.collection('users');
			const collectiondbGroupList = dbUserInfo.collection('groups');
			collectiondbUserInfo.find().toArray((err, items) => {
				console.log("helo helo helo ");
				console.log(Infos);
				for (var i = 0; i < items.length; i++) { 
					if(items[i].username == userprofile){
						console.log(userprofile + "you are trying to read information of "+ items[i].username + items[i]._id);
						usr_id = items[i]._id;
													
						res.render('profile', {'infos': items[i],
												viewTitle: "My Porfile"});
					}
				}
			  });
		}
	});
});

app.get('/getGroupList', isLoggedIn, function(req, res){
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbUserInfo = client.db('groupee');
			const collectiondbGroupList = dbUserInfo.collection('groups');
			collectiondbGroupList.find().toArray((err, items) => {
				Infos = items;
				console.log(items);
				for(var i =0; i< items.length; i++){
					for (var j = 0; j < items[i].memberIDs.length; j++) {
						if(items[i].memberIDs[j] == userprofile){
							console.log(userprofile + "is a member of "+ items[i].groupName);
							}
					}
				}	
				res.render('grouplist', {'infos': items,
																	'userprofile': userprofile});
			  });
		}
	  });
});


app.get('/editProfile', isLoggedIn, function(req, res){
	MongoClient.connect(dburl, (err, client) => {
		if (err) {
		  console.error(err)
		  return
		}
		else{
			const dbUserInfo = client.db('groupee');
			const collectiondbUserInfo = dbUserInfo.collection('users');
			collectiondbUserInfo.find().toArray((err, items) => {
				Infos = items;
				for (var i = 0; i < items.length; i++) { 
					if(items[i].username == userprofile){
						console.log(userprofile + "you are trying to read information of "+ items[i].username + items[i]._id);
						usr_id = items[i]._id;
						res.render('profileedit', {'infos': items[i],
												viewTitle: "Update your profile"});
					}
				}
			  });
		}
	  });
});


var server = app.listen(5000, function(){
	console.log("server has started on port 5000");	
});



// function insertRecord(req, res) {
//     var employee = new Employee();
//     employee.fullName = req.body.fullName;
//     employee.email = req.body.email;
//     employee.mobile = req.body.mobile;
//     employee.city = req.body.city;
//     employee.save((err, doc) => {
//         if (!err)
//             res.redirect('employee/list');
//         else {
//             if (err.name == 'ValidationError') {
//                 handleValidationError(err, req.body);
//                 res.render("employee/addOrEdit", {
//                     viewTitle: "Insert Employee",
//                     employee: req.body
//                 });
//             }
//             else
//                 console.log('Error during record insertion : ' + err);
//         }
//     });
// }