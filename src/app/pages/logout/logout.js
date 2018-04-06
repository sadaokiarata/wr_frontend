(function () {
  'use strict';

  angular.module('BlurAdmin.pages.logout', [])
    .config(routeConfig).controller('LogoutController', LogoutController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('logout', {
        url: '/logout',
        templateUrl: 'app/pages/logout/logout.html',
        title: 'Logout',
        sidebarMeta: {
          order: 1,
        },
      });
  }

  function LogoutController($scope, $rootScope, $location, $window) {
    console.log("logout");
    $window.localStorage.setItem("user", null);
    $rootScope.logined = false;
    $location.path("/home//");
  }
})();