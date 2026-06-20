const express = require('express');
const cors = require("cors");

const app = express();

const routes = require('./routes/index');

app.use(cors({
    origin: "*"
}));

app.use(express.json());

app.post('/test', (req, res) => {
    console.log(req.body);

    res.json({
        success: true,
        message: 'Data Recieved',
        data: req.body
    });
});

const errorMiddleware = require("./middlewares/error.middleware");

app.use('/api', routes);

app.use(errorMiddleware);

module.exports = app;