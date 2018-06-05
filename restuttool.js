var https=require('https'),
querystring=require('querystring'),
async = require('async'),
access_token='',
instance_url='',
squery='/services/data/v41.0/query/?q=',
fs = require('fs');



var getAccessToken=(v1,v2,v3,v4,v5,v6,v7,callback)=>{
	console.log('came here1');
	var headers={
		'Content-Type':'application/json'
	},
	data={
		'grant_type':'password',
		'client_id':v5,
		'client_secret':v6,
		'username':v1,
		'password':v2
	},
	host=v7=="Production"?'login.salesforce.com':'test.salesforce.com',
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
			try{
			console.log('rstring',responseString);
			var responseObject=JSON.parse(responseString);
			//console.log(responseObject);
			access_token=responseObject.token_type+' '+responseObject.access_token;
			instance_url=responseObject.instance_url.split('/')[2];
			if(access_token)console.log('connection'+'established');
			//getObjectDetails(v3,v4);
			callback();
			}
			catch(e){
				console.log('error',e);
			}
		});
		
	});
	req.on('error',(e)=>{
		console.log('problem'+e);
	});
	req.end();
};

var RestCallMapper=(query,msg,opt)=>{
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
	//console.log('query',instance_url,newOptions.path);
	var qryObj=https.request(newOptions,function(result){
		result.setEncoding('utf-8');
		var responseString1='';
		result.on('data',function(respObj){
			responseString1+=respObj;
		});
		result.on('end',function(){
			var resp=JSON.parse(responseString1);
			console.log('resp',resp);
			switch(msg){
				case "DR Exists":drtype(resp.records,opt);break;
				case "ExtractDRperformop":ExtractDRperformop(resp.records);break;
				case "OmniscriptsExists":getOmniScriptDetails(resp);break;
				case "OmniScriptperformop":OmniScriptperformop(resp);break;
			}
			
			/* if(resp.done)
				console.log(msg); */
		});
	});
	qryObj.on('error',(e)=>{
		console.log('problemquery',e);
		
	});
	qryObj.end();
};

var drtype=(lis,name)=>{
	switch(lis[0]['vlocity_cmt__Type__c']){
		case "Extract":
		case "Extract (JSON)":
			q2="select+vlocity_cmt__FilterOperator__c,vlocity_cmt__FilterValue__c,vlocity_cmt__FilterGroup__c,vlocity_cmt__InterfaceFieldAPIName__c,vlocity_cmt__InterfaceObjectName__c,vlocity_cmt__DomainObjectFieldAPIName__c+from+vlocity_cmt__DRMapItem__c+where+Name=+'"+name+"'";//get required values
			RestCallMapper(q2,'ExtractDRperformop');break;
			
	}
}

var getObjectDetails=(bundle,name)=>{
	//console.log(bundle,name);
	switch (bundle){
	case "DataRaptor":DRExists(name);break;
	case "OmniScript":OmniscriptsExists(name);break;
	}
}

var ExtractDRperformop=(lis)=>{
	//console.log(lis);
	/* fs.writeFile('drobj.json', JSON.stringify(lis,null,2), function (err) {
    if (err) 
        return console.log(err);
    console.log('Wrote Hello World in file drobj.json, just check it');
		}); */
	var sample={},
	holder={},
	temp=[],
	a='',b='';
	for (var i=0;i<lis.length;i++){
				if(lis[i]['vlocity_cmt__FilterOperator__c'] !=null){
					a=lis[i]["vlocity_cmt__InterfaceObjectName__c"];
					b=lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"];
					holder[lis[i]["vlocity_cmt__DomainObjectFieldAPIName__c"]]=a;
				}
				if(b && !b.match(/\[/i)){
				if(sample.hasOwnProperty(a)){
						if(!sample[a].match(b)){
						sample[a]+=','+b;}
					}
					else{
						sample[a]=b;
					}
				}
			}
	for (var i=0;i<lis.length;i++){
				if(lis[i]['vlocity_cmt__FilterOperator__c'] ===null){
					//console.log(lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"],lis[i]);
					temp=lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"].split(":");
					a=holder[temp[0]];
					b=temp[1];
				}
				if(b && !b.match(/\[/i)){
				if(sample.hasOwnProperty(a)){
						if(!sample[a].match(b)){
						sample[a]+=','+b;}
					}
					else{
						sample[a]=b;
					}
				}
			}
	console.log(sample,holder);
	 for (i in sample){
		//console.log('fdf',i);
		if(sample[i] && i){
		var tempquery='select+'+sample[i]+'+from+'+i+'+LIMIT+1';
		console.log('tempquery',tempquery);
		RestCallMapper(tempquery,'DRqueries');
		}
	} 
}

var DRExists=(name)=>{
	q1="select+Id,vlocity_cmt__Type__c+from+vlocity_cmt__DRBundle__c+where+Name+=+'"+name+"'";//Check DR is created
	RestCallMapper(q1,'DR Exists',name);
}

var getOmniScriptDetails=(resp)=>{
	if(resp.totalSize>0){
		q2="select+Name,vlocity_cmt__Type__c,vlocity_cmt__PropertySet__c,vlocity_cmt__Level__c,vlocity_cmt__Active__c,Id+from+vlocity_cmt__Element__c+where+vlocity_cmt__OmniScriptId__c='"+resp.records[0].Id+"'+ORDER+BY+vlocity_cmt__Level__c,vlocity_cmt__Order__c";
		RestCallMapper(q2,'OmniScriptperformop');
	}
	else{// NO RECORDS
		console.log("Omniscript is either not active or doesn't exist");
	}
}

var OmniScriptperformop=(resp)=>{
	var sample={};
	for (var i=0;i<resp.records.length;i++){
		//console.log(resp.records[i].Name,true);
		sample[resp.records[i].Name]=true;
		switch(resp.records[i]["vlocity_cmt__Type__c"]){
			case "Remote Action":
								propset=JSON.parse(resp.records[i]["vlocity_cmt__PropertySet__c"]);
								if(propset.responseJSONNode && sample[propset.responseJSONNode]===undefined){
									//console.log(sample,sample[propset.responseJSONNode],resp.records[i].Name,propset.responseJSONNode,'sample');
									sample[propset.responseJSONNode]=false;
								}
								if(sample[propset.preTransformBundle]|| sample[propset.postTransformBundle]){
									getObjectDetails("DataRaptor",sample[propset.preTransformBundle]!==""?sample[propset.preTransformBundle]:sample[propset.postTransformBundle]);
								}
								break;
		}
	}
	for (i in sample){
		//console.log(sample[i],i);
		if (sample.hasOwnProperty(i) && sample[i]===false){
			console.log(i,'is not existing but used');
		}
	}
}
var OmniscriptsExists=(name)=>{
	q1="select+Id,vlocity_cmt__PropertySet__c+from+vlocity_cmt__OmniScript__c+Where+Name='"+name.replace(/\s/g,'+')+"'+and+vlocity_cmt__IsActive__c=true";
	RestCallMapper(q1,'OmniscriptsExists',name);
}
module.exports.getAccessToken=getAccessToken;
module.exports.getObjectDetails=getObjectDetails;