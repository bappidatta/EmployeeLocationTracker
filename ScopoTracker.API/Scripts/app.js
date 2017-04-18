let scopoApp = angular.module('scopoApp', []);
scopoApp.controller('appController', ['$http', '$scope', function ($http, $scope) {    
    let serverRoot = "http://localhost:62933/";

    $scope.register = () => {
        if (!$scope.registerForm.$valid)
            return;
        registraterUser($scope.user);
    }

    $scope.login = () => {        
        if (!$scope.loginForm.$valid)
            return;
        login($scope.user);
    }

    $scope.logOut = () => {

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
            localStorage.setItem('token', res.data.access_token);
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
