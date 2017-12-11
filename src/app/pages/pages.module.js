/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages', [
    'ui.router',

    'BlurAdmin.pages.dashboard',
    'BlurAdmin.pages.ui',
    'BlurAdmin.pages.components',
    'BlurAdmin.pages.form',
    'BlurAdmin.pages.tables',
    'BlurAdmin.pages.charts',
    'BlurAdmin.pages.maps',
    'BlurAdmin.pages.profile',

    'BlurAdmin.pages.login',
    'BlurAdmin.pages.logout',
    'BlurAdmin.pages.budget',
    'BlurAdmin.pages.verify',
    'BlurAdmin.pages.forget',
    'BlurAdmin.pages.register',
    'BlurAdmin.pages.register2',
    'BlurAdmin.pages.changepwd',
    'BlurAdmin.pages.changepwd2',
    'BlurAdmin.pages.postad',
    'BlurAdmin.pages.sellocation',
    'BlurAdmin.pages.myads',
    'BlurAdmin.pages.selcategory',
    'BlurAdmin.pages.step1',
    'BlurAdmin.pages.step2',
    'BlurAdmin.pages.step3',
    'BlurAdmin.pages.step4',
    'BlurAdmin.pages.edit',
    'BlurAdmin.pages.view',
    'BlurAdmin.pages.home',
    'BlurAdmin.pages.messages',
    'BlurAdmin.pages.reviews',
    'BlurAdmin.pages.conversations',
    // 4 admin
    'BlurAdmin.pages.users',
    'BlurAdmin.pages.ads',
    'BlurAdmin.pages.categories',
    'BlurAdmin.pages.reports',
    'BlurAdmin.pages.locations',
    'cp.ng.fix-image-orientation',
  ])
  .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, $routeProvider, $locationProvider, baSidebarServiceProvider, $urlMatcherFactoryProvider) {
    //$locationProvider.html5Mode(true).hashPrefix('!');
    $urlRouterProvider.otherwise('/home//');
    // $urlMatcherFactoryProvider.strictMode(false);
    baSidebarServiceProvider.addStaticItem({
      title: 'Pages',
      icon: 'ion-document',
      subMenu: [{
        title: 'Sign In',
        fixedHref: 'auth.html',
        blank: true
      }, {
        title: 'Sign Up',
        fixedHref: 'reg.html',
        blank: true
      }, {
        title: 'User Profile',
        stateRef: 'profile'
      }, {
        title: '404 Page',
        fixedHref: '404.html',
        blank: true
      }]
    });
    baSidebarServiceProvider.addStaticItem({
      title: 'Menu Level 1',
      icon: 'ion-ios-more',
      subMenu: [{
        title: 'Menu Level 1.1',
        disabled: true
      }, {
        title: 'Menu Level 1.2',
        subMenu: [{
          title: 'Menu Level 1.2.1',
          disabled: true
        }]
      }]
    });
  }

})();
