(function () {
  'use strict';

  angular.module('BlurAdmin.pages.register2', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('register2', {
          url: '/register2',
          templateUrl: 'app/pages/register2/register2.html',
          title: 'Register2',
          sidebarMeta: {
            order: 1,
          },
        });
  }

})();