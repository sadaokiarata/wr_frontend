(function () {
  'use strict';

  angular.module('BlurAdmin.pages.verify', [])
      .config(routeConfig).controller('VerifyController', VerifyController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('verify', {
          url: '/verify',
          templateUrl: 'app/pages/verify/verify.html',
          title: 'Verify',
          sidebarMeta: {
            order: 1,
          },
        });
  }

  function VerifyController($scope, $rootScope, $http, $location, $window, toastr) {
    var user = JSON.parse($window.localStorage.getItem("user"));
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      console.log("user login needed1");
      //$location.path("/login");
      return;
    }
    $scope.OnResend = function() {
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/resend?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          toastr.success("Email sent");
        } else {
          toastr.error("Error occured", "Verify");
        }
      });
    }
    $scope.OnVerify = function() {
      if ($scope.verifyCode == "" || $scope.verifyCode == undefined) {
        $scope.loginFailed = "Please input verification code!";
        toastr.warning($scope.loginFailed, "Verify");
        return;
      } else
        $scope.loginFailed = "";

      $http({
        method: "POST",
        url: 'https://localhost:3009/users/verify?token=' + token + '&verify=' + $scope.verifyCode,
      }).then(function (response) {
        console.log("verify", response.data);
        //console.log("login res " + JSON.stringify(response.data));
        if (response.data.ret == 0) {
          $rootScope.logined = true;
          $rootScope.username = response.data.username;
          $rootScope.isAdmin = (response.data.type == 1);
          $rootScope.budget = response.data.budget;
          $window.localStorage.setItem("user", JSON.stringify(response.data));
          if (response.data.type == 0) {
            $location.path("/myads");
          } else if (response.data.type > 0) {
            $location.path("/users");
          } else {
            return;
          }
        } else {
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Login");
        }
      });
    }

  }
})();