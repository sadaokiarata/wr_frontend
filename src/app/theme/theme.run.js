/**
 * @author v.lugovksy
 * created on 15.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme')
    .run(themeRun);

  /** @ngInject */
  function themeRun($timeout, $rootScope, layoutPaths, preloader, $q, baSidebarService, themeLayoutSettings, editableOptions) {
    editableOptions.theme = 'bs3';
    var whatToWait = [
      preloader.loadAmCharts(),
      $timeout(50)
    ];

    var theme = themeLayoutSettings;
    if (theme.blur) {
      if (theme.mobile) {
        //whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg-mobile.jpg'));
      } else {
        //whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg.jpg'));
        //whatToWait.unshift(preloader.loadImg(layoutPaths.images.root + 'blur-bg-blurred.jpg'));
      }
    }

    $q.all(whatToWait).then(function () {
      $rootScope.$pageFinishedLoading = true;
    });

    $timeout(function () {
      if (!$rootScope.$pageFinishedLoading) {
        $rootScope.$pageFinishedLoading = true;
      }
    }, 50);

    $rootScope.$baSidebarService = baSidebarService;
  }

})();