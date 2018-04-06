(function () {
  'use strict';

  angular.module('BlurAdmin.pages.changepwd', [])
    .config(routeConfig).controller('ChangePwdController', ChangePwdController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('changepwd', {
        url: '/changepwd',
        templateUrl: 'app/pages/changepwd/changepwd.html',
        title: 'Change Password',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function ChangePwdController($scope, $window, $location, $http) {
    var user = JSON.parse($window.localStorage.getItem("user"));
    if (user == null || user == undefined) {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }

    $scope.OnChangePwd = function () {
      if ($scope.oldpwd == "" || $scope.oldpwd == undefined) {
        $scope.result = "";
        return;
      } else if ($scope.newpwd == "" || $scope.newpwd == undefined) {
        $scope.result = "";
        return;
      } else if ($scope.newpwdconfirm == "" || $scope.newpwdconfirm == undefined) {
        $scope.result = "";
        return;
      } else if ($scope.newpwd != $scope.newpwdconfirm) {
        $scope.result = "Password doesn't match";
        return;
      } else
        $scope.result = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/changepwd',
        data: {
          oldpwd: $scope.oldpwd,
          newpwd: $scope.newpwd,
          token: token,
        }
      }).then(function (response) {
        console.log("chnagepwd res " + JSON.stringify(response.data));
        if (response.data.ret == 0)
          $location.path("/changepwd2");
        else
          $scope.result = response.data.err;
      });
    }
  }
})();