const mongoose = require('mongoose');
const schema = mongoose.Schema;

var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const loginSchema = new schema({ //declaring schema for login model
    username: String,
    password: String,
    email: String
});

const loginModel = mongoose.model('login', loginSchema); //initiating login model

mongoose.connect('mongodb://localhost:27017/logindb', {useNewUrlParser: true}); //connecting to the database

mongoose.connection.once('open', function(){ //displaying message if connection is made
    console.log('Connection has been made');
}).on('error', function(error){
    console.log('connection error:', error); //displaying error message
});


module.exports = function(app){ //exporting to the main file
    app.get('/', function(req, res){ //rendering login page
        res.render('loginpage', {msg: "Enter Login Credentials", qs: req.query});
    });

    app.post('/', urlencodedParser, function(req,res){
        console.log(req.body);
        if (req.body.username == ''){ //checking for empty username
            console.log("Enter Username");
            res.render('loginpage', {msg: "Enter Username", qs: req.query});
        } else if (req.body.password == ''){ //cheking for empty password
            console.log("Enter Password");
            res.render('loginpage', {msg: "Enter Password", qs: req.body});
        } else if (req.body.username == 'admin' && req.body.password == 'admin'){ //hardcoded admin login
            console.log("Welcome Admin!");
            res.render('loginSuccess',{data:req.body}); //rendering login success page for admin
        } else{ //finding the record in the database
            loginModel.findOne({username: req.body.username, password: req.body.password}, function(err, data){
                if (data === null){ //if record not found
                    console.log("Login Unsuccessful")
                    var qs = {username: req.body.username};
                    res.render('loginpage', {msg: "Login Unsuccessful.. Enter again", qs: qs});
                } else{ //if record is found
                    console.log("Record found!");
                    console.log("Welcome Back", data.username);
                    res.render('loginSuccess',{data: req.body}) //rendering login success page
                };
            }); 
        };       
    });

    app.get('/signup', function(req, res){ //rendering signup page
        res.render('signuppage', {msg: "Fill your details below to sign up", qs: req.query});
    });

    app.post('/signup', urlencodedParser, function(req,res){
        if (req.body.username == '' || req.body.password == '' || req.body.email == ''){ //checking for empty credentials while signing up
            console.log("Sign up unsuccessful");
            res.render('signuppage', {msg: "Sign Up Unsuccessful.. Fill entire details", qs: req.body});
        }else{ //checking if credentials match the previous record in the database
            loginModel.findOne({username: req.body.username}, function(err, data){ //checking username
                if (data !== null){
                    console.log("Sign Up Unsuccessful")
                    res.render('signuppage', {msg: "Username already exist.. Enter again", qs: req.body});
                } else{ //checking the existence of password
                    loginModel.findOne({email: req.body.email}, function(err, data){
                        if (data !== null){
                            console.log("Sign Up Unsuccessful")
                            res.render('signuppage', {msg: "Email already exist.. Enter again", qs: req.body});
                        }else{ //if no record for entered credentials
                            console.log(req.body);
                            var user1 = loginModel({username: req.body.username, password: req.body.password, email: req.body.email}).save(function(err){
                                if (err) throw err;
                            });
                            console.log("Sign up successful"); 
                            res.render('signupSuccess',{data: req.body}) //rendering signup success page   
                        };
                    }); 
                };
            }); 
        };
    });
};
