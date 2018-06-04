var express = require('express'),
app = express(),
path = require('path');
var async = require('async');
restvlocity= require('./restuttool');
bodyParser = require("body-parser");//body parser for express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


getAccessToken=(callback)=>{
	console.log('Tying to connect to Salesforce Org');
	restvlocity.getAccessToken(username,passwor,bundlename,objname,clientid,clientsecret,env,callback);
}

getObjectDetails=(callback)=>{
	console.log('obj list');
	restvlocity.getObjectDetails(bundlename,objname);
}

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, './uttool.html'));
});

app.post('/show_ut_results', function (req, res) {
	
	for (i in req.body){
		i=JSON.parse(i);
		username=i.username,
		passwor=i.password,
		clientid=i.clientid,
		clientsecret=i.clientsecret,
		env=i.env,
		bundlename=i.selectedName,
		objname=i.objname;
	}
	 async.series([getAccessToken,getObjectDetails],
			function (a,err,results){
				console.log('ad',a);
				if(err){console.log('Error'+err);}
				console.log('results',results);
			}
		)
	//getAccessToken(username,passwor).then(getObjectDetails(bundlename,objname));
	res.send('cool');
	res.end()
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});