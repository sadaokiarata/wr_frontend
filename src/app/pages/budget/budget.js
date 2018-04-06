(function () {
  'use strict';

  angular.module('BlurAdmin.pages.budget', [])
      .config(routeConfig).controller('BudgetController', BudgetController);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider.state('budget', {
      url: '/budget',
      templateUrl: 'app/pages/budget/budget.html',
      title: 'Budget',
      sidebarMeta: {
        order: 1,
      },
    });
  }

  function BudgetController($scope, $rootScope, $http, $location, $window, toastr) {  
    var user = JSON.parse($window.localStorage.getItem("user"));
    $scope.currentPage = 0;
    if (user == null || user == undefined) {
      console.log("login needed1");
      return;
    }
    $rootScope.budget = user.budget;
    $scope.OnReceiveToken = function(token, args) {
      $http({
        method: "POST",
        url: 'https://localhost:3009/users/pay',
        data: {
          st_token: token,
          token: user.token,
          amount: $scope.amount * 100,
        }
      }).then(function (response) {
        if (response.data.ret != -1) {
          $rootScope.budget = response.data.budget;
          user.budget = $rootScope.budget;
          $window.localStorage.setItem("user", JSON.stringify(user));
          $scope.amount = 0;
          $location.path("/budget");
        }
        $(".btn").removeAttr("disabled");
      });
    }
    $scope.openCheckout = function() {
      if ($scope.amount > 0) {
        $scope.result = "";
        $(".btn").attr("disabled", "disabled");
        var handler = StripeCheckout.configure({
          key: "pk_test_MEgaHpELSG001BgY2tWhtqnA",    // pk_live_q4AEb9zViJcEF5NJQ9ipoKQY   Should be changed in the future
          image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
          name: 'Whorub Inc.',
          description: 'Buy credit',
          panelLabel: 'Pay $' + $scope.amount,
          allowRememberMe: false,
          token: $scope.OnReceiveToken,
        });
        handler.open();
        $(".btn").removeAttr("disabled");
      } else {
        $scope.result = "Budget must be bigger than 0.";
      }
    }
  }
})();