(function () {
  'use strict';

  angular.module('BlurAdmin.pages.step2', [])
      .config(routeConfig).controller('Step2Controller', Step2Controller);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider.state('step2', {
      url: '/step2',
      templateUrl: 'app/pages/step2/step2.html',
      title: 'Step 2',
      sidebarMeta: {
        order: 1,
      },
    });
  }
  
  function Step2Controller($scope, $window, $rootScope, $location, $http, $timeout, toastr) {
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    if (user == null || user == undefined) {
      //$location.path("/login");
      return;
    }
    var token = user.token;
    // https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyCVJcNmGMvum9Hlv5Xl86Pwh1S5nkkdnho
    $http({
      method: "GET",
      url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId,
    }).then(function (response) {
      console.log(response.data);
      if (response.data.ret == 0) {
        $scope.ad = response.data.ad;
        $scope.ad.opened = ($scope.ad.opened == 1);
        $scope.ad.post_time = new Date($scope.ad.post_time).toLocaleDateString();
        $scope.ad.repost_time = new Date($scope.ad.repost_time).toLocaleDateString();
        $timeout(function(){initialize();}, 100);
      } else
        console.log(response.data);
    });
    $scope.OnOpen = function (val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/' + os + '?token=' + token,
      }).then(function (response) {
        if (response.data.ret == 0)
          toastr.success("Successfully " + os);
        else
          toastr.error(response.data.err, "Error when open/close");
      });
    };
    function initialize() {
      L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';
      var map = L.map(document.getElementById('leaflet-map')).setView([$scope.ad.latitude, $scope.ad.longitude], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      var marker = L.marker([$scope.ad.latitude, $scope.ad.longitude], {draggable: true});
      marker.addTo(map).bindPopup('Drag and drop this point to set correct location.').openPopup();
      marker.on('dragend', function(e) {
        $http({
          method: "GET",
          url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/updatePos?token=' + token + '&latitude=' + e.target._latlng.lat + '&longitude=' + e.target._latlng.lng,
        }).then(function (response) {
          if (response.data.ret == 0) {
            toastr.success("Position is updated");
          } else
            toastr.error(response.data.err, "Error set position");
        });
      })
    }
  }
})();