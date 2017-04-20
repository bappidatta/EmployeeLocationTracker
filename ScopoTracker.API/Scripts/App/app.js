// Define App
let scopoApp = angular.module('scopoApp', []);
// Config the request interceptor
angular.module('scopoApp').factory('httpRequestInterceptor', [
    '$q',
    function ($q) {
        return {
            'responseError': function (rejection) {
                return $q.reject(rejection);
            }
        };
    }
]);

angular.module('scopoApp').factory('authInterceptor', [
    '$rootScope',
    '$q',
    '$window',
    '$location',
    function ($rootScope, $q, $window, $location) {
        return {
            request: function (config) {
                config.headers = config.headers || {};
                if ($window.localStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
                    $rootScope.userName = $window.localStorage.userName;                    
                    $rootScope.signOut = function () {
                        $window.localStorage.removeItem('token');                                                             
                    }
                } else {
                    $location.path('/Index');
                }
                return config;
            },
            response: function (response) {
                if (response.status === 401) {
                    // handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }
        };
    }
]);

scopoApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.interceptors.push('authInterceptor');
}]);


// define controller

scopoApp.controller('appController', ['$http', '$scope', function ($http, $scope) {    
    // top order variables 
    let serverRoot = "http://localhost:62933/";
    $scope.state = { login: true };
    $scope.forms = {};
    $scope.user = {};
    $scope.agent = {};
    $scope.bank = {};
    $scope.center = {};
    $scope.auth = {
        getToken () {
            return localStorage.getItem('token');
        },
        getUserName(){
            return localStorage.getItem('userName');
        },
        isLoggedIn(){
            if (!this.getToken())                
                return false;
            return true;
        },
        destory(){
            localStorage.setItem('token', '');
            localStorage.setItem('userName', '');
            $scope.state.login = true;
        }
    }

    // top order data containers
    $scope.userList = [];
    $scope.agentList = [];
    $scope.bankList = [];
    $scope.centerList = [];
    // init
    $scope.init = () => {
        if ($scope.auth.isLoggedIn()) {
            getUsers();
            getAgents();
            getBanks();
            getCenters();
        }
    }
    $scope.context = {
        newAgent: true,
        newBank: true,
        newUser: true,
        newCenter: true
    }
    let goto = {
        agent: function (agent) {            
            $scope.agent = angular.copy(agent);
            $scope.context.newAgent = false;
        },
        bank: function(item) {     
            $scope.bank = angular.copy(item);
            $scope.context.newBank = false;
        },
        user: function (item) {
            //$scope.user = angular.copy(item);
            //$scope.context.user = false;
        },
        center: function (item) {
            $scope.center = angular.copy(item);
            $scope.context.newCenter = false;
        },
    }

    let prevItem = {
        agent: null,
        bank: null,
        center: null,
        user: null
    }

    // scope variables    
    
    $scope.login = () => {        
        if (!$scope.forms.loginForm.$valid)
            return;        
        login($scope.user);
    }

    $scope.logOut = () => {
        $scope.auth.destory();
    }
    
    $scope.selectItem = (item, type, index) => {        
        item.selected = true;
        if (prevItem[type] != null)
            prevItem[type].selected = false;
        prevItem[type] = item;
        goto[type](item);
    }
    
    $scope.newAgent = () => {
        $scope.context.newAgent = true;
        resetForm($scope.forms.agentForm);
        $scope.agent = {};
    }

    $scope.newBank = () => {
        $scope.context.newBank = true;
        resetForm($scope.forms.bankForm);
        $scope.bank = {};
    }

    $scope.newCenter = () => {
        $scope.context.newCenter = true;
        resetForm($scope.forms.centerForm);
        $scope.center = {};
    }

    $scope.deleteAgent = () => {
        deleteAgent($scope.agent.AgentID);
    }

    $scope.deleteBank = () => {
        deleteBank($scope.bank.BankID);
    }

    $scope.deleteCenter = () => {
        deleteCenter($scope.center.CenterID)
    }


    // create 
    $scope.register = () => {
        if (!$scope.forms.registerForm.$valid)
            return;
        if ($scope.user.Password !== $scope.user.ConfirmPassword) {
            alert('Password & Confirm Password dose not match!');
            return;
        }            
        registraterUser($scope.user);
    }

    $scope.addAgent = () => {
        if (!$scope.forms.agentForm.$valid)
            return;        
        if ($scope.context.newAgent)
            addAgent($scope.agent);
        else
            updateAgent($scope.agent);
    }

    $scope.addBank = () => {
        if (!$scope.forms.bankForm.$valid)
            return;
        if ($scope.context.newBank)
            addBank($scope.bank);
        else
            updateBank($scope.bank);
    }

    $scope.addCenter = () => {
        if (!$scope.forms.centerForm.$valid)
            return;
        if ($scope.context.newCenter)
            addCenter($scope.center);
        else
            updateCenter($scope.center);
    }



    // function definations
    let login = (user) => {
        let data = 'grant_type=password&username=' + user.UserName +
           '&password=' + user.Password;
        $http({
            method: 'POST',
            url: serverRoot + 'Token',
            data: data,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => {            
            if (!res.data.access_token) {
                return;
            }
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('userName', user.UserName);            
        }, err => {
            handleHttpError(err);
        });
    };

    let handleHttpError = (err) => {
        console.log(err);
    }

    // Create
    let registraterUser = (user) => {
        $http.post(serverRoot + 'api/Account/Register', user).then(res => {
            getUsers();
            resetForm($scope.forms.registerForm);            
            $scope.user = {};
        }, err => {
            handleHttpError(err);
        });
    }

    let addAgent = (agent) => {
        $http.post(serverRoot + 'api/Agents', agent).then(res=> {            
            getAgents();
            resetForm($scope.forms.agentForm);
            $scope.agent = {};
        }, err=> { handleHttpError(err); });
    }

    let addBank = (bank) => {
        $http.post(serverRoot + 'api/Banks', bank).then(res=> {
            getBanks();
            resetForm($scope.forms.bankForm);
            $scope.bank = {};
        }, err=> { handleHttpError(err); });
    }

    let addCenter = (center) => {
        $http.post(serverRoot + 'api/Centers', center).then(res=> {
            getCenters();
            resetForm($scope.forms.centerForm);
            $scope.center = {};
        }, err=> { handleHttpError(err); });
    }

    // Update
    let updateAgent = (agent) => {
        $http.put(serverRoot + 'api/Agents/'+agent.AgentID, agent).then(res=> {
            getAgents();
            $scope.newAgent();
        }, err=> { handleHttpError(err); });
    }

    let updateBank = (bank) => {
        $http.put(serverRoot + 'api/Banks/' + bank.BankID, bank).then(res=> {
            getBanks();
            $scope.newBank();
        }, err=> { handleHttpError(err); });
    }

    let updateCenter = (center) => {
        $http.put(serverRoot + 'api/Centers/' + center.CenterID, center).then(res=> {
            getCenters();
            $scope.newCenter();
        }, err=> { handleHttpError(err); });
    }

    // Delete
    let deleteAgent = (id)=>{
        $http.delete(serverRoot + 'api/Agents/' + id).then(res=> {            
            getAgents();
            $scope.newAgent();
        }, err=> { console.log(err); });
    }

    let deleteBank = (id) => {
        $http.delete(serverRoot + 'api/Banks/' + id).then(res=> {
            getBanks();
            $scope.newBank();
        });
    }

    let deleteCenter = (id) => {
        $http.delete(serverRoot + 'api/Centers/' + id).then(res=> {
            getCenters();
            $scope.newCenter();
        });
    }

    // Data loaders
    let getUsers = () => {
        $http.get(serverRoot + 'api/Account/UserList').then(res=> {
            $scope.userList = res.data;
        }, err=> { handleHttpError(err); });
    }    
    let getAgents = () => {
        $http.get(serverRoot + 'api/Agents').then(res=> {
            console.log(res.data);
            $scope.agentList = res.data;
        }, err=> { handleHttpError(err); });
    }
    let getBanks = () => {
        $http.get(serverRoot + 'api/Banks').then(res=> {
            console.log(res.data);
            $scope.bankList = res.data;
        }, err=> { handleHttpError(err); });
    }
    let getCenters = () => {
        $http.get(serverRoot + 'api/Centers').then(res=> {
            console.log(res.data);
            $scope.centerList = res.data;
        }, err=> { handleHttpError(err); });
    }

    // utilities
    let resetForm = (form, func)=>{
        form.$setPristine();
        form.$setUntouched();
        if (func)
            func();
    }

    

}]);
