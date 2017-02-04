// Service that represents a game server, where the users can play together
// (it's really simple right now, just a demonstration)
//
// Use: node world_master
//
// Required environment variables: PORT (the port), WORLD_NAME (the name of the
// world), MY_DIR (the visible direction of this service (which will be sent
// to the Matchmaker, and sent again to the Master Server, in order to be able
// to connect the Master Server and this service) and MATCHMAKER_DIR (the direction
// of the Matchmaker)

var app = require('express')();
var url = require('url');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT;
var worldName = process.env.WORLD_NAME;
var myDir = process.env.MY_DIR;
var matchmakerDir = process.env.MATCHMAKER_DIR;

var matchStarted = false;
var playerNames;
var playerTokens;
var numPlayers;

var socketMatchmaker = require ('socket.io-client')(matchmakerDir+'/connect-game-world');
socketMatchmaker.emit ('world_master_available', worldName, myDir+":"+port);

var namespaceMasterServer = io.of('/master-server');
namespaceMasterServer.on('connection', function(socket){
	socket.on('game start', function (userTokens) {
		playerNames = Object.keys (userTokens);
		playerTokens = userTokens;
		numPlayers = playerNames.length;
		matchStarted = true;

		console.log ('Starting match. The players are:');
		
		for (var p = 0; p < numPlayers; p++) {
			var name = playerNames[p];
			console.log (name+' with token "'+playerTokens[name]+'"');
		}

		socketMatchmaker.emit ('world_master_not_available');
	});
});

var namespacePlayers = io.of('/player');
namespacePlayers.on('connection', function (socket, client) {
	var username = "";

	socket.on('player connect', function(theUsername, token) {
		if (username == "") {
			if (theUsername.length >= 4 && theUsername.length <= 12) {
				if (playerTokens[theUsername] == token) {
					console.log('User ' + theUsername + ' connects to the world');

					username = theUsername;
					socket.join('world');
				
					socket.emit('player connected', "CONNECTED");
				} else {
					console.log('fuuu '+theUsername+', '+token);
					socket.emit('user connect', "ERR_BAD_TOKEN");
				}
			} else {
				socket.emit('user connect', "ERR_BAD_FORMAT");
			}
		}
	});

	socket.on('exit match', function() {
		if (username != "") {
			console.log('User left the match: ' + username);

			delete playerTokens[username]
			numPlayers--;

			if (numPlayers == 0) {
				matchStarted = false;
				console.log('Match finished');

				socketMatchmaker.emit ('world_master_available', worldName, port);
			}
		}
	});
});

http.listen(port, function(){
	console.log ('listening on *:'+port);
});
