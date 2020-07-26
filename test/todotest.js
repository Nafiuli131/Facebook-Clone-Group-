
const assert = require('assert');

var Todo = require("./models/todo");

describe('Creating a Todo', () =>{
	it('creates a todo', (done) => {
		var newtodo = new Todo({createdby : 'Imtiaz', todoList :'helloo'});
		newtodo.save().then(()=>{
			assert(!newtodo.isNew); 
			done();
		});
	});
});