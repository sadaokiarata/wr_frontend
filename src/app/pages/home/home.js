(function () {
  'use strict';

  angular.module('BlurAdmin.pages.home', [])
    .config(routeConfig).controller('HomeController', HomeController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/home/:state_cityName/:categoryName',
        templateUrl: 'app/pages/home/home.html',
        title: 'Home',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function HomeController($scope, $window, $rootScope, $location, $http, $timeout, $stateParams, $uibModal, toastr) { //
    $scope.pageSize = 30;
    $scope.viewMode = 0;
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    if (user != undefined && user != null) {
      $scope.logined = true;
    }
    $scope.GotoCorrect = function() {
      var mine = $scope.mine;
      var state_cityName;
      $rootScope.prev = 10;
      if (mine != null && mine.stateid != - 1) {
        if (mine.cityid == -1) {
          if ($scope.locations[mine.stateid].cities.length == 0) {
            $location.path("/sellocation");
            return;
          } else {
            mine.cityid = 0;
          }
        }
      } else {
        $location.path("/sellocation");
        return;
      }
      state_cityName = $scope.locations[mine.stateid].state_slug + "_" + $scope.locations[mine.stateid].cities[mine.cityid].city_slug;  
      var categoryName = $scope.categories[0].category_name;
      $location.path("/home/" + state_cityName + "/" + categoryName);
      return;
    }
    $(document).ready(function() {
      $('.with-danger-addon').keypress(function(e) {
        if (e.keyCode == 13)
          $scope.OnPage(-1);
      });
    });
    $scope.OnPage = function(page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      if (user == undefined || user == null || $scope.categoryId != $scope.categories.length - 1) {
        var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        $http({method: "GET",
          url: 'https://localhost:3009/advertisements?city=' + $scope.city.city_id + '&cate=' + $scope.categories[$scope.categoryId].category_id + '&count=' + $scope.pageSize + '&offset=' + $scope.pageSize * $scope.currentPage + ($scope.searchText!=undefined?("&search=" + $scope.searchText):''),
        }).then(function (response) {
          //initialize(response.data.ads);
          $scope.ads = response.data.ads;
          $scope.total = response.data.total;
          $scope.GetPremium();
          var last_date = "";
          for (var j = 0; j < $scope.ads.length; j++) {
            var d = new Date($scope.ads[j].repost_time);
            $scope.ads[j].short_date = weekdays[d.getDay()] + " " + d.toLocaleDateString();
            if ($scope.ads[j].short_date == last_date)
              $scope.ads[j].show_date = false;
            else {
              $scope.ads[j].show_date = true;
              last_date = $scope.ads[j].short_date;
            }
          }
        });
      } else {
        $http({
          method: "GET",
          url: 'https://localhost:3009/reviews?token=' + user.token + "&offset=" + 10 * $scope.currentPage + '&city=' + $scope.city.city_id + ($scope.searchText!=undefined?("&search=" + $scope.searchText):''),
        }).then(function (response) {
          if (response.data.ret == 0) {
            $scope.reviews = response.data.reviews;
            $scope.total = response.data.total;
            for (var i = 0; i < $scope.reviews.length; i++) {
              $scope.reviews[i].review_time = new Date($scope.reviews[i].review_time).toLocaleString();
              $scope.reviews[i].sender_name = $scope.reviews[i].sender_name.substr(0, 5) + "...";
              if ($scope.reviews[i].children == undefined)
                continue;
              for (var j = 0; j < $scope.reviews[i].children.length; j++) {
                $scope.reviews[i].children[j].review_time = new Date($scope.reviews[i].children[j].review_time).toLocaleString();
              }
            }
          } else
            console.log(response.data);
        });
      }
    }
    $scope.ChangeViewMode = function(v) {
      $scope.viewMode = v;
    }
    $http({
      method: "GET",
      url: 'https://localhost:3009/categories',
    }).then(function (response) {
      $scope.categories = response.data.categories;
      if (user != undefined && user != null)
        $scope.categories.push({category_name: 'Review'});
      $http({method: "GET",
        url: 'https://localhost:3009/locations',
      }).then(function (response) {
        $scope.locations = response.data.locations;
        $scope.mine = response.data.mine;
        if ($stateParams.state_cityName == undefined || $stateParams.state_cityName == '') {
          $scope.GotoCorrect();
        } else {
          var cityId = -1;
          for (var i = 0; i < $scope.locations.length; i++) {
            if ($scope.locations[i].cities == undefined)
              continue;
            for (var j = 0; j < $scope.locations[i].cities.length; j++) {
              var n = $scope.locations[i].state_slug + "_" + $scope.locations[i].cities[j].city_slug;
              if (n == $stateParams.state_cityName) {
                $scope.city = $scope.locations[i].cities[j];
                $scope.city.state_name = $scope.locations[i].state_name;
                cityId = i;
                break;
              }
            }
          }
          if (cityId == -1) {
            $scope.GotoCorrect();
            return;
          } else {
            for (var i = 0; i < $scope.categories.length; i++) {
              if ($scope.categories[i].category_name == $stateParams.categoryName) {
                $scope.categoryId = i;
                $scope.OnPage(0);
                return;
              }
            }
            $scope.SelCategory(0);//$location.path("/home/" + $stateParams.state_cityName + "/" + $scope.categories[0].category_name);
          }
        }
      });
    });
    $scope.GetPremium = function() {
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/premium?city=' + $scope.city.city_id + '&cate=' + $scope.categories[$scope.categoryId].category_id
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.premiums = response.data.premiums;
        } else {
          $scope.result = response.data.err;
          console.log(response.data.err);
        }
      });
    }
    $scope.SelCategory = function(id) {
      $location.path("/home/" + $stateParams.state_cityName + "/" + $scope.categories[id].category_name);
    }
    $scope.GoView = function (ad_id) {
      $rootScope.selectedId = ad_id;
      $location.path("/view");
    }
    $scope.SelLocation = function() {
      $rootScope.prev = 10;
      $location.path('/sellocation');
    }
    $scope.map = null;
    var markersLayer = null;
    function initialize(ads) {
      var markers = [];
      L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';
      if ($scope.map == null)
        $scope.map = L.map(document.getElementById('leaflet-map')).setView([$scope.city.latitude, $scope.city.longitude], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo($scope.map);
      for (var i = 0; i < ads.length; i++) {
        markers[i] = L.marker([ads[i].latitude, ads[i].longitude]).bindPopup('<span class="linkPost">' + ads[i].post_title + '</span><br><a href="/#/view/' + ads[i].post_id + '?">open</a>');
      }
      if (markersLayer != null)
        $scope.map.removeLayer(markersLayer);
      markersLayer = L.layerGroup(markers);
      markersLayer.addTo($scope.map);
    }
    $scope.ShowMyAccount = function() {
      console.log("Show My Account");
    }
    $scope.SendFeedback = function() {
      
    }
    $scope.OpenWindow = function(page, size, id) {   //=0
      $scope.selected = id;
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
  $scope.OnLike = function(review_id, isLike) {
    var token;
    if (user != undefined && user != null)
      token = user.token;
    else
      token = "";
    var lk;
    if ($scope.reviews[review_id].you_like && isLike)
      lk = 0;
    else if ($scope.reviews[review_id].you_dislike && !isLike)
      lk = 0;
    else if (isLike)
      lk = 1;
    else if (!isLike)
      lk = -1;
    $http({
      method: "POST",
      url: 'https://localhost:3009/reviews/like',
      data: {
        review_id: $scope.reviews[review_id].review_id,
        is_like: lk,
        token: token,
      }
    }).then(function (response) {
      if (response.data.ret == 0) {
        if (lk == 1) {
          $scope.reviews[review_id].like++;
          if ($scope.reviews[review_id].you_dislike)
            $scope.reviews[review_id].dislike--;
          $scope.reviews[review_id].you_like = true;
          $scope.reviews[review_id].you_dislike = false;
        } else if (lk == -1) {
          $scope.reviews[review_id].dislike++;
          if ($scope.reviews[review_id].you_like)
            $scope.reviews[review_id].like--;
          $scope.reviews[review_id].you_like = false;
          $scope.reviews[review_id].you_dislike = true;
        } else {
          if ($scope.reviews[review_id].you_dislike) {
            $scope.reviews[review_id].dislike--;
          } else
            $scope.reviews[review_id].like--;
          $scope.reviews[review_id].you_like = false;
          $scope.reviews[review_id].you_dislike = false;
        }
      } else {
        console.log(response.data);
      }
    });
  }
  $scope.OnReview = function (review_title, review_content) {
    var token;
    if (user != undefined && user != null)
      token = user.token;
    else
      token = "";
    $http({
      method: "POST",
      url: 'https://localhost:3009/reviews/write',
      data: {
        origin_id: $scope.selected,
        review_title: review_title,
        review_content: review_content,
        city_id: $scope.city.city_id,
        token: token,
      }
    }).then(function (response) {
      if (response.data.ret == 0) {
        //toastr.success("Review sent successfully!");
        $scope.OnPage(-1);
      } else {
        console.log(response.data);
      }
    });
  }
  $scope.DeleteReview = function(review_id) {
    var token;
    if (user != undefined && user != null)
      token = user.token;
    else
      token = "";
    $http({
      method: "DELETE",
      url: 'https://localhost:3009/reviews/' + review_id + '?token=' + token,
      data: {token: token}
    }).then(function (response) {
      if (response.data.ret == 0) {
        //toastr.success("Review sent successfully!");
        $scope.OnPage(-1);
      } else {
        console.log(response.data);
      }
    });
  }
}
})();