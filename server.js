var express = require('express'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    app = express(),
    formidable = require('formidable'),
    util = require('util'),
    fs = require('fs');




var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'filmroot',
   database : 'filmlist'
 });

connection.connect(function(err){
 if(!err) {
     console.log("Database is connected ... \n\n");  
 } else {
     console.log("Error connecting database ... \n\n");  
 }
 });


app.use(bodyParser());

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname));

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
 
app.post('/write', savedata);

function savedata(req, res) {
  var data = req.body;

  console.log('Got a POST request');
  /*var year = req.body.year,
  	  film = req.body.film,
  	  author = req,body.author;*/

  connection.query('INSERT INTO myfilms SET ?', data, function (error, results, fields) {
  // error will be an Error if one occurred during the query
  // results will contain the results of the query
  // fields will contain information about the returned results fields (if any)
 /* var data = JSON.stringify(results);
  res.send(req.body.film);*/
  console.log("WRITE" + req.body);
  console.log(data);
});
};
  

app.post('/give', backfilms);

function backfilms(req, res) {
	console.log('Data received from Db:\n');

  connection.query('SELECT * FROM myfilms', function(err,rows){
  
  var back = JSON.stringify(rows);
  res.send(back);
  console.log(rows);
});
};


app.post('/delete', delfilms);

function delfilms(req, res) {
  console.log('Data deleted from Db:\n');
  var id = req.body.idfilm;
  console.log(id);
  connection.query('DELETE FROM myfilms WHERE idfilm = ?',[id], function(err,rows){
  
  
  console.log("film deleted");
});
};




app.post('/getfile', savelist);

function savelist(req, res) {
  
  var form = new formidable.IncomingForm();
    
    var arr = [];
    var arrnew = [];

    form.keepExtensions = false;
    form.type = 'multipart/form-data';
    form.multiples = true;

    form.on('error', function(err) {
          console.log(err);
      });

    console.log(form);

    form.on('end', function(fields, files) {
      console.log('end')
    });

      form.parse(req, function(err, fields, files) {
        

        fs.readFile(files.ava.path, function (err, data) {
        if (err) throw err;
        
        var text = data.toString();
        
        // Разбивка файла по строкам
        var lines = text.split(/\n+/);
        console.log("1:" + lines);

         lines.forEach(function(line) {
              var results = {};
              var parts = line.split(': ');
              var letter = parts[0];
              var count = parts[1];

              if(!results[letter]) {
                results[letter] = 0;
         }

         results[letter] = count;
         arr.push(results);

       });
          arr.pop();
         
          var i = 0;
          
          while (i < arr.length) {
            
            var obj = {};

            obj.idfilm = Date.now() + i;
            obj.year = arr[i+1]['Release Year'];
            obj.film = arr[i]['Title'];
            obj.author = arr[i+3]['Stars'];
            obj.format = arr[i+2]['Format'];
            

            arrnew.push(obj);
              i += 4;
         };

         var back = JSON.stringify(arrnew);
                 
        console.log(arrnew);

        var e = 0;

         while (e < arrnew.length) {
        
           var data = arrnew[e];
           console.log("FILEOBJ" + data);
           connection.query('INSERT INTO myfilms SET ?', data, function (error, results, fields) {
  
           console.log("WRITE" + data);
           console.log(data);
        });


        e += 1;
      };
       
      });
          
      

        console.log(err, fields, files)
        
      });

      

       res.end();
};