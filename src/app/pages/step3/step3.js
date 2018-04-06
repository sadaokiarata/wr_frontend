(function () {
  'use strict';

  angular.module('BlurAdmin.pages.step3', [])
      .config(routeConfig).controller('Step3Controller', Step3Controller);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider.state('step3', {
      url: '/step3',
      templateUrl: 'app/pages/step3/step3.html',
      title: 'Step 3',
      sidebarMeta: {
        order: 1,
      },
    });
  }
  function Step3Controller($scope, $window, $rootScope, $location, $http, toastr) {
    var user = JSON.parse($window.localStorage.getItem("user"));
    $rootScope.budget = user.budget;
    $http({
      method: "GET",
      url: 'https://localhost:3009/locations',
    }).then(function (response) {
      $scope.locations = response.data.locations;
      console.log($scope.locations);
      //$rootScope.selectedId = 350;
      $http({
        method: "GET",
        url: 'https://localhost:3009/advertisements/' + $rootScope.selectedId,
      }).then(function (response) {
        $scope.ad = response.data.ad;
        $scope.ad.money_movetotop = 0;
        $scope.ad.money_autorepost = 0;
        $scope.ad.money_premium = 0;

        if ($scope.ad.movetotop_times != 0)
          $scope.ad.money_movetotop = 200 * $scope.ad.movetotop_times;
        if ($scope.ad.premium_open != 0)
          $scope.ad.money_premium = user.premium_price * $scope.ad.premium_period;
        if ($scope.ad.repost_count != 0)
        $scope.ad.money_autorepost = 100 * $scope.ad.repost_count;
        $scope.balance = ($scope.budget - $scope.ad.money_movetotop - $scope.ad.money_autorepost - $scope.ad.money_premium - $rootScope.ad.category_credit - $rootScope.ad.city_credit);
        console.log(response.data.ad);
      });
    });
    $scope.openCheckout = function() {
      var amount = -$scope.balance / 100;
      var handler = StripeCheckout.configure({
        key: "pk_test_MEgaHpELSG001BgY2tWhtqnA",    // pk_live_q4AEb9zViJcEF5NJQ9ipoKQY   Should be changed in the future
        image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
        name: 'Whorub Inc.',
        description: 'Payment for ad post',
        panelLabel: 'Pay $' + (-$scope.balance / 100),
        allowRememberMe: false,
        token: $scope.OnReceiveToken,
      });
      handler.open({closed: function() {
        console.log("Closed");
      }});
    }
    $scope.OnReceiveToken = function(token, args) {
      var amount = -$scope.balance;
      $("#btnComplete").prop("disabled", true);
      $http({
        method: "POST",
        url: 'https://localhost:3009/advertisements/pay',
        data: {
          st_token: token,
          amount: amount,
        }
      }).then(function (response) {
        if (response.ret != -1) {
          $http({
            method: "POST",
            url: 'https://localhost:3009/users/pay',
            data: {
              token: user.token,
              amount: -$scope.budget,
              postid: $rootScope.selectedId
            }
          }).then(function (response) {
            if (response.data.ret != -1) {
              user.budget = 0;
              $rootScope.budget = 0;
              $window.localStorage.setItem("user", JSON.stringify(user));
              $location.path("/step4");
            }
          });
        } else {
          $("#btnComplete").prop("disabled", false);
        }
      });
    }
    $scope.OnOK = function() {
      if ($scope.balance >= 0) {
        user.budget = $scope.balance;
        $window.localStorage.setItem("user", JSON.stringify(user));
        $rootScope.budget = $scope.balance;
        $http({
          method: "POST",
          url: 'https://localhost:3009/users/pay',
          data: {
            token: user.token,
            amount: -($scope.ad.money_movetotop + $scope.ad.money_autorepost + $scope.ad.money_premium + $rootScope.ad.category_credit + $rootScope.ad.city_credit),
            postid: $rootScope.selectedId
          }
        }).then(function (response) {
          if (response.data.ret != -1) {
            $location.path("/step4");
          } else {
            toastr.warning("There are some problems.", "Warning");
          }
        });
        
      } else {
        $scope.openCheckout();
      }
    }
  }

})();