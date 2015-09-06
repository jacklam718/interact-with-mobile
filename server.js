var serveStatic = require('serve-static');
var express = require('express');
var ws = require('ws');
var path = require('path');

var PORT = process.env.PORT || 8000,
    SOCK_PORT = process.env.SOCK_PORT || 8001,
    app,
    server,
    websockServer;

app = express();
// http server
server = app.listen(PORT);

// set static files
app.use(serveStatic(__dirname + '/'));
app.use(serveStatic(__dirname + '/vendor'));
app.use(serveStatic(__dirname + '/public'));

app.use('/', function(req, res, next) {
  var url = /[a-z]+/.exec(req.url);
  if (url === null) {
    res.sendFile(path.join(__dirname, './index.html'));
  }
  next();
});

app.use('/client', function(req, res, next) {
  console.log('/client');
  var url = /[a-z]+/.exec(req.url)[0];

  switch (url) {
    case 'orientation':
      res.sendFile(path.join(__dirname, 'public/client/orientation/orientation.html'));
      break;
  }
});


app.use('/server', function(req, res, next) {
  var url = /[a-z]+/.exec(req.url)[0];

  switch (url) {
    case 'orientation':
      res.sendFile(path.join(__dirname, 'public/server/orientation/orientation.html'));
      break;
  }
});

// websocket server
var websockServer = new ws.createServer({'httpServer': server, 'port': SOCK_PORT}, function(conn) {
  console.log('new connection');
  conn.on('text', function (str) {
    console.log('Received ' + str);
    broadcast(str);
  });

  conn.on('close', function(code, reason) {
    console.log('Connection closed');
  });
});

// websockServer.listen(SOCK_PORT);

function broadcast(msg) {
  websockServer.connections.forEach(function(conn) {
    conn.sendText(msg);
  });
};

console.log('Start listen; ' + 'http server port: ' + PORT + ', ' + 'websocket server port: ' + SOCK_PORT );
