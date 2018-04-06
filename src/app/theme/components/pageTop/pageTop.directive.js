/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components').directive('pageTop', pageTop);      
  /** @ngInject */
  function pageTop($window, $rootScope) {
    var user = JSON.parse($window.localStorage.getItem("user"));
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
      link: function(scope, element, attrs) {
        particlesJS("particles-js", {"particles":{"number":{"value":80,"density":{"enable":true,"value_area":800}},"color":{"value":"#ffffff"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":5,"random":false,"anim":{"enable":true,"speed":10,"size_min":40,"sync":false}},"line_linked":{"enable":false,"distance":400,"color":"#47a3da","opacity":1,"width":2},"move":{"enable":true,"speed":8,"direction":"none","random":false,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"grab"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});
        $('.tlt').textillate({loop: true, minDisplayTime: 1000});
      },
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
    };
  }
  
})();