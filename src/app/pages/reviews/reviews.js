(function () {
  'use strict';

  angular.module('BlurAdmin.pages.reviews', [])
    .config(routeConfig).controller('ReviewsController', ReviewsController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider.state('reviews', {
      url: '/reviews',
      templateUrl: 'app/pages/reviews/reviews.html',
      title: 'Reviews',
      sidebarMeta: {
        order: 1,
      },
    });
  }
  
  function ReviewsController($scope, $window, $rootScope, $location, $http, $timeout, $uibModal, $stateParams, toastr) {
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    $scope.currentPage = 0;
    if (user != undefined && user != null)
      $scope.user_id = user.user_id;
    $scope.OnPage = function (page) {
      if (user != undefined && user != null) {
        var token = user.token;
        if (page != -1)
          $scope.currentPage = page;
        else
          page = $scope.currentPage;
        /*if ($scope.searchText != undefined) {
          $scope.currentPage = 0;
          page = 0;
        }*/
        $http({
          method: "GET",
          url: 'https://localhost:3009/reviews?token=' + token + "&offset=" + 10 * $scope.currentPage + ($scope.searchText!=undefined?("&search=" + $scope.searchText):''),
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
    $scope.OpenWindow = function (page, size, review_id) {
      $scope.selectedReviewId = review_id;
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
    $scope.OnClose = function () {
      $window.history.back();
    }
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
          origin_id: $scope.selectedReviewId,
          review_title: review_title,
          review_content: review_content,
          token: token,
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          toastr.success("Review sent successfully!");
          $scope.OnPage(-1);
        } else {
          console.log(response.data);
        }
      });
    }
    $scope.OnPage(0);
  }
  
})();