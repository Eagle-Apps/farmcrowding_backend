const express = require('express');
const app = express.Router();

require('./endpoints/Users')(app);
require('./endpoints/Category')(app);
require('./endpoints/Farms')(app);
require('./endpoints/Investment')(app);
require('./endpoints/Supply')(app);
require('./endpoints/Forum')(app);

module.exports = app;