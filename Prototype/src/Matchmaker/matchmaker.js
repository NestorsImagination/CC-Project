// Service that tracks the World Masters and accept users finding a game, asking
// the Master Server to start a game when there are enough users and World Masters
//
// Use: node matchmaker
//
// Required environment variables: PORT (the port) and PLAYERS_PER_MATCH (the 
// number of players in a game match)

var app = require('express')();
var url = require("url");
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT;
var playersPerMatch = process.env.PLAYERS_PER_MATCH;

var gameWorlds = {}

// The Master Server asks the Matchmaker to find a game for an user
io.on('connection', function (socket, client) {
	// Tries to find a game for the user and keeps trying if there is not enough World Masters
	function tryToConnectToGameWorld (username) {
		console.log ('Finding game for: '+username);

		var worldFound = false;
		for (var w = 0, worlds = Object.keys (gameWorlds), numWorlds = worlds.length; (!worldFound) && (w < numWorlds); w++) {
			theWorld = gameWorlds[worlds[w]];

			if ((theWorld.available) && (theWorld.numPlayers < playersPerMatch)) {
				worldFound=true;
				theWorld.numPlayers++;
				socket.join (worlds[w]);
				console.log ('User '+username+' is going to play in the world '+worlds[w]);

				if (theWorld.numPlayers==playersPerMatch) {
					console.log ('Game starts in world '+ worlds[w]);
					io.to(worlds[w]).emit('game start', worlds[w], theWorld.dir);
					socket.leave (worlds[w]);
				}
			}
		}

		if (!worldFound) {
			setTimeout(tryToConnectToGameWorld, 3000, username);
		}
	}

	// The Master Server asks the Matchmaker to find a game for an user
	socket.on('find game', function (username) {
		tryToConnectToGameWorld (username);
	});
});

// Namespace for the World Masters (so the Matchmaker can track them)
var namespaceGameWorld = io.of('/connect-game-world');
namespaceGameWorld.on('connection', function(socket){
	var worldName = "";

	// A World Master is available
	socket.on('world_master_available', function (theWorldName, theDir) {
		socket.emit ('bien');
		// The World Master is new
		if (worldName == "") {
			worldName = theWorldName;
			gameWorlds[worldName] = {dir:theDir, available:true, numPlayers:0};
			console.log ('Game world added: '+worldName);
		// The World Master was already tracked (it just finished a game match so it's free now)
		} else {
			gameWorlds[worldName].available = true;
			gameWorlds[worldName].numPlayers = 0;
			console.log ('Game world available: '+worldName);
		}
	});

	// A World Master is no longer available (a match has started in it)
	socket.on('world_master_not_available', function () {
		if (worldName != "") {
			gameWorlds[worldName].available = false;
			console.log ('Game world not available: '+worldName);
		}
	});

	// A World Master has been disconnected
	socket.on('disconnect', function() {
		if (worldName != "") {
			delete gameWorlds[worldName];
			console.log('Game world disconnected: '+worldName);
		}
	});
});

http.listen(port, function(){
	console.log ('listening on *:'+port);
});
