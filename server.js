// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path, { dirname } from "path";
// import routes from "./routes";
// import bodyparser from "body-parser";
// import { fileURLToPath } from 'url';
// import { cloudinaryConfig } from "./config/cloudinaryConfig";

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4400;
const CONNECTION_STRING = "mongodb://localhost:27017/Ndembele";
// const CONNECTION_STRING = "mongodb+srv://meedoMontana:MontanaMongo01@myafricequipdb.rsxoiac.mongodb.net/Ndembele";
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename);

const path = require('path');
const routes = require('./routes');
const bodyparser = require('body-parser');


mongoose.set("strictQuery", false);

mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('open', () => console.log('Mongo Running'));
mongoose.connection.on('error', (err) => console.log(err)); app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("this is index route for endpoints, welcome to your NDEMBELE project endpoints");
});

app.listen(PORT);
console.log('App is running on port:' + PORT);
