(function () {
  'use strict';

  angular.module('BlurAdmin.pages.ads', [])
    .config(routeConfig).controller('AdsController', AdsController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('ads', {
        url: '/ads',
        templateUrl: 'app/pages/ads/ads.html',
        title: 'Ads',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function AdsController($scope, $window, $location, $http, $rootScope, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements?count=10&token=' + token + "&offset=" + 10 * $scope.currentPage,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.ads = response.data.ads;
          $scope.total = response.data.total;
          if ($scope.total > 0 && $scope.ads.length == 0 && $scope.currentPage > 0) {
            $scope.OnPage($scope.currentPage - 1);
            return;
          }
          for (var i = 0; i < $scope.ads.length; i++) {
            $scope.ads[i].opened = ($scope.ads[i].opened == 1);
            $scope.ads[i].post_time = new Date($scope.ads[i].post_time).toLocaleDateString();
          }
        } else {
          $scope.result = response.data.err;
          console.log(response.data.err);
        }
      });
    }
    var user = JSON.parse($window.localStorage.getItem("user"));
    $scope.currentPage = 0;
    if (user == null || user == undefined) {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    $rootScope.budget = user.budget;
    $scope.isAdmin = (user.type == 1);
    //console.log("budget", $scope.budget);
    $scope.OnPage(0);
    $scope.GoEdit = function (ad_id) {
      $rootScope.selectedId = $scope.ads[ad_id].post_id;
      $location.path("/#/edit");
      return;
    }
    $scope.OnOpen = function (ad_id, val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/' + $scope.ads[ad_id].post_id + '/' + os + '?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0)
          toastr.success("Successfully " + os);
        else {
          toastr.error(response.data.err, "Error when open/close");
          $scope.OnPage(-1);
        }
      });
    }
    $scope.GoDelete = function (ad_id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/advertisements/' + $scope.ads[ad_id].post_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Ad is removed.");
        } else {
          toastr.error(response.data.err, 'Delete');
        }
      });
    }
    $scope.GoView = function (ad_id) {
      $rootScope.selectedId = $scope.ads[ad_id].post_id;
      $location.path("/view/" + $rootScope.selectedId);     //$location.path("/view/-1");
    }
  }
})();