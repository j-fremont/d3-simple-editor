'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/', (request, response) => {

  console.log(response.body);

  /*
  fs.readFile("state.json", (error, data) => {
    if (error) throw error;
    res.send(JSON.parse(data));
  });*/


});

module.exports = router;
