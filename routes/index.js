import express from 'express';

const routes = express.Router();


routes
    .get('/', (req, res) => {
        res.send({ msg: "Raspberry Pi Server" });
    })



export default routes;