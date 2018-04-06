(function () {
  'use strict';

  angular.module('BlurAdmin.pages.view', [])
      .config(routeConfig).controller('ViewController', ViewController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('view', {
          url: '/view/:post_id',
          templateUrl: 'app/pages/view/view.html',
          title: 'View',
          sidebarMeta: {
            order: 1,
          },
        });
  }
  var dataStream;
  function ViewController($scope, $window, $rootScope, $location, $http, $timeout, $uibModal, $stateParams, $interval, $websocket, toastr) {
    var user = JSON.parse($window.localStorage.getItem("user"));
    console.log("aaa", $stateParams);
    setInterval(function() {
      if ((dataStream == undefined || dataStream.readyState != 1) && user != undefined) {
        dataStream = undefined;
        dataStream = $websocket("ws://localhost:30090/" + user.token);
        dataStream.onMessage(function(message) {
          console.log(message);
          callAtInterval();
        });
        console.log("dataStream", dataStream);
        dataStream.onClose(function() {
          dataStream = undefined;
        });
        dataStream.onError(function() {
          dataStream.close();
          dataStream = undefined;
        });
      }
    }, 3000);
    if (user != undefined && user != null) {
      $scope.user_id = user.user_id;
      //$interval(callAtInterval, 5000);
    } else {
      $scope.user_id = null;
    }
    function callAtInterval() {
      $http({
        method: "GET",
        url: 'https://localhost:3009/conversations/contacts?post_id=' + $rootScope.selectedId + '&token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.contacts = response.data.contacts;
          if ($scope.contact_id != undefined && $scope.contact_id != null) {
            $scope.GetConversation($scope.contact_id);
          } else if ($scope.contacts.length > 0) {
            $scope.contact_id = $scope.contacts[0].user_id;
          }
        }
      });
      // getConversations();
    }
    function getConversations() {
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
    $(document).ready(function() {
      $('#content').keypress(function(e) {
        if (e.keyCode == 13) {
          $scope.OnSend($("#content").val());
          $("#content").val("");
        }
      });
    });
    $stateParams.post_id = parseInt($stateParams.post_id);
    $scope.content = '';
    if ($stateParams.post_id != undefined && $stateParams.post_id != -1)
      $rootScope.selectedId = $stateParams.post_id;
    $http({
      method: "GET",
      url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId,
    }).then(function (response) {
      if (response.data.ret == 0) {
        $scope.ad = response.data.ad;
        $scope.ad.opened = ($scope.ad.opened == 1);
        $scope.ad.repost_time = new Date($scope.ad.repost_time).toLocaleString();
        $scope.ad.post_time = new Date($scope.ad.post_time).toLocaleString();
        if ($scope.ad.url != null && $scope.ad.url != undefined && !$scope.ad.url.startsWith("http")) {
          $scope.ad.url = "http://" + $scope.ad.url;
        }
        $timeout(function(){initialize();}, 100);
        if ($scope.user_id == $scope.ad.user_id) {    // ad poster
          $http({
            method: "GET",
            url: 'https://localhost:3009/conversations/contacts?post_id=' + $rootScope.selectedId + '&token=' + user.token,
          }).then(function (response) {
            if (response.data.ret == 0) {
              $scope.contacts = response.data.contacts;
            }
          });
        } else if ($scope.user_id != null) {
          $scope.GetConversation($scope.user_id);
        }
      } else
        console.log(response.data);
    });
    $http({
      method: "GET",
      url: 'https://localhost:3009/locations',
    }).then(function (response) {
      //$window.localStorage.setItem("locations", JSON.stringify());
      $scope.locations = response.data.locations;
    });
    if (user != undefined && user != null && $rootScope.selectedId != undefined) {
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/messages?token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          $scope.messages = response.data.messages;
          for (var i = 0; i < $scope.messages.length; i++) {
            $scope.messages[i].message_time = new Date($scope.messages[i].message_time);
          }
        } else
          toastr.error(response.data.err, "Get Messages Err");
      });
    }
    $scope.SelLocation = function() {
      $rootScope.prev = 10;
      $location.path('/sellocation');
    }
    $scope.SelCity = function () {
      var stateid, cityid;
      for (var i = 0; i < $scope.locations.length; i++) {
        if ($scope.locations[i].state_id == $scope.ad.state_id) {
          stateid = i;
          for (var j = 0; j < $scope.locations[i].cities.length; j++) {
            if ($scope.locations[i].cities[j].city_id == $scope.ad.city_id) {
              cityid = j;
              break;
            }
          }
          break;
        }
      }
    $location.path("/home/" + $scope.locations[stateid].state_slug + "_" + $scope.locations[stateid].cities[cityid].city_slug + "/als");
    }
    $scope.OnClose = function () {
      $window.history.back();
    }
    $scope.OnOpen = function (val) {
      var os = ((val == 0)? 'close': 'open');
      var token = user.token;
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/' + os + '?token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          //toastr.success("Successfully " + os);
        } else
          toastr.error(response.data.err, "Error when open/close");
      });
    }
    $scope.OnReport = function(report_content) {
      var token;
      if (user != undefined && user != null)
        token = user.token;
      else
        token = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/report',
        data: {
          post_id: $rootScope.selectedId,
          report_content: report_content,
          token: token,
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          //toastr.success("Reported successfully!");
        } else {
          $scope.ad.opened = false;
        }
      });
    }
    $scope.ShowMessage = function() {
      if (user != undefined && user != null) {
        console.log(user);
        $('html, body').animate({ scrollTop: $(document).height() }, 2000);
      } else {
        toastr.warning("You must log in to message.");
      }
    }
    $scope.OnMessage = function(message_content) {
      var token;
      if (user != undefined && user != null)
        token = user.token;
      else
        token = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/message',
        data: {
          post_id: $rootScope.selectedId,
          message_content: message_content,
          token: token,
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          //toastr.success("Message sent successfully!");
        } else {
          $scope.ad.opened = false;
        }
      });
    }
    $scope.OnShare = function(email_to, email_content) {
      var token;
      if (user != undefined && user != null)
        token = user.token;
      else {
        token = "";
        toastr.warning("You must log in to share.");
      }
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/share',
        data: {
          post_id: $rootScope.selectedId,
          email_to: email_to,
          email_content: email_content,
          token: token,
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          toastr.success("Successfully shared!");
        } else {
          $scope.ad.opened = false;
        }
      });
    }
    $scope.validateEmail = function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
    $scope.convs = new Array();
    $scope.GetConversation = function(contact_id) {
      $scope.contact_id = contact_id;
      $http({
        method: "GET",
        url: 'https://localhost:3009/conversations/conv?post_id=' + $rootScope.selectedId + '&contact_id=' + contact_id + '&token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          getConversations();
          if ($scope.convs.length != response.data.convs.length) {
            $scope.convs = response.data.convs;
            for (var i = 0; i < $scope.convs.length; i++) {
              $scope.convs[i].conv_time = new Date($scope.convs[i].conv_time);
              if ($scope.user_id == $scope.ad.user_id) {
                $scope.convs[i].mine = ($scope.convs[i].conv_direction == 1);
              } else {
                $scope.convs[i].mine = ($scope.convs[i].conv_direction == 0);
              }
            }
            if ($scope.contacts != null) {
              for (var i = 0; i < $scope.contacts.length; i++) {
                if ($scope.contacts[i].user_id == contact_id) {
                  $scope.contacts[i].cnt = 0;
                  break;
                }
              }
            }
            $(".chat_area").scrollTop(30000);
          }
        } else {
          
        }
      });
    }
    $scope.OnSend = function(content) {
      if (content == undefined || content == '')
        return;
      $http({
        method: "GET",
        url: 'https://localhost:3009/conversations/send?post_id=' + $rootScope.selectedId + '&contact_id=' + $scope.contact_id + '&conv_content=' + content + '&token=' + user.token,
      }).then(function (response) {
        if (response.data.ret == 0) {
          console.log("OnSend");
          $scope.GetConversation($scope.contact_id);
        } else {
        }
      });
      $scope.content = '';
      $("#content").val('');
    }
    $scope.OpenShare = function(page) {
      var token;
      if (user != undefined && user != null)
        token = user.token;
      else {
        token = "";
        toastr.warning("You must log in to share.");
        return;
      }
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: 'md',
        scope: $scope,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    }
    $scope.OpenImage = function(page, imgid) {
      $scope.selectedFrame = imgid;
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: 'md',
        scope: $scope,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    }
    $scope.OpenWindow = function (page, size) {
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
    $scope.ManualRepost = function() {
      var token;
      if (user != undefined && user != null)
        token = user.token;
      else
        token = "";
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId + '/repost',
        data: {
          post_id: $rootScope.selectedId,
          token: token,
        }
      }).then(function (response) {
        if (response.data.ret == 0) {
          //toastr.success("Reposted successfully!");
          $scope.ad.opened = true;
          $scope.ad.repost_count--;
          $scope.ad.post_time = new Date(response.data.post_time).toLocaleString();;
          $scope.ad.repost_time = new Date(response.data.repost_time).toLocaleString();;
        } else {
          toastr.error(response.data.err, "Reposted failed");
          $scope.ad.repost_count = 0;
        }
      });
    }
    function initialize() {
      L.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet/dist/images';
      var map = L.map(document.getElementById('leaflet-map')).setView([$scope.ad.latitude, $scope.ad.longitude], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: false }).addTo(map);
      L.marker([$scope.ad.latitude, $scope.ad.longitude]).addTo(map).bindPopup('<img style="width:40px;height:40px;object-fit:contain" title="' + $scope.ad.post_title + '" src="https://localhost:3009/advertisements/' + $scope.ad.post_id + '/image/0">').openPopup();
    }
  }
})();
