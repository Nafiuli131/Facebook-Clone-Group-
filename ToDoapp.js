const express = require('express');
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./models/user.js");
const collection = "users";
const app = express();

mongoose.connect("mongodb://localhost/groupee");

// schema used for data validation for our todo document
const schema = Joi.object().keys({
    todo : Joi.string().required()
});

app.use(express.static(__dirname + '/views'));

// parses json data sent to us by the user 
app.use(bodyParser.json());

// serve static html file to user
app.get("/", function(req, res){
	res.render("todo");
});

// read
app.get('/getTodos',(req,res)=>{
    // get all Todo documents within our todo collection
    // send back to user as json
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
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


//create
app.post('/',(req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // Validate document
    // If document is invalid pass to error middleware
    // else insert document within todo collection
    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
    })    
});



//delete
app.delete('/:id',(req,res)=>{
    // Primary Key of Todo Document
    const todoID = req.params.id;
    // Find Document By ID and delete document from record
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});

// Middleware for handling Error
// Sends Error Response Back to User
app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})


// db.connect((err)=>{
//     // If err unable to connect to database
//     // End application
//     if(err){
//         console.log('unable to connect to database');
//         process.exit(1);
//     }
//     // Successfully connected to database
//     // Start up our Express Application
//     // And listen for Request
//     else{
//         app.listen(3000,()=>{
//             console.log('connected to database, app listening on port 3000');
//         });
//     }
// });

var server = app.listen(5000, function(){
	console.log("server has started on port 5000");	
});