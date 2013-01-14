var express = require('express')
	, app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, hbs = require('express-hbs')
	, RedisStore = require('socket.io/lib/stores/redis')
	, redis = require('socket.io/node_modules/redis')
	, pub = redis.createClient(9640, "slimehead.redistogo.com")
	, sub = redis.createClient(9640, "slimehead.redistogo.com")
	, store = redis.createClient(9640, "slimehead.redistogo.com")
	, users = {};

	var redisPW = "29d8ef9d6aac3c1f549467a43e82def8";

	pub.auth(redisPW, function (err) { if (err) throw err; });
	sub.auth(redisPW, function (err) { if (err) throw err; });
	store.auth(redisPW, function (err) { if (err) throw err; });

	io.set('store', new RedisStore({
		 // redis : redis, 
		  redisPub: pub,
		  redisSub: sub,
		  redisClient: store
	}));


//io.set('log level', 1);
app.engine('hbs', hbs.express3({partialsDir: __dirname + '/views/partials'}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


var port;
switch(process.env.NODE_ENV) {
	case "production":
		port = 80;
		break;
	default: 
		port = 82;
		break;
	}

server.listen(port);

io.sockets.on('connection', function (client) {
	
	client.on('getusers', function (data) {
		client.emit('userlist', JSON.stringify(users));
	});

	client.on('join', function (user) {
		u = JSON.parse(user);
		u.message = "adduser";
		client.join(u.room);
		//setTimeout(1000)
		users[u.uid] = u;
		//client.broadcast.to(u.room).json.send(JSON.stringify(u));
		client.broadcast.to(u.room).emit('adduser' , user);
		client.emit('adduser', user);
	});

	client.on('leave', function (uid) {
		io.clients.in(users[uid].room).emit('removeuser', uid);
			//client.broadcast.to(Room).json.send({ msg: "Se conecto al room: " + nick.room, nick : nick });
		client.leave(users[uid].room);
		users[uid] = null;
	 });

	client.on('mousedown', function (drawevent) {
		//get room from userlist
		client.broadcast.to(drawevent.room).emit('mousedown' , drawevent);
	});

	client.on('mouseup', function (drawevent) {

		client.broadcast.to(drawevent.room).emit('mouseup' , drawevent);
	});

	client.on('mousemove', function (drawevent) {

		client.broadcast.to(drawevent.room).emit('mousemove' , drawevent);
	});

	client.on('changebrushcolor', function (colorinfo) {

		users[colorinfo.uid].brushData.brushColor = colorinfo.c;
		client.broadcast.to(users[colorinfo.uid].room).emit('changebrushcolor', colorinfo);
	})

	client.on('changebrushwidth', function (widthinfo) {

		users[widthinfo.uid].brushData.brushWidth = widthinfo.w;
		client.broadcast.to(users[widthinfo.uid].room).emit('changebrushwidth', widthinfo);
	})
});
