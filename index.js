'use strict';
var Transform = require('readable-stream/transform');
var inherits = require('inherits');

inherits(OgrJsonStream, Transform);

var mainSplit = / },?\n/;
var featureSplit = /"features": \[\n/;
var reform = ' }';
var nanValue= /: NaN,/g;
var nullValue= ': null,';
var readableObj = {readableObjectMode: true};
var stringifyObj = {stringify: 1};

function OgrJsonStream(obj){
  if(!(this instanceof OgrJsonStream)) return new OgrJsonStream(obj);
  if(!obj) obj = readableObj;
  if(!obj.stringify) obj.readableObjectMode = true;

  Transform.call(this, obj);
  this.leftovers = '';
  this.beforeFeatures = 1;
  this.stringify = obj.stringify;
}

OgrJsonStream.stringify = function(obj){
  if(!obj) obj = stringifyObj;
  obj.stringify = 1;
  return new OgrJsonStream(obj);
};

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
    var output;
    for(var i=0; i < len; i++){
      output = split[i] + reform;

      if(nanValue.test(output)){
        output = output.replace(nanValue, nullValue);
      }

      if(!this.stringify){
        try{
          output = JSON.parse(output);
        }catch(e){
          return cb(e);
        }
      }
      this.push(output);
    }
    this.leftovers = split[i];
  }
  cb(null);
};

OgrJsonStream.prototype._flush = function(cb){
  var split = this.leftovers.split(mainSplit);
  var len = split.length - 1;
  var output;
  for(var i=0; i < len; i++){
    output = split[i] + reform;

    if(nanValue.test(output)){
      output = output.replace(nanValue, nullValue);
    }

    if(!this.stringify){
      try{
        output = JSON.parse(output);
      }catch(e){
        return cb(e);
      }
    }
    this.push(output);
  }
  cb(null);
}

module.exports = OgrJsonStream;
