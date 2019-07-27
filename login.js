var express = require('express');
var app = express();

var loginController = require('./loginController');

//set up template engine
app.set('view engine', 'ejs');

//static files
app.use(express.static('./public'));

//fire controllers 
loginController(app);

//listen to port
app.listen(3000);
