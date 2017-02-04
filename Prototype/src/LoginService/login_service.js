// The Login Service, which communicates with the DB to register and login users
//
// Use: node login_service
//
// Required environment variables: PORT (the port), DB_DIR (the public direction
// of the mongo database) and DB_NAME (the name of the database)

var app = require('express')();
var url = require("url");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

var port = process.env.PORT;
var dbDir = process.env.DB_DIR;
var dbName = process.env.DB_NAME;

mongoose.connect(dbDir);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
	console.log('Success on database connection');
});

// Generates a random token
function generateToken () {
	return Math.random().toString(32);
}

// Check if the email is correct
function validateEmail (email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var User = mongoose.model(dbName, userSchema);

// The Master Service connects with the Login Service
io.on('connection', function(socket){
	// On user registration
	socket.on('register', function(email, theUsername, password) {
		if (validateEmail (email)) {
			if (theUsername.length >= 4 && theUsername.length <= 12) {
				if (password.length >= 8 && password.length <= 24) {
					User.findOne({$or:[{'email': email}, {'username': theUsername}]},'username email',function(err, us) {
						if (err) {
							console.log('Error occurred in the query');
							socket.emit('register', "ERR_DB");
						}

						if (!us) {
							var newUser = new User({
								email: email,
								username : theUsername,
								password: password
							});

							newUser.save(function (err, data) {
								if (err) {
									console.log(err);
									socket.emit('register', "ERR_DB");
								} else {
									console.log('Saved : ', data );
									socket.emit('register', "SUCCESS");
								}
							});
						} else {
							if (us.email == email) {
								console.log('Error in user registration: An user with the email <'+email+'> already exists');
								socket.emit('register', "EMAIL_EXISTS");
							} else {
								console.log('Error in user registration: An user with the username <'+theUsername+'> already exists');
								socket.emit('register', "USERNAME_EXISTS");
							}
						}
					});
				} else {
					console.log('Error in user registration: Password too short/long (' + email + ', ' +
						theUsername + ', ' + password + ')');
					socket.emit('register', "ERR_PASSWORD");
				}
			} else {
				console.log('Error in user registration: Username too short/long (' + email + ', ' +
					theUsername + ', ' + password + ')');
				socket.emit('register', "ERR_USERNAME");
			}
		} else {
			console.log('Error in user registration: Email with bad format (' + email + ', ' +
				theUsername + ', ' + password + ')');
			socket.emit('register', "ERR_EMAIL");
		}
	});
	
	// On user login
	socket.on('login', function(theUsername, password) {
		if (theUsername.length >= 4 && theUsername.length <= 12) {
			if (password.length >= 8 && password.length <= 24) {
				User.findOne({'username': theUsername, 'password': password},'email username password',function(err, us) {
					if (err) {
						console.log('Error occurred in the query');
						socket.emit('login', "ERR_DB", '', '');
					} else if (us) {
						console.log('User logged in: ' + theUsername);
						socket.emit('login', "LOGGED_IN", theUsername, generateToken());
					} else {
						console.log('Error in user login: Wrong pair user-password ('+theUsername+'-'+password+')');
						socket.emit('login', "WRONG_LOGIN_DATA", '', '');
					}
				});
			} else {
				console.log('Error in user registration: Password too short/long (' + email + ', ' +
					theUsername + ', ' + password + ')');
				socket.emit('login', "ERR_PASSWORD", '', '');
			}
		} else {
			console.log('Error in user registration: Username too short/long (' + email + ', ' +
				theUsername + ', ' + password + ')');
			socket.emit('login', "ERR_USERNAME", '', '');
		}
	});
});

http.listen(port, "0.0.0.0", function(){
	console.log('listening on *:'+port);
});
