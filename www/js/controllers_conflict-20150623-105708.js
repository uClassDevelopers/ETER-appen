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

// functions
function get_dyn_data(row, url) { // params: api url and topData or bottomData
    $http.get(url).
        success(function(data) {

        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel med en dynamiska datan! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    
    /*if(firstPageContent.topData[0].is_dyn == "1") {
        alert("top row is dynamic");
        // dynamic options
        if(firstPageContent.topData[0].dyn_content == "") { // three latest guides
            
        } else if(firstPageContent.topData[0].dyn_content == "") { // three latest courses

        }
    }

    if(firstPageContent.bottomData[0].is_dyn == "1") {
        alert("bottom row is dynamic");
    }*/
}

// modules
angular.module('eter.controllers', [])

.controller('StartCtrl', function($scope, $http) {
    $scope.loading = true;
    $scope.$on("$ionicView.beforeEnter", function() {
         app.start();
    });
    $('#start-data').html('<p style="text-align: center;"><img src="img/ajax-loader.gif"> loading...</p>');
    $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&startpage=1').
        success(function(data) {
            $('#start-data').html("");
            var firstPageContent = { 
               "sliderData":[],
               "topData":[],
               "bottomData":[]
            };

           $.each(data.startpage, function(index, obj) {
               if(obj.id <= 3) {
                   firstPageContent.topData.push(data.startpage[index]);
               } else if(obj.id > 3 && obj.id < 7) {
                   firstPageContent.bottomData.push(data.startpage[index]); 
               } else if(obj.id >= 7) {
                    firstPageContent.sliderData.push(data.startpage[index]); 
               }
            });
            //alert(JSON.stringify(firstPageContent, null, 4)); // Alert api json
            $scope.topData = firstPageContent.topData;
            $scope.bottomData = firstPageContent.bottomData;
            $scope.sliderData = firstPageContent.sliderData;
            
            
            // Dynamic data setup
            
            // Remove loader
            $scope.loading = false;
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
})
.controller('StartDetailCtrl', function($scope) {})


.controller('GuidesCtrl', function($scope, $http, $ionicSideMenuDelegate) {
    $scope.loading = true;
    $scope.$on("$ionicView.beforeEnter", function() {
     var slideout = new Slideout({
        'panel': document.getElementById('panel'),
        'menu': document.getElementById('menu'),
        'padding': 256,
        'tolerance': 70
      });
      // Toggle button
      document.querySelector('.toggle-button').addEventListener('click', function() {
        slideout.toggle();
      });
        // push to side
    });
    $http.get('http://eter.rudbeck.info/category/sjalvstudier/?json=1&count=10&apikey=ErtYnDsKATCzmuf6').
    success(function(data) {
            $scope.guides = data.posts;
            $scope.goToGuide = function(id) {
                location.href="#/tab/guides/"+id;
            }
            $scope.loading = false;
    }).
    error(function(data) {
        $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
        $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
        console.log(data);
    });
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft()
    }

    $scope.$on("$ionicView.enter", function() {
        //app.guides();
    });
})

.controller('GuidesDetailCtrl', function($scope) {
    $scope.$on("$ionicView.beforeEnter", function() {
        app.single();
    });
})


.controller('CoursesCtrl', function($scope, $http) {
    $scope.loading = true;
    $scope.$on("$ionicView.enter", function() {
        
    });
    $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&list-all-courses=1&parent=43').
    success(function(data) {
        var courses = [];
        $.each(data.list_all_courses, function(index, obj) { // loop through courses
            courses.push({ id: obj.id, name: obj.name, desc: obj.description, elements: [] });
            $.each(data.list_all_courses[index].elements, function(i, el) { // loop through elements
                courses[index].elements.push({ postid: el.id, posttitle: el.title });
            });
        });
        //alert(JSON.stringify(courses, null, 4));
        $scope.courses = courses;
        $scope.goToGuide = function(id) {
            location.href="#/tab/courses/"+id;
        }
        $scope.loading = false;
        $(".course").click(function() {
            var id = $(this).attr('id').substring(1);
            $("c" + id).slideToggle();
        });
    }).
    error(function(data) {
        $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
        console.log(data);
    });
})

.controller('CoursesDetailCtrl', function($scope) {
    $scope.$on("$ionicView.beforeEnter", function() {
        app.single();
    });
})


.controller('EterCtrl', function($scope, $http) {
    $scope.$on("$ionicView.enter", function() {
        $('#supportForm').submit(function(){
            alert('Pushed save');
            var postData = $(this).serialize();
            $.ajax({
                type: 'POST',
                data: postData,
                url: 'http://eter.rudbeck.info/support/#contact-form-425',
                success: function(data){            
                    function alertDismissed() {
                    // reload
                        location.reload();
                    }
                    // Show a custom alertDismissed
                    function showAlert() {
                        navigator.notification.alert(
                            'Tack för dina synpunkter!',  // message
                            alertDismissed,         // callback
                            'ETER Support',            // title
                            'OK'                  // buttonName
                        );
                    }
                    showAlert();
                },
                error: function(){
                    function alertDismissed() {
                    // do something
                        location.reload();
                    }
                    // Show a custom alertDismissed
                    //
                    function showAlert() {
                        navigator.notification.alert(
                            'Något fel inträffade, prova igen.',  // message
                            alertDismissed,         // callback
                            'ETER Support',            // title
                            'OK'                  // buttonName
                        );
                    }
                    showAlert();
                }
            });
            return false;
        });
    });
    
    $http.get('http://eter.rudbeck.info/om-ikt-coacher/?json=1&apikey=ErtYnDsKATCzmuf6').
        success(function(data) {
            $scope.iktCoach = data.page;
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    $http.get('http://eter.rudbeck.info/om-eter/?json=1&apikey=ErtYnDsKATCzmuf6').
        success(function(data) {
            $scope.omEter = data.page;
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    
})
.controller('EterDetailCtrl', function($scope) {})