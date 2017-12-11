(function () {
  'use strict';

  angular.module('BlurAdmin.pages.step1', [])
    .config(routeConfig).controller('Step1Controller', Step1Controller);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider.state('step1', {
      url: '/step1',
      templateUrl: 'app/pages/step1/step1.html',
      title: 'Step 1',
      sidebarMeta: {
        order: 1,
      },
    });
  }
  function Step1Controller($scope, $window, $rootScope, $location, $http, toastr) {
    if ($rootScope.ad == undefined)
      $rootScope.ad = {};
    $rootScope.ad.show_email = 0;
    $rootScope.ad.contact_method = 1;
    $rootScope.ad.premium_open = false;
    $rootScope.ad.work_hour1 = "0";
    $rootScope.ad.work_hour2 = "0";
    $rootScope.ad.repost = false;
    $rootScope.ad.repost_interval = "1";
    $rootScope.ad.repost_count = "1";
    $rootScope.ad.premium_period = "1";
    $rootScope.ad.premium_interval = "1";
    $rootScope.ad.movetotop_times = "1";
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    $scope.premium_price = user.premium_price;
    if (user == null || user == undefined) {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      console.log("login needed1");
      //$location.path("/login");
      return;
    }
    $scope.selCategory = new Array();
    $scope.selCount = 0;
    $http({
      method: "GET",
      url: 'https://localhost:3009/categories',
    }).then(function (response) {
      $scope.categories = response.data.categories;
    });
    $("#uploadForm").submit(function (event) {
      event.preventDefault();
      for (var k = 0; k <= 4; k++) {
        console.log(k);
        var data = new FormData();
        if (k == 0) {
          jQuery.each(jQuery('#imgProfile')[0].files, function(i, file) {
              data.append('profile', file);
          });
        } else {
          data.append('profile', $scope.showOtherFiles[k-1]);
        }
        var formData = $(this).serialize();
        $.ajax({
          url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/upload' + k + '/',
          type: 'POST',
          data: data,
          async: false,
          cache: false,
          contentType: false,
          processData: false,
          success: function (returndata) {
            $location.path("/step2");
          },
          error: function () {
            //toastr.error("uploading failed", "Error");
            $location.path("/step2");
          }
       });
      }
      return false;
    });
    $scope.SelCategory = function(id) {
      $scope.selCategory[id] = !$scope.selCategory[id];
      if ($scope.selCategory[id])
        $scope.selCount++;
      else
        $scope.selCount--;
    }
    $scope.ShowFiles = function(event) {
      var file = event.target.files[0];
      $scope.showProfile = null;
      var reader = new FileReader();
      reader.onload = function(e) {
        $scope.$apply(function() {
          $scope.showProfile = e.target.result;
        })
      }
      reader.readAsDataURL(file);
    }
    $scope.showOthers = [];
    $scope.showOtherFiles = [];
    $scope.ShowFiles1 = function(event) {
      if ($scope.showOthers.length >= 4) {
        toastr.warning("Only 4 Files are limited");
        return;
      }
      var newCount = 4 - $scope.showOthers.length;
      var files = event.target.files;
      if (newCount > files.length)
        newCount = files.length;
      for (var i = 0; i < newCount; i++) {
        $scope.showOtherFiles.push(files[i]);
        var reader = new FileReader();
        reader.onload = function(e) {
          $scope.$apply(function() {
            $scope.showOthers.push(e.target.result);
          }) 
        }
        reader.readAsDataURL(files[i]);
      }
      angular.element("#imgOther").val(null);
    }
    $scope.GetOthers = function() {
      var res = new Array($scope.showOthers.length);
      for (var i = 0; i < res.length; i++)
        res[i] = i;
      return res;
    }
    $scope.RemoveOthers = function(idx) {
      $scope.showOthers.splice(idx, 1);
      $scope.showOtherFiles.splice(idx, 1);
      console.log($scope.showOthers.length);
    }
    $scope.postAd = function() {
      if (!$rootScope.ad.repost)
        $rootScope.ad.repost_count = 0;
      if (!$rootScope.ad.movetotop)
        $rootScope.ad.movetotop_times = 0;
      $rootScope.ad.token = user.token;
      console.log("PostAd", $rootScope.ad);
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/',
        data: $rootScope.ad,
      }).then(function (response) {
        console.log("step1" + JSON.stringify(response.data));
        if (response.data.ret == 0) {
          $rootScope.selectedId = response.data.post_id;
          $("#uploadForm").submit();
        } else {
          $scope.result = response.data.err;
        }
      });
    }
    $scope.OnOK = function () {
      console.log("Click Ok....");
      if ($scope.ad.category_name != 'Massage' && ($rootScope.ad.post_name == undefined || $rootScope.ad.post_name.length == 0)) {
        toastr.warning("Input post name with longer than 3 chars", "Warning");
        $('body').animate({ scrollTop: 0 }, 2000);
        return;
      }
      if ($rootScope.ad.post_title == undefined || $rootScope.ad.post_title.length == 0) {
        toastr.warning("Input post title with longer than 3 chars", "Warning");
        $('body').animate({ scrollTop: 0 }, 2000);
        return;
      }
      if ($rootScope.ad.post_desc == undefined || $rootScope.ad.post_desc.length == 0) {
        $('body').animate({ scrollTop: 0 }, 2000);
        toastr.warning("Input post desc with longer than 3 chars", "Warning");
        return;
      }
      if ($rootScope.ad.phone == undefined || $rootScope.ad.phone.length < 6 || !$rootScope.ad.phone.match(/^[0-9\-\+]+$/)) {
        $('body').animate({ scrollTop: 0 }, 2000);
        toastr.warning("Phone number is invalid", "Warning");
        return;
      }
      // if ($rootScope.ad.repost && parseInt($rootScope.ad.work_hour1) >= parseInt($rootScope.ad.work_hour2)) {
      //   toastr.warning("End time must be later than start time ", "Warning");
      //   return;
      // }
      $scope.postAd();
      //$scope.openCheckout();
    }
  }
})();