/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop($window, $rootScope) {
    var user = JSON.parse($window.sessionStorage.getItem("user"));
    // console.log("topbar");
    var token, username;
    if (user == null) {
      token = username = null;
      $rootScope.budget = 0;
      $rootScope.logined = false;
      $rootScope.isAdmin = false;
    } else {
      username = user.username;
      $rootScope.budget = user.budget;
      $rootScope.username = username;
      $rootScope.logined = true;
      $rootScope.isAdmin = (user.type == 1);
    }    
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
    };
  }
  
})();