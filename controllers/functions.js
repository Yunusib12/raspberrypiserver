const path = require('path');
const PiCamera = require("pi-camera");


const functions = {
    takePic: () => {

        const camera = new PiCamera({
            mode: "photo",
            width: 640,
            height: 480,
            nopreview: true,
            exposure: "off",
            rotation: 0
        });

        const timestamp = new Date().getTime();
        const pathToSnap = path.join(__dirname, '..', '/public/img/snapshot');

        camera.config.output = `${pathToSnap}/${timestamp}.jpg`;
        camera
            .snap()
            .then((result) => {
                //let front end know it needs to update
                io.sockets.emit('updatePic', `${pathToSnap}/${timestamp}.jpg`);
                readFolder();
            })
            .catch(err => {
                console.log(err);
            });
    }
};


module.exports = functions;