'use strict';

const app = require('express')();
const cors = require('cors');
const http = require('http').createServer(app);
const parser = require("body-parser");
const fs = require('fs');
const config = require('./src/config');
const mongoose = require('mongoose');

mongoose.connect('mongodb://192.168.1.10/diagrams', {useNewUrlParser: true});

var db = mongoose.connection;

var Schema = mongoose.Schema;

var diagram = new Schema({
  name: { type: String , unique: true, required: true },
  nodes: [{
    id: Number,
    x: Number,
    y: Number,
    text: String
  }],
  links: [{
    id: Number,
    source: {
      id: Number
    },
    target: {
      id: Number
    }
  }]
});

var Diagram = mongoose.model('Diagram', diagram);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connected!');
});

app.use(cors());

//Here we are configuring express to use body-parser as middle-ware.
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

app.post('/save/:name', (request, response) => {
  var name = request.param("name");

  var document = new Diagram();

  document.name = name;
  document.nodes = [...request.body.nodes];
  document.links = [...request.body.links];

  document.save().then(() => {
    console.log('saving...')
  }).then(() => {
    console.log('document saved')
  }, (error) => {
    console.log('error')
  });

  /*const json = JSON.stringify(request.body);
  fs.writeFile(name + ".json", json, (error) => {
    if (error) {
      console.log(error);
    }
  });*/
});

app.get('/load/:name', (request, response) => {
  var name = request.param("name");
  Diagram.find({name: name}).exec((error, docs) => {
    response.send({
      nodes: [...docs[0].nodes],
      links: [...docs[0].links]
    })
  });
  /*fs.readFile(name + ".json", (error, data) => {
    if (error) throw error;
    response.send(JSON.parse(data));
  });*/
});

/*app.delete('/', (request, response) => {
  fs.unlink("save.json", (error) => {
    if (error) throw error;
  });
});*/

app.get('/list', (request, response) => {
  Diagram.find({}).select('name').exec((error, docs) => {
    const names = docs.map(doc => doc.name);
    console.log(names);
    response.send(names);
  });
});

http.listen(config.server.port, () => {
  console.log('listening on *:' + config.server.port);
});
