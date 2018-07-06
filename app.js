var app = angular.module('myApp', []);

app.controller('loginPage', function($scope, $http, $window) {
    $scope.username = "";
    $scope.pwd = "";
    $scope.Authenticate = function() {
        if($scope.username != "" && $scope.pwd != ""){
            var userdetails ={
                userId : $scope.username,
                password : $scope.pwd
            };
            $http({
                method: 'POST',
                url: '/loginData',
                data: userdetails
            }).then(function successCallback(response) {
                if(response.data != null && response.data.status == 200){
                    if(response.data.message == "user"){
                        $window.location.href = '/LoanForm.html';
                    }else if(response.data.message == "Bank_Manager"){
                        $window.location.href = '/LoanRecords.html';
                    }
                }else{
                    alert(resonse.data.message);
                }
            });  
        }else{
            alert("Please fill both the fields to proceed futher");
        }
    }
});

app.controller('loanForm', function($scope, $http, $window) {

    $scope.Logout = function() {
        $window.location.href = '/BankLogin.html';        
    }

    $scope.assetType = ["Property", "Vehicle", "Misc."];
    $scope.name ;
    $scope.aadhar ;
    $scope.mobile_number ;
    $scope.email_id ;
    $scope.selectedassetType ;
    $scope.pid ;
    $scope.asset_value ;
    $scope.asset_purchased_date ;
    $scope.bank_name ;
    $scope.branch_name ;
    $scope.acc_number ;

    $scope.DataToDb = function() {
        var today = new Date();
        var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
        if($scope.name != null && $scope.aadhar != null && $scope.mobile_number != null && $scope.email_id != null && $scope.selectedassetType != null && $scope.pid != null && $scope.asset_value != null && $scope.asset_value != null && $scope.asset_value != null && $scope.asset_value != null && $scope.asset_value != null ){
            var loandetails ={
                applicant_name: $scope.name,
                applicant_aadhar: $scope.aadhar,
                applicant_mobile_number: $scope.mobile_number,
                applicant_email_id: $scope.email_id,
                asset_type: $scope.selectedassetType,
                asset_id: $scope.pid,
                asset_value: $scope.asset_value,
                bank_name: $scope.bank_name,
                branch_name: $scope.branch_name,
                bank_acc_number: $scope.acc_number,
                loan_applied_data: date,
                application_status: "Applied"
            };
            $http({
                method: 'POST',
                url: '/loanData',
                data: loandetails
            }).then(function successCallback(response) {
                if(response.data != null && response.data.status == 200){
                    $window.location.href = '/LoanAppliedSuccess.html';
                }else{
                    alert("Issue in inserting data in DB. Please contact system administrator.");
                }
            });  
        }else{
            alert("Please fill all the details to proceed further");
        }
    }    
});

app.controller('successForm', function($scope, $window) {
    $scope.Close = function() {
        $window.location.href = '/BankLogin.html';        
    }
});    

app.controller('recordsForm', function($scope, $http, $window) {
    $scope.initialLoad = function() {
        $http({
            method: 'GET',
            url: '/loanRecords'
        }).then(function successCallback(response) {
            $scope.tableData = response.data.rows;
        });
    }

    $scope.Logout = function() {
        $window.location.href = '/BankLogin.html';        
    }

    $scope.showLoanForm = function(x) {
        var loan_id = x;
        $window.location.href = '/LoanApproveOrReject.html?loan_id='+loan_id;                
    };
});    

app.controller('approveReject', function($scope, $http, $window, $filter) {
    $scope.Back = function() {
        $window.location.href = '/LoanRecords.html';        
    }
    $scope.assetType = ["Property", "Vehicle", "Misc."];
    $scope.application_rejection_reason ;
    $scope.show_property_details = true;
    $scope.loadLoanData = function() {
        var loanform = {
            loan_id : $window.location.search.split('=')[1]
        };
        $http({
            method: 'POST',
            url: '/loanFormWithId',
            data: loanform
        }).then(function successCallback(response) {
            var jsonData = response;
            if(jsonData.data.status == 200 ){
                $scope.name = jsonData.data.message.applicant_name ;
                $scope.aadhar = jsonData.data.message.applicant_aadhar ;
                $scope.mobile_number = jsonData.data.message.applicant_mobile_number ;
                $scope.email_id = jsonData.data.message.applicant_email_id ;
                $scope.selectedassetType = jsonData.data.message.asset_type;
                $scope.pid = jsonData.data.message.asset_id ;
                $scope.asset_value = jsonData.data.message.asset_value ;
                $scope.bank_name = jsonData.data.message.bank_name ;
                $scope.branch_name = jsonData.data.message.branch_name ;
                $scope.acc_number = jsonData.data.message.bank_acc_number ;
                $scope._id = jsonData.data.message._id;
                $scope._rev = jsonData.data.message._rev;
                var propertydetails = {
                    property_id : $scope.pid
                }
                $http({
                    method: 'POST',
                    url: '/checkPropertyId',
                    data: propertydetails
                }).then(function successCallback(response) {
                    if(response.status == 200 ){
                        console.log(response);
                        $scope.show_property_details = false;
                        $scope.ward_number = response.data.wardNo;
                        $scope.area_code = response.data.areaCode;
                        $scope.plot_number = response.data.siteNo;
                        $scope.latitude = response.data.latitude;
                        $scope.longitude = response.data.longitude;
                        $scope.plot_length = response.data.length;
                        $scope.plot_width = response.data.width;
                        $scope.plot_area = response.data.totalArea;
                        $scope.plot_address = response.data.address;
                        $scope.allottee_name = response.data.ownerName;
                        $scope.aadhar_number = response.data.aadharNo;
                        $scope.allottee_gender = response.data.gender;
                        $scope.allottee_mobile_number = response.data.mobileNo;
                        $scope.allottee_email_id = response.data.emailID;
                        $scope.allottee_address = response.data.address;
						$scope.isMojaniApproved = response.data.isMojaniApproved;
						$scope.isKaveriApproved = response.data.isKaveriApproved;
                    }else{
                        $scope.show_property_details = true;
                    }
                });
            }else{
                alert("Please contact system administrator.")
            }
        });
    }
        
        $scope.Update = function(status) {
            var today = new Date();
            var date = today.getDate()+'/'+(today.getMonth()+1)+'/'+today.getFullYear();
            var status = status != null ? status : "Rejected";
            var loandetails ={
                applicant_name: $scope.name,
                applicant_aadhar: $scope.aadhar,
                applicant_mobile_number: $scope.mobile_number,
                applicant_email_id: $scope.email_id,
                asset_type: $scope.selectedassetType,
                asset_id: $scope.pid,
                asset_value: $scope.asset_value,
                bank_name: $scope.bank_name,
                branch_name: $scope.branch_name,
                bank_acc_number: $scope.acc_number,
                loan_applied_data: date,
                application_status: status,
                _id: $scope._id,
                _rev: $scope._rev
            };
            $http({
                method: 'POST',
                url: '/updateLoanStatus',
                data: loandetails
            }).then(function successCallback(response) {
                if(response.data.status == 200){
                    $window.location.href = '/LoanRecords.html';        
                }else{
                    alert("Status update failed, Please contact system administrator.");
                }  
            });  
        }

        $scope.Verify = function() {
		$scope.verify_details = false;
		$scope.showVerify = false;
		$scope.showNotVerified = false;
           if($scope.isMojaniApproved){
			   $scope.verify_details = true;
			   $scope.showVerify = true;
		   }else{
			   $scope.verify_details = true;
			   $scope.showNotVerified = true;
		   }
        }				
});    
