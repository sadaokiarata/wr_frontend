/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .controller('MsgCenterCtrl', MsgCenterCtrl);

  /** @ngInject */
  function MsgCenterCtrl($scope, $rootScope, $http, $location, $window, $sce) {
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    $scope.currentPage = 0;
    // console.log("dsfasdf", user);
    if (user == null || user == undefined) {
      console.log("user login needed");
      //$location.path("/login");
      return;
    }
    var token = user.token;
    if (token == undefined || token == null || token == "null") {
      console.log("user login needed1");
      //$location.path("/login");
      return;
    }
    $scope.OpenConv = function (post_id) {
      console.log(post_id);
      $location.path("/view/" + post_id);
    }
    $scope.OnRefresh = function () {
      $http({
        method: "GET",
        url: 'https://localhost:3009/reports/unread?count=5&token=' + token + "&offset=0",
      }).then(function (response) {
        $scope.total = response.data.total;
        $scope.reports = response.data.reports;
        for (var i = 0; i < $scope.reports.length; i++)
          $scope.reports[i].report_time = new Date($scope.reports[i].report_time);
      });
      $http({
        method: "GET",
        url: 'https://localhost:3009/conversations/conversations?token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          console.log(response.data);
          $rootScope.conversations = response.data.convs;
          $rootScope.unreads = response.data.unreads;
          for (var i = 0; i < $rootScope.unreads.length; i++) {
            $rootScope.unreads[i].ti = new Date($rootScope.unreads[i].ti);
          }
        }
      });
    }
    $scope.ReadAll = function() {
      
    }
    $scope.OnRefresh();
    $scope.users = {
      0: {
        name: 'Vlad',
      },
      1: {
        name: 'Kostya',
      },
      2: {
        name: 'Andrey',
      },
      3: {
        name: 'Nasta',
      }
    };

    $scope.reports = [
      {
        userId: 0,
        template: '&name posted a new article.',
        time: '1 min ago'
      },
      {
        userId: 1,
        template: '&name changed his contact information.',
        time: '2 hrs ago'
      },
      {
        image: 'assets/img/shopping-cart.svg',
        template: 'New orders received.',
        time: '5 hrs ago'
      },
      {
        userId: 2,
        template: '&name replied to your comment.',
        time: '1 day ago'
      },
      {
        userId: 3,
        template: 'Today is &name\'s birthday.',
        time: '2 days ago'
      },
      {
        image: 'assets/img/comments.svg',
        template: 'New comments on your post.',
        time: '3 days ago'
      },
      {
        userId: 1,
        template: '&name invited you to join the event.',
        time: '1 week ago'
      }
    ];

    $scope.messages = [
      {
        userId: 3,
        text: 'After you get up and running, you can place Font Awesome icons just about...',
        time: '1 min ago'
      },
      {
        userId: 0,
        text: 'You asked, Font Awesome delivers with 40 shiny new icons in version 4.2.',
        time: '2 hrs ago'
      },
      {
        userId: 1,
        text: 'Want to request new icons? Here\'s how. Need vectors or want to use on the...',
        time: '10 hrs ago'
      },
      {
        userId: 2,
        text: 'Explore your passions and discover new ones by getting involved. Stretch your...',
        time: '1 day ago'
      },
      {
        userId: 3,
        text: 'Get to know who we are - from the inside out. From our history and culture, to the...',
        time: '1 day ago'
      },
      {
        userId: 1,
        text: 'Need some support to reach your goals? Apply for scholarships across a variety of...',
        time: '2 days ago'
      },
      {
        userId: 0,
        text: 'Wrap the dropdown\'s trigger and the dropdown menu within .dropdown, or...',
        time: '1 week ago'
      }
    ];

    $scope.getMessage = function(msg) {
      var text = msg.template;
      if (msg.userId || msg.userId === 0) {
        text = text.replace('&name', '<strong>' + $scope.users[msg.userId].name + '</strong>');
      }
      return $sce.trustAsHtml(text);
    };
  }
})();