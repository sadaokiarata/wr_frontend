'use strict';

angular.module('BlurAdmin', [
  'bw.paging',
  'ngAnimate',
  'ui.bootstrap',
  'ui.sortable',
  'ui.router',
  'ngTouch',
  'ngWebSocket',
  'toastr',
  'smart-table',
  "xeditable",
  'ui.slimscroll',
  'ngJsTree',
  'ngRoute',
  'angular-progress-button-styles',
  'angularMoment',
  'BlurAdmin.theme',
  'BlurAdmin.pages',
]).filter('floor', function() {
  return function(b) {
    return Math.floor(b);
  }
}).filter('phonefmt', function() {
  return function(phone) {
    if (phone == undefined || phone.length <= 6)
      return phone;
    return phone.substring(0, 3) + ") " + phone.substring(3, 6) + "-" + phone.substring(6);
  }
}).filter('hiddenemail', function() {
  return function(email) {
    return email.substring(0, 3) + "***";
  }
});