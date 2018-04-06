(function () {
  'use strict';

  angular.module('BlurAdmin.pages.reports', [])
    .config(routeConfig).controller('ReportsController', ReportsController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('reports', {
        url: '/reports',
        templateUrl: 'app/pages/reports/reports.html',
        title: 'Reports',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function ReportsController($scope, $window, $location, $http, $rootScope, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "GET",
        url: 'https://localhost:3009/reports?count=10&token=' + token + "&offset=" + 10 * $scope.currentPage,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.reports = response.data.reports;
          $scope.total = response.data.total;
          console.log(response.data.reports);
          if ($scope.total > 0 && $scope.reports.length == 0 && $scope.currentPage > 0) {
            $scope.OnPage($scope.currentPage - 1);
            return;
          }
          for (var i = 0; i < $scope.reports.length; i++) {
            $scope.reports[i].read_already = ($scope.reports[i].read_already == 1);
            $scope.reports[i].report_time = new Date($scope.reports[i].report_time);
          }
        } else {
          $scope.reports = null;
          $scope.total = 0;
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Get User Info")
          console.log("get user err", response.data);
        }
      });
    }
    var user = JSON.parse($window.localStorage.getItem("user"));
    $scope.currentPage = 0;
    // console.log("dsfasdf", user);
    if (user == null || user == undefined) {
      console.log("user login needed");
      //$location.path("/login");
      return;
    } else if (user.group_id <= 0) {
      $location.path("/myads");
      return;
    }
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      console.log("user login needed1");
      //$location.path("/login");
      return;
    }
    $scope.budget = user.budget;
    $scope.OnPage(-1);
    $scope.OnOpen = function (report_id, val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/reports/' + $scope.reports[report_id].report_id + '/' + os + '?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0)
          toastr.success("Successfully " + os);
        else {
          toastr.error(response.data.err, "Error when read/unread");
          $scope.OnPage(-1);
        }
      });
    }
    $scope.GoDelete = function (id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/reports/' + $scope.reports[id].report_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Report is removed!");
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
  }
})();