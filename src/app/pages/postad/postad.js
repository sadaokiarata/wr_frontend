(function () {
  'use strict';

  angular.module('BlurAdmin.pages.postad', [])
    .config(routeConfig).controller('PostAdController', PostAdController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('postad', {
        url: '/postad',
        templateUrl: 'app/pages/postad/postad.html',
        title: 'Post Ad',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function PostAdController($scope, $rootScope, $window, $location, toastr) {
    var user = JSON.parse($window.localStorage.getItem("user"));
    if (user == null || user == undefined) {
      $location.path("/login");
      return;
    }
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      //$location.path("/login");
      return;
    }
    $scope.post =function() {
      $rootScope.prev = 1;
      $location.path("/sellocation");
    }
    $scope.multipost =function() {
      toastr.success("Coming soon");
    }
  }
})();