var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/groupee' , { useNewUrlParser: true });

var passportLocalMongoose = require("passport-local-mongoose");
 
var db = mongoose.connection;
 
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function(callback){
console.log("Connection to database Succeeded."); /* Once the database connection has succeeded, the code in db.once is executed. */
});

var TodoSchema = new mongoose.Schema({
    createdby: String,
    todoList : String,
});


// returns OBJECTID object used to 
const getPrimaryKey = (_id)=>{
    return ObjectID(_id);
}




TodoSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("todo", TodoSchema);

db.close();