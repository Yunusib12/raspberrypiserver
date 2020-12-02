import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;


//Parsing the body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Set Static folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/public")));



//Routes 
app.use(routes);


//Start the Server
app.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));
























// import * as GPIO from 'onoff';

// GPIO.Gpio;

// const app = express();
// const PORT = process.env.PORT || 3000;
// const LED = new GPIO(17, 'out');


// LED.readSync()