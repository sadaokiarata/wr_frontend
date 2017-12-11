(function () {
  'use strict';

  angular.module('BlurAdmin.pages.selcategory', [])
      .config(routeConfig).controller('SelCategoryController', SelCategoryController) ;

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('selcategory', {
          url: '/selcategory',
          templateUrl: 'app/pages/selcategory/selcategory.html',
          title: 'Select Category',
          sidebarMeta: {
            order: 1,
          },
        });
  }
  function SelCategoryController($scope, $rootScope, $window, $http, $location) {
    if ($rootScope.ad == null)
      $rootScope.ad = {};
    $rootScope.ad.category = -1;
    $http({
      method: "GET",
      url: 'https://localhost:3009/categories',
    }).then(function (response) {
      $scope.categories = response.data.categories;
      $($(".label").get(0)).addClass("label-info");
    });
    $scope.SelCategory = function(id) {
      $(".label-info").removeClass("label-info");
      $($(".label").get(id)).addClass("label-info");
      $rootScope.ad.category = id;
      $rootScope.ad.category_id = $scope.categories[id].category_id;
      $rootScope.ad.category_name = $scope.categories[id].category_name;
      $rootScope.ad.category_credit = $scope.categories[id].category_credit;
      $location.path('/step1');
    }
  }

})();