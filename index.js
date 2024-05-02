// const express = require('express');
// const webPush = require('web-push');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { router } from './router/index.js';
import error from './middle/error.js';

const app = express();

app.use(cors({
    credentials: true,
    // origin: process.env.CLIENT_URL
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api', router);
app.use(error);

(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/data");
    app.listen(5454);
})();