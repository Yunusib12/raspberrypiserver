const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Gpio = require('onoff').Gpio;
const PiCamera = require("pi-camera");
const sensor = require("node-dht-sensor");
const path = require('path');
const fs = require('fs');
const LCD = require('lcd');
const axios = require('axios');
const cors = require('cors');
const currentDirectory = path.join(__dirname, 'public/img/snapshot');


const camera = new PiCamera({
  mode: "photo",
  width: 640,
  height: 480,
  nopreview: true,
  exposure: "off",
  rotation: 0
});

const pins = {
  led: new Gpio(11, 'out'),
  lamp: new Gpio(27, 'out')
}

//LCD
const lcd = new LCD({
  rs: 2,
  e: 3,
  data: [],
  backlight: 6,
  cols: 16,
  rows: 2
})

lcd.on('ready', _ => {
  lcd.setCursor(0, 0);
  lcd.print("Hello", (err) => {
    if (err) {
      throw err;
    }
  })
});

//Cors
app.use(cors());

//Set Static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('./js', express.static(path.join(__dirname, './node_modules/socket.io-client/dist/')));


app.get('/', (req, res) => {
  res.sendFile('index.html');
});


app.get('/temp', (req, res) => {

  sensor.read(11, 17, function (err, temperature, humidity) {
    if (!err) {
      // console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
      res.json({ 'Celsius': temperature, 'Humidity': humidity });
    }
  });
});

io.on('connection', (socket) => {
  //send to client (index.html) when connected
  socket.emit('updateClient', update());
  //received from client (index.html)
  socket.on('updateServer', pin => {
    togglePin(pin);
  });

  //CAMERA
  socket.on('takePic', () => {
    takePic();

  });

  //Get all the snapshot
  socket.on('snapshot', (snapArray) => {
    readFolder();
  });

  //Delete a snap on the server
  socket.on("deletesnap", (snapFileName) => {
    deleteSnapShot(snapFileName);
  });
});

//CAMERA
function takePic(value) {

  const timestamp = new Date().getTime();
  camera.config.output = `${__dirname}/public/img/snapshot/${timestamp}.jpg`;
  camera
    .snap()
    .then((result) => {
      //let front end know it needs to update
      io.sockets.emit('updatePic', `./img/snapshot/${timestamp}.jpg`);
      readFolder();
    })
    .catch(err => {
      console.log(err);
    });
}

function togglePin(pin) {
  pins[pin].writeSync(1 - pins[pin].readSync());
  io.sockets.emit('updateClient', update());
}

function update() {
  return {
    led: pins.led.readSync(),
    lamp: pins.lamp.readSync()
  }
}

//Reading all file in the folder
function readFolder() {

  let snapShotArray = [];

  fs.readdir(currentDirectory, (err, files) => {

    if (err)
      console.log(err);
    else {
      files.map(file => {
        snapShotArray.push(file);
      })
      io.sockets.emit('folderRead', snapShotArray.reverse());
    }
  });
};


//Delete a snapshot in the folder
function deleteSnapShot(snapFileName) {

  console.log(snapFileName);

  fs.unlink(`${currentDirectory}/${snapFileName}`, (err) => {
    if (err) throw err

    console.log("Successfully deleted the file");
    readFolder();
  })
}


http.listen(3000, () => {
  console.log('listening on port 3000');
});