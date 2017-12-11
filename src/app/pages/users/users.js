(function () {
  'use strict';

  angular.module('BlurAdmin.pages.users', [])
    .config(routeConfig).controller('UsersController', UsersController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('users', {
        url: '/users',
        templateUrl: 'app/pages/users/users.html',
        title: 'Users',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function UsersController($scope, $window, $location, $http, $rootScope, $uibModal, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "POST",
        url: 'https://localhost:3009/users',
        data: {
          token: token,
          offset: 10 * $scope.currentPage,
          search: $scope.searchName
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.users = response.data.users;
          $scope.total = response.data.total;
          if ($scope.total > 0 && $scope.users.length == 0 && $scope.currentPage > 0) {
            $scope.OnPage($scope.currentPage - 1);
            return;
          }
          for (var i = 0; i < $scope.users.length; i++) {
            $scope.users[i].opened = ($scope.users[i].opened == 1);
            if ($scope.users[i].suspended != null) {
              var d = new Date($scope.users[i].suspended);
              $scope.users[i].suspended = d.toDateString();
              if (d.getFullYear() > 2030)
                $scope.users[i].suspended = "Permanently suspended";
            }
          }
        } else {
          $scope.users = null;
          $scope.total = 0;
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Get User Info")
        }
      });
    }
    var user = JSON.parse($window.sessionStorage.getItem("user"));
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

    $scope.OnOpen = function (id, val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/users/' + $scope.users[id].user_id + '/' + os + '?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          // toastr.success("Successfully " + os);
        } else
          toastr.error(response.data.err, "Error when open/close");
      });
    }
    $scope.GoDelete = function (id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/users/' + $scope.users[id].user_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          // toastr.success("User is removed!");
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
    $scope.Suspend = function(id, days) {
      $http({
        method: "GET",
        url: 'https://localhost:3009/users/' + $scope.users[id].user_id + '/suspend?days=' + days + '&token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          console.log(response.data);
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
    $scope.OpenWindow = function(page, size, id) {   //=0
      $scope.newBudget = 200;
      $scope.selectedId = id;
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    };
    $scope.AddCredit = function(amount) {
      amount *= 100;
      $http({
        method: "GET",
        url: 'https://localhost:3009/users/' + $scope.users[$scope.selectedId].user_id + '/addcredit?amount=' + amount + '&token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          console.log(response.data);
          if ($scope.users[$scope.selectedId].user_id == user.user_id) {
            user.budget += amount;
            $rootScope.budget = user.budget;
            $window.sessionStorage.setItem("user", JSON.stringify(user));
          }
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
  }
})();