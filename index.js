'use strict';
var Transform = require('readable-stream/transform');
var inherits = require('inherits');

inherits(OgrJsonStream, Transform);

var mainSplit = / },?\n/;
var featureSplit = /"features": \[\n/;
var reform = ' }';
var readableObj = {readableObjectMode: true};

function OgrJsonStream(obj){
  if(!(this instanceof OgrJsonStream)) return new OgrJsonStream(obj);
  if(!obj) obj = readableObj;
  else obj.readableObjectMode = true;
  Transform.call(this, obj);
  this.leftovers = '';
  this.beforeFeatures = 1;
}

OgrJsonStream.prototype._transform = function(chunk, enc, cb){
  var split;
  chunk = this.leftovers + chunk;
  if(this.beforeFeatures){
    split = chunk.split(featureSplit);
    //Not yet to features
    if(split.length === 1){
      this.leftovers += chunk;
    }else{
      this.beforeFeatures = 0;
      this.leftovers = split[1];
    }
  }else{
    split = chunk.split(mainSplit);
    var len = split.length - 1;
    var json;
    for(var i=0; i < len; i++){
      try{
        json = JSON.parse(split[i] + reform);
      }catch(e){
        return cb(e);
      }
      this.push(json);
    }
    this.leftovers = split[i];
  }
  cb(null);
};

OgrJsonStream.prototype._flush = function(cb){
  var split = this.leftovers.split(mainSplit);
  var len = split.length - 1;
  var json;
  for(var i=0; i < len; i++){
    try{
      json = JSON.parse(split[i] + reform);
    }catch(e){
      return cb(e);
    }
    this.push(json);
  }
  cb(null);
}

module.exports = OgrJsonStream;
