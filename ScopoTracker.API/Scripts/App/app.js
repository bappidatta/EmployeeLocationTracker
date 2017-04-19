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
                    if (localStorage.notifications) {
                        $rootScope.notifications = JSON.parse(localStorage.notifications);
                    }
                    $rootScope.signOut = function () {
                        $window.localStorage.removeItem('token');
                        $rootScope.userName = null;
                        $rootScope.notifications = [];
                        localStorage.removeItem('notifications');
                        $location.path('/landing');
                    }
                } else {
                    if ($location.$$url == '/Candidate-Signup') {
                        $location.path('/Candidate-Signup');
                    } else if ($location.$$url == '/Employer-Signup') {
                        $location.path('/Employer-Signup');
                    } else if ($location.$$url == '/' || $location.$$url == '/landing') {
                        $location.path('/landing');
                    } else if ($location.$$url == '/Search-Jobs') {
                        $location.path('/Search-Jobs');
                    }
                    else {
                        $location.path('/SignIn');
                    }
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


    // init
    $scope.init = () => {
        if ($scope.auth.isLoggedIn()) {
            getUsers();
        }
    }

    let goto = {
        register: function () {            
            $scope.state.login = false;
        },
        login: function() {     
            $scope.state.login = true;
        }
    }

    $scope.navigateTo = (nav) => {
        console.log(nav);
        goto[nav]();
    }
    
    $scope.register = () => {
        if (!$scope.forms.registerForm.$valid)
            return;
        registraterUser($scope.user);
    }

    $scope.login = () => {        
        if (!$scope.forms.loginForm.$valid)
            return;        
        login($scope.user);
    }

    $scope.logOut = () => {
        $scope.auth.destory();
    }
    

    // Login
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
            getUsers();
        }, err => {
            handleHttpError(err);
        });
    };
    
    // Register
    let registraterUser = (user) => {
        $http.post(serverRoot + 'api/Account/Register', user).then(res => {            
            $scope.state.login = true;
        }, err => {
            handleHttpError(err);
        });
    }
    // Error handling
    let handleHttpError = (err) => {
        console.log(err);
    }

    let getUsers = () => {
        $http.get(serverRoot + 'api/Account/UserList').then(res=> {
            $scope.userList = res.data;
        }, err=> { handleHttpError(err); });
    }
}]);
