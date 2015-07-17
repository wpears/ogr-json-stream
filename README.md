Stream the GeoJSON feature collection output of ogr2ogr as individual features.

    spawn('ogr2ogr', ['-f, 'GeoJSON' '/vsistdout/', 'somefile.shp'])
      .pipe(OgrJsonStream())
      .on('data', function(feature){
        //individual features here, as objects
       });
    
