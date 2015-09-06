var serveStatic = require('serve-static');
var express = require('express');
var ws = require('nodejs-websocket');
var path = require('path');

var PORT = process.env.PORT || 8000,
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
var websockServer = ws.createServer(function(conn) {
  console.log('new connection');
  conn.on('text', function (str) {
    console.log('Received ' + str);
    broadcast(str);
  });

  conn.on('close', function(code, reason) {
    console.log('Connection closed');
  });
});

// secure
server.listen(8443);
// insecure
server.listen(8001);

function broadcast(msg) {
  server.connections.forEach(function(conn) {
    conn.sendText(msg);
  });
};

console.log('Start listen: ' + PORT + '/' + 8443 + ' & ' + 8001 );
