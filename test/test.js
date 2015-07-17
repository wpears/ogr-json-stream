var fs = require('fs');
var Transform = require('readable-stream/transform');
var test = require('tape');
var streamStats = require('stream-stats');
var pump = require('pump');

var OgrJsonStream = require('../index');

test('Usage', function(t){
  t.plan(2);
  var jsonStream = OgrJsonStream();
  t.ok(jsonStream instanceof Transform, 'OgrJsonStream is a Transform stream');
  t.ok(jsonStream._readableState.objectMode, 'Spits out objects');
});

test('Operations', function(t){
  t.plan(5);

  var arr = [
    {file: 'test/data/normal.json', count: 4, err: 0},
    {file: 'test/data/nullgeo.json', count: 6, err: 0},
    {file: 'test/data/error.json', count: 2, err: 1}
  ]

  arr.forEach(function(v){
    var stats = streamStats.obj();
    var parser = OgrJsonStream();

    pump(fs.createReadStream(v.file),
      parser,
      stats,
      stats.sink(),
      function(err){
        if(err){
          if(v.err) t.pass('Error on bad json');
          else t.fail('Error on good json');
        }else{
          var result = stats.getResult();
          t.pass('Reads valid json');
          t.equal(result.len, v.count, 'Reads all rows of '+ v.file);
        }
      }
    );
  });
});
