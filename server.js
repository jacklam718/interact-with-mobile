var serveStatic = require('serve-static');
var http = require('http');
var express = require('express');
var ws = require('ws').Server;
var path = require('path');

var PORT = process.env.PORT || 8000,
    SOCK_PORT = process.env.SOCK_PORT || 8001,
    app,
    server;

app = express();

// http server
server = app.listen(PORT);
// websocket server
websockServer = new ws({'server': server});

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

websockServer.on('connection', function(ws) {
  console.log('new connection');

  ws.on('message', function (str) {
    if (! process.env.PRODUCTION) console.log('Received ' + str);
    broadcast(str);
  });

  ws.on('close', function(code, reason) {
    console.log('Connection closed');
  });

  function broadcast(msg) {
    websockServer.clients.forEach(function(conn) {
      conn.send(msg);
    });
  };
});

console.log('Start listen; ' + 'http server port: ' + PORT + ', ' + 'websocket server port: ' + PORT );
