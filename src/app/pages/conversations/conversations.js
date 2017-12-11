(function () {
  'use strict';

  angular.module('BlurAdmin.pages.conversations', [])
    .config(routeConfig).controller('ConversationsController', ConversationsController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
      .state('conversations', {
        url: '/conversations',
        templateUrl: 'app/pages/conversations/conversations.html',
        title: 'Conversations',
        sidebarMeta: {
          order: 1,
        },
      });
  }
  function ConversationsController($scope, $window, $location, $http, $rootScope, toastr) {
    $scope.OnPage = function (page) {
      if (page != -1)
        $scope.currentPage = page;
      else
        page = $scope.currentPage;
      $http({
        method: "GET",
        url: 'https://localhost:3009/conversations/conversations?count=10&token=' + token + "&offset=" + 10 * $scope.currentPage,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.convs = response.data.convs;
          $scope.unreads = response.data.unreads;
          $scope.total = response.data.total;
          if ($scope.total > 0 && $scope.convs.length == 0 && $scope.currentPage > 0) {
            $scope.OnPage($scope.currentPage - 1);
            return;
          }
          for (var i = 0; i < $scope.convs.length; i++) {
            $scope.convs[i].ti = new Date($scope.convs[i].ti);
            $scope.convs[i].unread = false;
            for (var j = 0; j < $scope.unreads.length; j++) {
              if ($scope.convs[i].post_id == $scope.unreads[j].post_id)
                $scope.convs[i].unread = true;
            }
          }
        } else {
          $scope.convs = null;
          $scope.total = 0;
          $scope.result = response.data.err;
          toastr.error(response.data.err, "Get User Info")
          console.log("get user err", response.data);
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
    $scope.OnPage(-1);
    $scope.OnOpen = function (message_id, val) {
      var os = ((val == 0)? 'close': 'open');
      $http({
        method: "GET",
        url: 'https://localhost:3009/messages/' + $scope.messages[message_id].message_id + '/' + os + '?token=' + token,
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
      console.log("GoDelete", id, $scope.messages[id].message_id);
      $http({
        method: "DELETE",
        url: 'https://localhost:3009/messages/' + $scope.messages[id].message_id + '?token=' + token,
        data: { token: token },
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.OnPage(-1);
          toastr.success("Message is removed!");
        } else
          toastr.error(response.data.err, "Delete");
      });
    }
  }
})();