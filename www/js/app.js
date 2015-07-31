/*
 * Copyright (C) 2015 uClass Developers Daniel Holm & Adam Jacobs Feldstein
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'eter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'eter.services' is found in services.js
// 'eter.controllers' is found in controllers.js
angular.module('eter', ['ionic', 'eter.controllers', 'eter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.start', {
    url: '/start',
    views: {
      'tab-start': {
        templateUrl: 'templates/tab-start.html',
        controller: 'StartCtrl'
      }
    }
  })
  .state('tab.start-detail', {
      url: '/start/:pid',
      views: {
        'tab-start': {
          templateUrl: 'templates/start-detail.html',
          controller: 'GuidesDetailCtrl'
        }
      }
    })

  .state('tab.guides', {
      url: '/guides',
      views: {
        'tab-guides': {
          templateUrl: 'templates/tab-guides.html',
          controller: 'GuidesCtrl'
        }
      }
    })
    .state('tab.guides-detail', {
      url: '/guides/:pid',
      views: {
        'tab-guides': {
          templateUrl: 'templates/guides-detail.html',
          controller: 'GuidesDetailCtrl'
        }
      }
    })

  .state('tab.courses', {
    url: '/courses',
    views: {
      'tab-courses': {
        templateUrl: 'templates/tab-courses.html',
        controller: 'CoursesCtrl'
      }
    }
  })
  .state('tab.courses-detail', {
      url: '/courses/:pid',
      views: {
        'tab-courses': {
          templateUrl: 'templates/courses-detail.html',
          controller: 'GuidesDetailCtrl'
        }
      }
    })

  .state('tab.eter', {
    url: '/eter',
    views: {
      'tab-eter': {
        templateUrl: 'templates/tab-eter.html',
        controller: 'EterCtrl'
      }
    }
  })
  .state('tab.eter-detail', {
      url: '/eter/:eterId',
      views: {
        'tab-eter': {
          templateUrl: 'templates/eter-detail.html',
          controller: 'EterDetailCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/start');

});
