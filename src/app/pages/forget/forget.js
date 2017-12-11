(function () {
  'use strict';

  angular.module('BlurAdmin.pages.forget', [])
      .config(routeConfig).controller('ForgetController', ForgetController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('forget', {
          url: '/forget',
          templateUrl: 'app/pages/forget/forget.html',
          title: 'Forget',
          sidebarMeta: {
            order: 1,
          },
        });
  }

  function ForgetController($scope, $rootScope, $http, $location, $window, toastr) {

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
    $scope.OnSendEmail = function() {
      if ($scope.email == "" || $scope.email == undefined) {
        $scope.result = "Please input email!";
        return;
      } else
        $scope.result = "";
      $http({
        method: "GET",
        url: 'https://localhost:3009/users/forget?email=' + $scope.email,
      }).then(function (response) {
        console.log("Forget", response.data);
        if (response.data.ret == 0) {
          $scope.result = 'Mail sent';
        } else {
          $scope.result = response.data.err;
        }
      });
    }
    $scope.OnChangePwd = function () {
      if ($scope.verifycode == "" || $scope.verifycode == undefined) {
        $scope.result2 = "Input verify code";
        return;
      } else if ($scope.newpwd == "" || $scope.newpwd == undefined) {
        $scope.result2 = "Input password";
        return;
      } else if ($scope.newpwdconfirm == "" || $scope.newpwdconfirm == undefined) {
        $scope.result2 = "Input password confirm";
        return;
      } else if ($scope.newpwd != $scope.newpwdconfirm) {
        $scope.result2 = "Password doesn't match";
        return;
      } else
        $scope.result2 = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/resetpwd',
        data: {
          email: $scope.email,
          newpwd: $scope.newpwd,
          verifycode: $scope.verifycode,
        }
      }).then(function (response) {
        console.log("chnagepwd res " + JSON.stringify(response.data));
        if (response.data.ret == 0)
          $location.path("/login");
        else
          $scope.result2 = response.data.err;
      });
    }
  }
})();