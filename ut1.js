var express = require('express'),
app = express(),
path = require('path'),
async = require('async');
restvlocity= require('./restuttool');
bodyParser = require("body-parser");//body parser for express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


function getAccessToken(callback){
	console.log('Tying to connect to Salesforce Org');
	restvlocity.getAccessToken(username,passwor,bundlename,objname);
}

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, './uttool.html'));
});

app.post('/show_ut_results', function (req, res) {
	
	for (i in req.body){
		i=JSON.parse(i);
		username=i.username,
		passwor=i.password,
		bundlename=i.selectedName,
		objname=i.objname;
	}
	 async.series([getAccessToken],
		function (err,results){
			if(err){console.log('Error'+err);}
			console.log(results);
		}
	); 
	//getAccessToken(username,passwor).then(getObjectDetails(bundlename,objname));
	res.send('tested');
	res.end();
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});