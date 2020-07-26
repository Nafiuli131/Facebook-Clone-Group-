const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/tests', {useNewUrlParser: true});; 

mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', (error) => {
        console.warn('Error : ',error);
    });

function dropTest(){
	beforeEach((done) => {
    	mongoose.connection.collections.tests.drop(() => {
        	done(); 
    	}); 
	});
}

setTimeout(dropTest,500);