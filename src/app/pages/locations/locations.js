(function () {
  'use strict';

  angular.module('BlurAdmin.pages.locations', [])
    .config(routeConfig).controller('LocationsController', LocationsController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('locations', {
        url: '/locations',
        templateUrl: 'app/pages/locations/locations.html',
        title: 'Locations',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function LocationsController($scope, $window, $location, $http, $rootScope, $uibModal, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "GET",
        url: 'https://localhost:3009/locations',
      }).then(function (response) {
        $scope.locations = response.data.locations;
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
    //console.log("budget", $scope.budget);
    $scope.OnPage(0);
    $scope.OpenWindow = function(page, size, id) {   //=0
      $scope.newName = $scope.locations[id].state_name;
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
    $scope.CreateNewState = function(newStateName) {
      if (newStateName == undefined || newStateName == '')
        return;
      var state_slug = newStateName.toLowerCase().replace(/[\s\\,]/g, "-");
      $http({
        method: "POST",
        url: 'https://localhost:3009/locations/addstate',
        data: { state_name: newStateName,
          state_slug: state_slug,
          token: token},
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("New State is created");
        } else
          toastr.error(response.data.err, "Create Error");
      });
    };
    $scope.CreateNewCity = function(state_id, newCityName) {
      if (newCityName == undefined || newCityName == '')
        return;
      var city_slug = newCityName.toLowerCase().replace(/[\s\\,]/g, "-");
      $http({
        method: "POST",
        url: 'https://localhost:3009/locations/addcity',
        data: { city_name: newCityName,
          city_slug: city_slug,
          state_id: $scope.locations[state_id].state_id,
          token: token},
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("New city is created");
        } else
          toastr.error(response.data.err, "Create Error");
      });
    };
    $scope.DeleteState = function(state_id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/locations/state/' + state_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("State is removed.");
        } else {
          toastr.error(response.data.err, 'Delete');
        }
      });
    }
    $scope.DeleteCity = function(city_id) {
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/locations/city/' + city_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("City is removed.");
        } else {
          toastr.error(response.data.err, 'Delete');
        }
      });
    }
    $scope.ChangeCredit = function(city_id, new_data) {
      var val = parseFloat(new_data);
      if (val <= 0)
        return "Input positive number";
      var data = {};
      data.token = token;
      data.city_id = city_id;
      data.val = new_data;
      $http({
        method: "POST",
        url: 'https://localhost:3009/locations/setCredit/',
        data: data,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Credit is changed.");
          return val;
        } else {
          console.log("Error");
        }
      });
    }
    $scope.ChangePos = function(mode, city_id, new_data) {
      var val = parseFloat(new_data);
      if (isNaN(val) || val < -180 || val > 180) return "Input valid float number(-180~180)";
      if (mode == 0 && (val < -90 || val > 90)) return "Input valid float number(-90~90)";
      var data = {};
      data.token = token;
      data.city_id = city_id;
      if (mode == 0)
        data.lat = val;
      else
        data.lng = val;
      $http({
        method: "POST",
        url: 'https://localhost:3009/locations/setPosition/',
        data: data,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Lat/Lng is changed.");
          return val;
        } else {
          toastr.error(response.data.err, 'Position');
        }
      });
    }
  }
})();