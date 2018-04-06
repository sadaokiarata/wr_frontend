(function () {
  'use strict';

  angular.module('BlurAdmin.pages.register', [])
      .config(routeConfig).controller('RegisterController', RegisterController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('register', {
          url: '/register',
          templateUrl: 'app/pages/register/register.html',
          title: 'Register',
          sidebarMeta: {
            order: 1,
          },
        });
  }
  function RegisterController($scope, $http, $location, $window, toastr) {
    console.log("register ");
    var user = JSON.parse($window.localStorage.getItem("user"));
    if (user != null && user != undefined) {
      var token = user.token;
      console.log("postad token", token, user);
      /*if (token != null) {
        $location.path("/myads");
        return;
      }*/
    }
    $scope.OnRegister = function() {
      if ($scope.userEmail == "" || $scope.userEmail == undefined) {
        $scope.result = "";
        return;
      } else if ($scope.userPwd == undefined || $scope.userPwd.length < 3 || $scope.userPwd != $scope.userPwdConfirm) {
        $scope.result = "Password and confirm does not match";
        return;
      }
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/register',
        data: {
          email: $scope.userEmail,
          password: $scope.userPwd
        }
      }).then(function (response) {
        if (response.data.ret == 0)
          $location.path("/login");//register2");
        else if (response.data.ret == -2)   // not verified
          $location.path("/verify");
        else {
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Register");
        }
      });
    }
    $scope.CheckValidEmail = function() {
      var x = $("#email").val();
      var atpos = x.indexOf("@");
      var dotpos = x.lastIndexOf(".");
      if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
          alert("Not a valid e-mail address");
          return false;
      }
    }
  }
})();