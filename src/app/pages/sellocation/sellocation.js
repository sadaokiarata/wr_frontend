(function () {
  'use strict';

  angular.module('BlurAdmin.pages.sellocation', [])
    .config(routeConfig).controller('SelLocationController', SelLocationController);

  /** @ngInject */
  function routeConfig($stateProvider, $routeProvider) {
    $stateProvider
      .state('sellocation', {
        url: '/sellocation',
        templateUrl: 'app/pages/sellocation/sellocation.html',
        title: 'Select Location',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function SelLocationController($scope, $window, $rootScope, $location, $http) {
    /*var user = JSON.parse($window.localStorage.getItem("user"));
    if (user == null || user == undefined) {
      console.log("dfdfdf");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    //console.log("postad token", token);
    if (token == undefined || token == null || token == "null") {
      console.log("dfdfdf");
      //$location.path("/login");
      return;
    }*/
    $http({
      method: "GET",
      url: 'https://localhost:3009/locations',
    }).then(function (response) {
      //$window.localStorage.setItem("locations", JSON.stringify());
      $scope.locations = response.data.locations;
      //console.log(parseInt($scope.locations.length / 3));
      $scope.splits = new Array(3);
      $scope.splits[0] = new Array();
      $scope.splits[1] = new Array();
      $scope.splits[2] = new Array();
      $scope.splits[3] = new Array();
      var total_cities = 0;
      for (var i = 0; i < $scope.locations.length; i++) {
        total_cities += $scope.locations[i].cities.length + 3;
      }
      var cities_count = 0, curr = 0;
      for (var i = 0; i < $scope.locations.length; i++) {
        $scope.locations[i].expanded = true;
        cities_count += $scope.locations[i].cities.length + 3;
        $scope.splits[curr].push(i);
        if (cities_count < total_cities / 4)
          curr = 0;
        else if (cities_count < total_cities * 2 / 4)
          curr = 1;
        else if (cities_count < total_cities * 3 / 4)
          curr = 2;
        else
          curr = 3;
      }
    });
    
    $scope.SelectCity = function (stateid, cityid) {
      if ($rootScope.prev == 10) {
        $location.path("/home/" + $scope.locations[stateid].state_slug + "_" + $scope.locations[stateid].cities[cityid].city_slug + "/als");
      } else {
        $rootScope.ad = {};
        $rootScope.ad.stateid = stateid;
        $rootScope.ad.cityid = cityid;
        $rootScope.ad.state_name = $scope.locations[stateid].state_name;
        $rootScope.ad.city_name = $scope.locations[stateid].cities[cityid].city_name;
        $rootScope.ad.city_credit = $scope.locations[stateid].cities[cityid].credit;
        $rootScope.ad.post_city = $scope.locations[stateid].cities[cityid].city_id;
        console.log("city_credit", $rootScope.ad.city_credit);
        $rootScope.ad.latitude = (0.1 * Math.random() - 0.05) + parseFloat($scope.locations[stateid].cities[cityid].latitude);
        $rootScope.ad.longitude = (0.1 * Math.random() - 0.05) + parseFloat($scope.locations[stateid].cities[cityid].longitude);
        $location.path("/selcategory");
      }
    }
  }
})();