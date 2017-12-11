(function () {
  'use strict';

  angular.module('BlurAdmin.pages.step4', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('step4', {
          url: '/step4',
          templateUrl: 'app/pages/step4/step4.html',
          title: 'Step 4',
          sidebarMeta: {
            order: 1,
          },
        });
  }

})();