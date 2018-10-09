const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
var items = {};

Promise.promisifyAll(fs);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id)=> {
    if (err) {
      throw (err);
    } else {     
      items[id] = text;
      fs.writeFile(__dirname + '/../test/testData/' + id + '.txt', text, (err)=> {
        if (err) {
          throw ('create error');
        } else {
          callback(null, {text, id});
        } 
      });
    }
  });
};

exports.readOne = (id, callback) => {
  //var text = items[id];
  fs.readdir(__dirname + '/../test/testData', (err, fileNames) => {
    fs.readFile(__dirname + '/../test/testData/' + id + '.txt', (err, text) => {
      if (err) {
        callback(err, 0);
      } else {    
        callback(null, {
          id: id,
          text: text.toString()
        });       
      }
    });        
  }); 
};

var readOneAsync = Promise.promisify(exports.readOne);
  
exports.readAll = (callback) => {
  var data = [];    
  var promises = [];

  fs.readdir(__dirname + '/../test/testData', (err, fileNames) => {
    Promise.all(fileNames.map( (fileName) => {
      return readOneAsync(fileName.slice(0,fileName.length - 4));})
    )
    .then((objs) => {
      objs.forEach( (obj) => {
        data.push({
          'id': obj.id,
          'text': obj.text
        });   
      });
      callback(null,data);
    });
  }); 
};


  
exports.update = (id, text, callback) => {
  exports.readOne(id, (err) => {
    if (!err) {
      fs.writeFile(__dirname + '/../test/testData/' + id + '.txt', text, (err) => {
        callback(err, text);
      });
    } else {
      callback(err, 0);
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(__dirname + '/../test/testData/' + id + '.txt', (err) => {
    if (err) {
      callback(err);
    } else {      
      callback(null);
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
