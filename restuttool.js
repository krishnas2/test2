var https=require('https'),
querystring=require('querystring'),
async = require('async'),
access_token='',
instance_url='',
squery='/services/data/v41.0/query/?q=';


var getAccessToken=(v1,v2,v3,v4)=>{
	console.log('came here1');
	var headers={
		'Content-Type':'application/json'
	},
	data={
		'grant_type':'password',
		'client_id':'3MVG9d8..z.hDcPKTWgLm3QE90fGM_hp5S940koYKAgleIpmFswz4NluqsvKeq8qQnE_N8BYqRJ8CtlkP_iay',
		'client_secret':'3709305748321797553',
		'username':v1,
		'password':v2
	},
	host='login.salesforce.com',
	endpoint = '/services/oauth2/token?'+querystring.stringify(data);
	console.log(data['client_id'],data['username'],data['password']);
	var options={
		host:host,
		port:null,
		path:endpoint,
		method:'POST',
		headers:headers
	};
	console.log('came hhh');
	var req=https.request(options,function(res){
		res.setEncoding('utf-8');
		var responseString='';
		res.on('data',function(respObj){
			responseString+=respObj;
		});
		res.on('end',function(){
			console.log('rstring',responseString);
			var responseObject=JSON.parse(responseString);
			console.log(responseObject);
			access_token=responseObject.token_type+' '+responseObject.access_token;
			instance_url=responseObject.instance_url.split('/')[2];
			if(access_token)console.log('connection'+'established');
			getObjectDetails(v3,v4);
		});
		
	});
	req.on('error',(e)=>{
		console.log('problem'+e);
	});
	req.end();
};

var ObjectMapper=(query,msg)=>{
	var headers={
		'Content-Type':'application/json',
		'Authorization':access_token
	};
	var newOptions={
		host:instance_url,
		port:null,
		path:squery+query,
		method:'GET',
		headers:headers
	};
	console.log('query',instance_url,newOptions.path);
	var qryObj=https.request(newOptions,function(result){
		result.setEncoding('utf-8');
		var responseString1='';
		result.on('data',function(respObj){
			responseString1+=respObj;
		});
		result.on('end',function(){
			var resp=JSON.parse(responseString1);
			console.log(resp);
			if(resp.done)
				console.log(msg);
			
		});
	});
	qryObj.on('error',(e)=>{
		console.log('problem',e);
		
	});
	qryObj.end();
};

var getObjectDetails=(bundle,name)=>{
	console.log(bundle,name);
	if (bundle==="DataRaptor"){
		ExtractDRqueries(name);
	}
}

var ExtractDRqueries=(name)=>{
	q1="select+Id+from+vlocity_cmt__DRBundle__c+where+Name+=+'"+name+"'";//Check DR is created
	ObjectMapper(q1,'DR Exists');
}

module.exports.getAccessToken=getAccessToken;