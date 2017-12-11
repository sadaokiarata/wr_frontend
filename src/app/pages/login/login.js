(function () {
  'use strict';

  angular.module('BlurAdmin.pages.login', [])
      .config(routeConfig).controller('LoginController', LoginController);

  /** @ngInject */
  function routeConfig($stateProvider,$locationProvider, $urlMatcherFactoryProvider) {
    //$locationProvider.html5Mode({enabled:true, requireBase:false});
    //$urlMatcherFactoryProvider.strictMode(false);
    $stateProvider.state('login', {
      url: '/login',
      templateUrl: 'app/pages/login/login.html',
      title: 'Login',
      sidebarMeta: {
        order: 1,
      },
    });
  }

  function LoginController($scope, $rootScope, $http, $location, $window, toastr) {  
    $scope.OnLogin = function() {
      if ($scope.userEmail == "" || $scope.userEmail == undefined) {
        $scope.loginFailed = "Please input Email!";
        toastr.warning($scope.loginFailed, "Login");
        return;
      } else if ($scope.userPwd == "") {
        $scope.loginFailed = "Please input password!";
        toastr.warning($scope.loginFailed, "Login");
        return;
      } else
        $scope.loginFailed = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/login',
        data: {
          email: $scope.userEmail,
          password: $scope.userPwd
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          // toastr.info("Logined successfully", "Login")
          $window.sessionStorage.setItem("user", JSON.stringify(response.data));
          if (response.data.type == 0) {
            $location.path("/myads");
          } else if (response.data.type > 0) {
            $location.path("/users");
          } else {
            return;
          }
          $rootScope.logined = true;
          $rootScope.username = response.data.username;
          $rootScope.isAdmin = (response.data.type == 1);
          $rootScope.budget = response.data.budget;
          $http({
            method: "GET",
            url: 'https://localhost:3009/conversations/conversations?token=' + response.data.token,
          }).then(function (response) {
            if (response.data.ret == 0) {
              $rootScope.conversations = response.data.convs;
              $rootScope.unreads = response.data.unreads;
              for (var i = 0; i < $rootScope.unreads.length; i++) {
                $rootScope.unreads[i].ti = new Date($rootScope.unreads[i].ti);
              }
            }
          });
        } else if (response.data.ret == -2) {
          $window.sessionStorage.setItem("user", JSON.stringify(response.data));
          $location.path("/verify");
        } else {
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Login");
        }
      });
    }

  }
})();