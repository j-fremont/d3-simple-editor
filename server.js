'use strict';

const app = require('express')();
const cors = require('cors');
const http = require('http').createServer(app);
const parser = require("body-parser");
const fs = require('fs');
const config = require('./src/config');

app.use(cors());

//Here we are configuring express to use body-parser as middle-ware.
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

app.post('/save/:name', (request, response) => {
  var name = request.param("name");
  const json = JSON.stringify(request.body);
  fs.writeFile("./data/" + name + ".json", json, (error) => {
    if (error) {
      console.log(error);
    }
  });
});

app.get('/load/:name', (request, response) => {
  var name = request.param("name");
  fs.readFile("./data/" + name + ".json", (error, data) => {
    if (error) throw error;
    response.send(JSON.parse(data));
  });
});

app.get('/list', (request, response) => {
  fs.readdir("./data/", (err, files) => {
    const names = files.map(file => file.split('.')[0]);
      response.send(names);
  });
});

http.listen(config.server.port, () => {
  console.log('listening on *:' + config.server.port);
});
