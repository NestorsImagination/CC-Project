// The Master Server, which contains the basic funcionalities and redirects
// the users' commands to the propper service
//
// Use: node master_server
//
// Required environment variables: PORT (the port), PLAYERS_PER_MATCH (the 
// number of players in a game match), LOGIN_DIR (the direction of the Login
// Service) and MATCHMAKER_DIR (the direction of the Matchmaker)

var app = require('express')();
var url = require("url");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT;
var playersPerMatch = process.env.PLAYERS_PER_MATCH;
var loginDir = process.env.LOGIN_DIR;
var matchmakerDir = process.env.MATCHMAKER_DIR;

var userTokens = {};
var startedGames = {};

// Adds an user to a game, starting the game if all the users have connected to it
function addUserToGame (gameWorldDir, worldName, username) {
	if (typeof startedGames[worldName] === "undefined") {
		startedGames[worldName] = {worldDir:gameWorldDir, numPlayers:1, userTokens:{}};
		startedGames[worldName].userTokens[username] = userTokens[username];
	} else {
		startedGames[worldName].numPlayers++;
		startedGames[worldName].userTokens[username] = userTokens[username];

		if (startedGames[worldName].numPlayers == playersPerMatch) {
			console.log('Empieza una partida en '+gameWorldDir);
			var socketWorldMaster = require ('socket.io-client')(gameWorldDir+'/master-server');
			socketWorldMaster.emit ('game start', startedGames[worldName].userTokens);
		}
	}
}

app.get('/', function(req, res){
	res.sendFile(__dirname + '/html/index.html');
});

app.get('/register', function(req, res){
	res.sendFile(__dirname + '/html/register.html');
});

app.get('/register_success', function(req, res){
	res.sendFile(__dirname + '/html/register_success.html');
});

app.get('/style.css', function(req, res){
	res.sendFile(__dirname + '/css/style.css');
});

app.get('/lobby', function(req, res){
	res.sendFile(__dirname + '/html/lobby.html');
});

app.get('/game_match', function(req, res){
	res.sendFile(__dirname + '/html/game_match.html');
});

// Namespace for the people in the login/registration screens
var namespaceIntro = io.of('/intro');
namespaceIntro.on('connection', function(socket, client) {
	// User registration
	socket.on('register', function(email, theUsername, password) {
		var socketLoginService = require ('socket.io-client')(loginDir);
		socketLoginService.emit ('register', email, theUsername, password);
		socketLoginService.on('register', function (response) {
			socket.emit('register', response);
		});
	});
	
	// User login
	socket.on('login', function(theUsername, password) {
		var socketLoginService = require ('socket.io-client')(loginDir);
		socketLoginService.emit ('login', theUsername, password);
		socketLoginService.on('login', function (response, username, token) {
			if (response == 'LOGGED_IN') {
				userTokens[username] = token;	// The user is now connected and gets a token

				console.log('User logged in: ' + username);

				namespaceLobby.to('lobby').emit('chat message', "Se ha conectado " + username);
			}

			socket.emit('login', response, username, token);
		});
	});
});

// Namespace for the users in the lobby
var namespaceLobby = io.of('/lobby');
namespaceLobby.on('connection', function(socket) {
	var username = "";

	var socketMatchmaker;

	// The user connects to the lobby
	socket.on('user connect', function(theUsername, token) {
		if (username == "") {
			if (theUsername.length >= 4 && theUsername.length <= 12) {
				if (userTokens[theUsername] == token) {
					username = theUsername;
					socket.join('lobby');
					socket.emit('user connect', "CONNECTED");
				} else {
					socket.emit('user connect', "ERR_BAD_TOKEN");
				}
			} else {
				socket.emit('user connect', "ERR_BAD_FORMAT");
			}
		}
	});

	// The user sends a message to the other users in the lobby
	socket.on('chat message', function (msg){
		if (username != "")
			namespaceLobby.to('lobby').emit('chat message', username+": "+msg);
	});

	// The user is finding a game
	socket.on('find game', function() {
		if (username != "") {
			console.log (username + ' está buscando partida');
			socketMatchmaker = require ('socket.io-client')(matchmakerDir);
			socketMatchmaker.emit ('find game', username);

			socketMatchmaker.on('connect', function () {
				console.log ('User '+username+' added to the matchmaker');
			});

			socketMatchmaker.on('game start', function (worldName, worldDir) {
				console.log ('Game starts for '+ username+' in world '+worldName);
				namespaceLobby.to('lobby').emit('chat message', "[" + username + " ha comenzado una partida]");
				
				addUserToGame (worldDir, worldName, username);

				socket.emit('game start', worldName);
			});
		}
	});

	// The user logs out
	socket.on('logout', function() {
		if (username != "") {
			console.log('User logged out: ' + username);
			namespaceLobby.to('lobby').emit('chat message', "Se ha desconectado " + username);
			delete (userTokens[username]);
		}
	});

	// The user disconnects
	socket.on('disconnect', function() {
		if (username != "") {
			console.log('User disconnected from lobby: ' + username);
		}
	});
});

// Namespace for the users playing in a game match
// * (It would be better and simpler if the player connected to the world_master
// *  directly, it is done like this to match the microservices pattern)
var namespaceMatch = io.of('/match');
namespaceMatch.on('connection', function(socket) {
	var username = "";
	var gameWorld = "";		// The name of the game world where the user is playing (a World Master)
	var socketWorldMaster;	// Socket to communicate with the World Master where the user is playing

	// An user connects to a game match
	socket.on('player connect', function(theUsername, token, theGameWorld) {
		if (username == "") {
			if (theUsername.length >= 4 && theUsername.length <= 12) {
				var theGameMatch = startedGames[theGameWorld];
				console.log('User ' + theUsername + ' tries to connect to the world '+theGameWorld);

				if (typeof theGameMatch === "undefined") {
					socket.emit('user connect', "ERR_BAD_WORLD");
				} else {
					if (theGameMatch.userTokens[theUsername] == token) {
						username = theUsername;
						gameWorld = theGameWorld;
						socket.join('match-'+gameWorld);

						socketWorldMaster = require ('socket.io-client')(startedGames[gameWorld].worldDir+'/player');
						socketWorldMaster.emit ('player connect', username, token);

						socketWorldMaster.on('player connected', function (response) {
							console.log ('User '+username+' to the world '+gameWorld+': '+response);
							socket.emit('player connect', response);
						});

						namespaceMatch.to('match-'+gameWorld).emit('chat message', "[Se ha conectado " + theUsername + " a la partida]");
						socket.emit('user connect', "CONNECTED");
					} else {
						socket.emit('user connect', "ERR_BAD_TOKEN");
					}
				}
			} else {
				socket.emit('user connect', "ERR_BAD_FORMAT");
			}
		}
	});

	// The user sends a message to the other users in a game match
	socket.on('chat message', function (msg){
		if (username != "")
			namespaceMatch.to('match-'+gameWorld).emit('chat message', username+": "+msg);
	});

	// The user is leving the game match
	socket.on('exit match', function() {
		if (username != "") {
			console.log('User left the match: ' + username);
			socketWorldMaster.emit ('exit match');
			socket.leave('match-'+gameWorld);
			namespaceMatch.to('match-'+gameWorld).emit('chat message', "[" + username + " ha salido de la partida]");
			namespaceLobby.to('lobby').emit('chat message', "[" + username + " ha terminado la partida]");

			delete startedGames[gameWorld].userTokens[username];
			startedGames[gameWorld].numPlayers--;
			if (startedGames[gameWorld].numPlayers == 0) {
				delete startedGames[gameWorld];
				console.log('Match finished: ' + gameWorld);
			}
		}
	});

	// The user disconnects
	socket.on('disconnect', function() {
		if (username != "") {
			console.log('User disconnected from match: ' + username);
		}
	});
});

http.listen(port, "0.0.0.0", function(){
	console.log('listening on *:'+port);
});
