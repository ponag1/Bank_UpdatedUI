var express = require('express');
var path = require('path');
var fs = require("fs");
var requestify = require("requestify");
var bodyParser = require('body-parser');
var port = process.env.PORT || process.env.VCAP_APP_PORT || '8080';
var nano = require('nano')('http://localhost:'+port);
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(__dirname + '/'));
var dbCredentials_url = "https://e6d97cd6-54d9-4aea-a5f8-ee525fcae887-bluemix:f9a392d0d5bc1c5b590ec1121ebf1b70b66036708b453d82b5c406d2ea21ec61@e6d97cd6-54d9-4aea-a5f8-ee525fcae887-bluemix.cloudant.com";
var cloudant = require('cloudant')(dbCredentials_url);
var dbForLogin = cloudant.db.use("authdata");
var dbForLoan = cloudant.db.use("loandata");
var dbForVerification = cloudant.db.use("mojani");

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/BankLogin.html'));
});

app.post('/loginData', function(req, res) {
    var userName = req.body.userId;
    var password = req.body.password;
	dbForLogin.get(userName, function(err, body) {
	  if (!err) {
          if(body.password == password){
            var response = {
                status  : 200,
                message : body.role
            }
            res.send(JSON.stringify(response));	        
          }else{
            var response = {
                status  : 500,
                message : 'Password does not match'
            }
            res.send(JSON.stringify(response));	 
          }        
	  }else{	
		var response = {
			status  : 400,
			message : 'Username does not exists'
		}
		res.send(JSON.stringify(response));	
	  }
	});
});


app.post('/loanData', function(req, res) {
    var loan_id = "L-"+req.body.asset_id;
    dbForLoan.insert(req.body, loan_id, function(err, body) {
        if (!err){
            var response = {
                status  : 200,
                message : 'Successfully added data to db.'
            }
            res.send(JSON.stringify(response));
        }else{
            var response = {
                status  : 400,
                message : 'Error'
            }
            res.send(JSON.stringify(response));
        }  
      });
});    

app.get('/loanRecords', function(req, res) {
    dbForLoan.list({include_docs:true}, function (err, data) {
        if(!err){
            res.send(JSON.stringify(data));            
        }else{
            var response = {
                status  : 400,
                message : 'Error'
            }
            res.send(JSON.stringify(response));
        }
    });
});

app.post('/loanFormWithId', function(req, res) {
    var loan_id = req.body.loan_id;
    dbForLoan.get(loan_id, function (err, data) {
        if(!err){ 
            var response = {
                status  : 200,
                message : data
             }
            res.send(JSON.stringify(response));            
        }else{
            var response = {
                status  : 400,
                message : 'Error'
            }
            res.send(JSON.stringify(response));
        }
    });
});

app.post('/updateLoanStatus', function(req, res) {
    dbForLoan.insert(req.body, function(err, body) {
        if (!err){
            var response = {
                status  : 200,
                message : 'Successfully added data to db.'
            }
            res.send(JSON.stringify(response));
        }else{
            var response = {
                status  : 400,
                message : 'Error'
            }
            res.send(JSON.stringify(response));
        }  
      });
});

app.post('/checkPropertyId', function(req, res) {
	var pid = req.body.property_id;
	var land_details;
	var owner_details;
	var data;
	requestify.get('https://landrecord.mybluemix.net/api/LandRecord?filter[where][pid]='+pid)
	  .then(function(response) {
		  land_details = (response.getBody())[0];
		  var owner = land_details.owner;
		  owner = owner.split("#")[1];
		requestify.get('https://landrecord.mybluemix.net/api/Owner?filter[where][aadharNo]='+owner)
		  .then(function(response) {
            var details = response.getBody();
            if(details.length > 0){
                owner_details = details[0];
                data = {
                    wardNo : land_details.wardNo,
                    areaCode : land_details.areaCode,
                    siteNo : land_details.siteNo,
                    latitude : land_details.latitude,
                    longitude : land_details.longitude,
                    length : land_details.length,
                    width : land_details.width,
                    totalArea : land_details.totalArea,
                    address : land_details.address,
                    isMojaniApproved : land_details.isMojaniApproved,
                    isKaveriApproved : land_details.isKaveriApproved,
                    ownerName : owner_details.ownerName,
                    aadharNo : owner_details.aadharNo,
                    gender : owner_details.gender,
                    mobileNo : owner_details.mobileNo,
                    emailID : owner_details.emailID,
                    address : owner_details.address
                }
                res.send(JSON.stringify(data));
            }else{
                requestify.request('https://landrecord.mybluemix.net/api/AddAssignee?filter[where][owner.aadharNo]='+owner, {
                    method: 'GET',
                    dataType: 'json'
                })
                .then(function (response) {
                    // get the response body
                    var details = response.getBody();
                    owner_details = details[0];
                    data = {
                        wardNo : land_details.wardNo,
                        areaCode : land_details.areaCode,
                        siteNo : land_details.siteNo,
                        latitude : land_details.latitude,
                        longitude : land_details.longitude,
                        length : land_details.length,
                        width : land_details.width,
                        totalArea : land_details.totalArea,
                        address : land_details.address,
                        isMojaniApproved : land_details.isMojaniApproved,
                        isKaveriApproved : land_details.isKaveriApproved,
                        ownerName : owner_details.ownerName,
                        aadharNo : owner_details.aadharNo,
                        gender : owner_details.gender,
                        mobileNo : owner_details.mobileNo,
                        emailID : owner_details.emailID,
                        address : owner_details.address
                    }
                    res.send(JSON.stringify(data));	
                });                
            }  
		  }
		);
	  }
	);
});

app.listen(port);