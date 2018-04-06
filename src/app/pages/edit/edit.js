(function () {
  'use strict';

  angular.module('BlurAdmin.pages.edit', [])
    .config(routeConfig).controller('EditController', EditController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('edit', {
        url: '/edit',
        templateUrl: 'app/pages/edit/edit.html',
        title: 'Edit',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function EditController($scope, $window, $rootScope, $location, $http, toastr) {
    var user = JSON.parse($window.localStorage.getItem("user"));
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
    // var reader = new FileReader();
    // reader.onload = function(e) {
    //   $scope.$apply(function() {
    //     $scope.showProfile = e.target.result;
    //     console.log("asdfadsfafsd", e.target.result);
    //   })
    // }
    // //var file = new File([''], 'https://localhost:3009/advertisements/263/image/0');
    // var file = new File([''], 'https://localhost:3009/advertisements', {type: 'text/plain'});
    // reader.readAsDataURL(file);
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
    $http({
      method: "GET",
      url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '?token=' + token,
    }).then(function (response) {
      if (response.data.ret == 0) {
        $scope.ad = response.data.ad;
      } else {
        $location.path("/home//");
        return;
      }
    });
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
    $scope.OnOK = function () {
      // if ($scope.ad.category_name != 'Massage' && ($scope.ad.post_name == undefined || $scope.ad.post_name.length == 0)) {
      //   toastr.warning("Input post name with longer than 3 chars", "Warning");
      //   $('body').animate({ scrollTop: 0 }, 2000);
      //   return;
      // } else 
      if ($scope.ad.post_title == undefined || $scope.ad.post_title.length == 0) {
        $('body').animate({ scrollTop: 0 }, 2000);
        return;
      } else if ($scope.ad.post_desc == undefined || $scope.ad.post_desc.length == 0) {
        $('body').animate({ scrollTop: 0 }, 2000);
        return;
      }
      $scope.ad.token = token;
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/update',
        data: $scope.ad,
      }).then(function (response) {
        console.log(response);
        if (response.data.ret == 0) {
          $("#uploadForm").submit();
          $location.path("/myads");
        } else
          $scope.result = response.data.err;
      });
    }
  }
})();