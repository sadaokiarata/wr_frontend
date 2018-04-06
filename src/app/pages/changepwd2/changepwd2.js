(function () {
  'use strict';

  angular.module('BlurAdmin.pages.changepwd2', [])
    .config(routeConfig).controller('ChangePwdController2', ChangePwdController2);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('changepwd2', {
        url: '/changepwd2',
        templateUrl: 'app/pages/changepwd2/changepwd2.html',
        title: 'Change Password2',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function ChangePwdController2($scope, $window, $location) {
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
  }
})();