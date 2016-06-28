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
var eter = angular.module('eter', ['ionic', 'eter.controllers', 'eter.services', 'pascalprecht.translate']);

eter.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    //Start pushwoosh
    initPushwoosh();
    app.initialize();
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    app.openDatabase();
    app.createTable();
  });
})

eter.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $translateProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive


    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabsSidemenuController'
  })

  // front page
    .state('front', {
    url: '/front',
    templateUrl: 'templates/front-page.html',
    controller: 'FrontCtrl'
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
    url: '/guide/:category',
    views: {
      'tab-guides': {
        templateUrl: 'templates/tab-guides.html',
        controller: 'GuidesCtrl'
      }
    }
  })
    .state('tab.guides-detail', {
    url: '/guides/:pid/:postType/',
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
    url: '/courses/:pid/:postType/:inCourse/:courseName/:courseSlug',
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



  $translateProvider.translations("ENG", {
    START_TITLE: 'Start',
    GUIDES_TITLE: 'Guides',
    COURSES_TITLE: 'Courses',
    ABOUT_TITLE: 'About & Support',
    NAV_BACK: 'Go back',
    NAV_BACK_COURSES: 'All Courses',
    GUIDES_SLIDEOUT_LATEST: 'Latest',
    GUIDES_SLIDEOUT_CATEGORIES: 'Categories',
    GUIDES_SLIDEOUT_NOTREAD: 'Non-read',
    GUIDES_SLIDEOUT_TEACHERS: 'Teachers',
    GUIDES_SLIDEOUT_HISTORY: 'History',
    GUIDES_SLIDEOUT_SEARCH: 'SEARCH',
    COURSES_HEADER: "All Courses",
    COURSE_SUBHEADER: "Course Elements",
    OTO_APP_NAME: "The OTO-app",
    OTO_APP_PRESENTATION: "The OTO-app (One-To-One) was created by the uClass developers: Adam Feldstein Jacobs and Daniel Holm.",
    READ_MORE_UCLASS: "Find out more about uClass.",
    FORM_CONTACT: "Contact",
    FORM_NAME: "Your name",
    FORM_SCHOOL_MAIL: "School mail",
    FORM_OPINIONS: "Opinions (Must be filled in)",
    FORM_TYPE_OF_OPINION: "What is the message about?",
    FORM_TYPE_OPINION: "Opinion on app",
    FORM_TYPE_GUIDE: "Guide suggestion",
    FORM_TYPE_OTHER: "Other suggestion",
    FORM_SEND: "Send message"
  })
    .translations("SWE", {
    START_TITLE: 'Start',
    GUIDES_TITLE: 'Guider',
    COURSES_TITLE: 'Kurser',
    ABOUT_TITLE: 'Om & support',
    NAV_BACK: 'Bakåt',
    NAV_BACK_COURSES: 'Alla Kurser',
    GUIDES_SLIDEOUT_LATEST: 'Senaste',
    GUIDES_SLIDEOUT_CATEGORIES: 'Kategorier',
    GUIDES_SLIDEOUT_NOTREAD: 'Oläst',
    GUIDES_SLIDEOUT_TEACHERS: 'Lärare',
    GUIDES_SLIDEOUT_HISTORY: 'Historik',
    GUIDES_SLIDEOUT_SEARCH: 'SÖK',
    COURSES_HEADER: "Alla kurser",
    COURSE_SUBHEADER: "Kursmoment",
    OTO_APP_NAME: 'OTO-appen',
    OTO_APP_PRESENTATION: "OTO-appen (One-To-One) är skapad utav uClass Developers Daniel Holm och Adam Feldstein Jacobs.",
    READ_MORE_UCLASS: "Läs mer om uClass.",
    FORM_CONTACT: "Kontakt",
    FORM_NAME: "Ditt namn",
    FORM_SCHOOL_MAIL: "Din skolmail",
    FORM_OPINIONS: "Synpunkter (måste anges)",
    FORM_TYPE_OF_OPINION: "Vad gäller din synpunkt?",
    FORM_TYPE_OPINION: "Synpunkt på appen",
    FORM_TYPE_GUIDE: "Behov av ny guide",
    FORM_TYPE_OTHER: "Annat förslag",
    FORM_SEND: "Skicka meddelande"
  });

  // Set language
  $.getJSON( "http://eter.rudbeck.info//eter-app-api/?apikey=vV85LEH2cUJjshrFx5&oto_directory=1", function( response ) {
    console.log("lang get request complete");
    $.each( response.oto_directory, function( key, schoolObj ) {
      app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM schoolinfo", [], function(tx, rs) {
          var row;
          var rowlength = rs.rows.length;
          if(rowlength > 0) {
            for (var i = 0; i < rowlength; i++) {
              row = rs.rows.item(i);
              if(row.otoid == schoolObj.school_id) {
                var language = schoolObj.lang;
                $translateProvider.use(language);
              }
            }
          } else {
            console.log("no school selected");
          }
        }, app.onError);
      });
    });
  });
  //set default preferred lang
  $translateProvider.preferredLanguage("ENG");
}]);
