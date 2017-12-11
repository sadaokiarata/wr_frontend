(function () {
  'use strict';

  angular.module('BlurAdmin.pages.categories', [])
    .config(routeConfig).controller('CategoriesController', CategoriesController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('categories', {
        url: '/categories',
        templateUrl: 'app/pages/categories/categories.html',
        title: 'Categories',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function CategoriesController($scope, $window, $location, $http, $rootScope, $uibModal, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "GET",
        url: 'https://localhost:3009/categories?count=10&&offset=' + 10 * $scope.currentPage,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.categories = response.data.categories;
          $scope.total = response.data.total;
          if ($scope.total > 0 && $scope.categories.length == 0 && $scope.currentPage > 0) {
            $scope.OnPage($scope.currentPage - 1);
            return;
          }
        } else {
          toastr.warning(response.data.err, "Warning");
        }
      });
    }
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    
    $scope.currentPage = 0;
    if (user == null || user == undefined) {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    $scope.premium_price = user.premium_price;
    if (token == undefined || token == null || token == "null") {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    $scope.budget = user.budget;
    $scope.OnPage(-1);
    $scope.selectedId = 0;
    $scope.GoEdit = function (cat_id) {
      $rootScope.selectedId = $scope.categories[cat_id].post_id;
      $location.path("/edit");
    }
    $scope.OnOpen = function (cat_id, val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/categories/' + $scope.categories[cat_id].category_id + '/' + os + '?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0)
          toastr.success("Successfully " + os);
        else
          toastr.error(response.data.err, "Error when open/close");
      });
    }
    $scope.GoDelete = function (cat_id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/categories/' + $scope.categories[cat_id].category_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Category is removed");
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
    $scope.OpenWindow = function (page, size, id) {   //=0
      $scope.newName = $scope.categories[id].category_name;
      $scope.selectedId = id;
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        //controller: CategoriesController,
        //controllerAs: 'ctrl',
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    };
    $scope.CreateNew = function (newName) {
      if (newName == undefined || newName == '')
        return;
      $http({
        method: "POST",
        url: 'https://localhost:3009/categories/',
        data: { category_name: newName, token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("New category is created");
        } else
          toastr.error(response.data.err, "Create Error");
      });
    };
    $scope.ChangeCredit = function(category_id, new_data) {
      var val = parseFloat(new_data);
      if (val <= 0)
        return "Input positive number";
      var data = {};
      data.token = token;
      data.val = new_data;
      console.log("change credit");
      $http({
        method: "POST",
        url: 'https://localhost:3009/categories/' + category_id + '/credit',
        data: data,
      }).then(function (response) {
        console.log("change credit2");
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Credit is changed.");
          return val;
        } else {
          console.log("Error");
        }
      });
    }
    $scope.ChangePremium = function(new_data) {
      var val = parseFloat(new_data);
      if (val <= 0)
        return "Input positive number";
      var data = {};
      data.token = token;
      data.val = new_data;
      $http({
        method: "POST",
        url: 'https://localhost:3009/settings/premium',
        data: data,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.premium_price = new_data;
          user.premium_price = new_data;
          $window.sessionStorage.setItem("user", JSON.stringify(user));
          return val;
        } else {
          console.log("Error");
        }
      });
    }
    $scope.OnRename = function (newName) {
      if (newName == undefined || newName == '') {
        toastr.warning("Invalid name", "Warning");
        return;
      }
      $http({
        method: "POST",
        url: 'https://localhost:3009/categories/' + $scope.categories[$scope.selectedId].category_id + '/rename',
        data: { category_name: newName, token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("The category is renamed");
        } else
          toastr.error(response.data.err, "Rename Error");
      });
    }
  }
})();