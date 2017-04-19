let scopoApp = angular.module('scopoApp', []);
scopoApp.controller('appController', ['$http', '$scope', function ($http, $scope) {    
    let serverRoot = "http://localhost:62933/";
    $scope.state = { login: true };
    $scope.forms = {};
    $scope.user = {};
    $scope.auth = {
        getToken () {
            return localStorage.getItem(this.getUserName());
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
            localStorage.setItem(this.getUserName(), null);
            localStorage.setItem('userName', null);
            $scope.state.login = true;
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
            console.log(res);
            if (!res.data.access_token) {
                return;
            }

            console.log()

            localStorage.setItem(user.UserName, res.data.access_token);
            localStorage.setItem('userName', user.UserName);
        }, err => {
            handleHttpError(err);
        });
    };


    // Register
    let registraterUser = (user) => {
        $http.post(serverRoot + 'api/Account/Register', user).then(res => {
            console.log(res);
        }, err => {
            handleHttpError(err);
        });
    }
    // Error handling
    let handleHttpError = (err) => {
        console.log(err);
    }
}]);
