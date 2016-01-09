/**
 * Created by borm on 08.01.16.
 */
var express = require('express')
  , app = express();
var request = require('request');

/**
 * Static
 */
app.use('/static', express.static('static'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/get/stats', function (req, res) {
  request.get('http://adbluedigital.com/send/stats.csv', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    }
  });
});

/**
 * Start Server
 * @type {http.Server}
 */
var server = app.listen(8001, '127.0.0.1', ()=> {
  var address = server.address();
  var host = address.address;
  var port = address.port;

  host = host === '::' ? '127.0.0.1' : host;
  console.log( 'Server listening at http://%s:%s', host, port )
});