var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PwmDriver = require('adafruit-i2c-pwm-driver');

var pwm = new PwmDriver(0x40, '/dev/i2c-1'); // HEX address of i2c and rev2 rpi
pwm.setPWMFreq(60); // set Frequency to 60 Hz
var steeringChannel = 0,
	throttleChanel = 1;

var mapToDegree = function(degree) {
	var servoMin = 200, 
    servoMax = 650;
    totalDegrees = 180
    pulseDiff = servoMax - servoMin
    if (degree == 0)
		return servoMin 
    else
		return pulseDiff / totalDegrees * degree + servoMin;
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('orientation', function(orientation) {
  	console.log(JSON.stringify(orientation));
  	pwm.setPWM(steeringChannel, 0, mapToDegree(orientation.beta));
  	pwm.setPWM(throttleChanel, 0, orientation.gamma);
    // io.emit('chat message', msg);
  });

  socket.on('disconnect', function() {
  	console.log('a user disconnected');
  })
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
