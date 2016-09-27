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

/*******************************************/
// GLOBAL CONFIG VARIABLES
/********************************************/
//Set to secret api keys before release
var apikey = "?apikey=vV85LEH2cUJjshrFx5";
var p_apikey ="apikey=ErtYnDsKATCzmuf6";
//ETER baseUrl
var baseUrl = "http://eter.rudbeck.info/";

// Custom uClassFunctions
// startsWith function needed for browsers with webkit
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

// replace all outbound links with a number sign, add a onklick event with the old url. The onklick event opens the old url in cordova inappbrowser.
function fixCordovaOutboundLinks() {
  var allElements = document.getElementsByTagName('a');
  for (var i = 0, n = allElements.length; i < n; i++) {
    var url = allElements[i].getAttribute('href');
    if(url != null) {
      if(url.startsWith("http")) {
        //allElements[i].innerHTML= ".....";
        function clickHandler(index) {
          allElements[index].onclick = function(event) {
            event.preventDefault();
            var a_url = allElements[index].getAttribute('href');
            //alert('URL opens: ' + a_url);
            var ref = window.open(a_url, '_system', 'location=yes');
          };
        }
        clickHandler(i);
      }
    }
  }
}
//Make sure that videos can be played in app via a button
function fixCordovaYoutubePlayers() {
  var allElements = document.getElementsByTagName('iframe');
  for (var i = 0, n = allElements.length; i < n; i++) {
    var url = allElements[i].getAttribute('src');
    if(url != null) {
      if(url.startsWith("http")) {
        if($('.youtube-player').length) {
          $(".youtube-player").css('display', 'none');
        }

        function createVidButton(index) {
          var iframe_url = allElements[index].getAttribute('src');

          function extractVideoID(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
            var match = url.match(regExp);
            if ( match && match[7].length == 11 ) {
              return match[7];
            } else {
              alert("Could not extract video ID.");
            }
          }

          $("#play-buttons").append('<li><button style="margin-bottom: 10px;" class="button button-assertive" id="play-btn' + index + '"><i class="icon ion-play"></i>  Spela upp video (' + (index+1) + ') </button></li>');

          var id = extractVideoID(iframe_url);
          //alert("utube id: " + id);

          document.getElementById('play-btn' + index).addEventListener("click", function() {
            //alert('BTN CLICK utube ID: ' + id);
            console.log('utube ID: ' + id);
            YoutubeVideoPlayer.openVideo(id);
          });
        }
        createVidButton(i);
      }
    }
  }
}
// Sort frontpage data http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
function compare(a,b) {
  if (a.position < b.position)
  return -1;
  if (a.position > b.position)
  return 1;
  return 0;
}

// modules
angular.module('eter.controllers', ['ngSanitize', 'eter.services'])

//Controller for the start/ front page where user choose school
.controller('FrontCtrl', ['$scope', '$http', '$ionicSlideBoxDelegate', '$state', '$translate', function($scope, $http, $ionicSlideBoxDelegate, $state, $translate) {
  // get school ids
  var schoolsIdsTemp = [];
  $http({
    method: 'GET',
    url: 'http://eter.rudbeck.info//eter-app-api/?apikey=vV85LEH2cUJjshrFx5&oto_directory=1'
  }).then(function successCallback(response) {
    $.each( response.data.oto_directory, function( key, val ) {
      schoolsIdsTemp.push(val.school_id);
    });
    $scope.schoolIds = schoolsIdsTemp;

    //$schools = data.oto_directory;
  }, function errorCallback(data) {
    console.log(data);
  });

  // submit school id and base url click event
  $scope.submitSchoolId = function(id) {
    console.log("adding school id: " + id);

    $.getJSON( "http://eter.rudbeck.info//eter-app-api/?apikey=vV85LEH2cUJjshrFx5&oto_directory=1", function( response ) {
      $.each( response.oto_directory, function( key, schoolObj ) {
        if(schoolObj.school_id == id) {
          app.checkForSchoolOrAdd(id, schoolObj.school_domain);
          $translate.use(schoolObj.lang);
          $state.go('tab.start');
        }
      });
    });
  }

}])

//Controller for the school start page with thier customized featured content
.controller('StartCtrl', ['$scope', '$http', '$ionicModal', '$ionicSideMenuDelegate', '$ionicSlideBoxDelegate', '$ionicPopup','$state', '$translate', function($scope, $http, $ionicModal, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicPopup, $state, $translate) {
  // change slide
  $scope.slideHasChanged = function() {
    $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
  };

  $scope.$on("$ionicView.beforeEnter", function() {
    app.start();
  });

  $scope.$on('$ionicView.afterEnter', function(event) {
    $ionicSideMenuDelegate.canDragContent(false);
  });

  // if base url exists load api, else go to front state
  $scope.$on("$ionicView.enter", function() {
    app.db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
        var rowlength = rs.rows.length;
        if(rowlength > 0) {
          $http.get(rs.rows.item(0).otourl + 'eter-app-api/'+ apikey +'&startpage=1').
          success(function(data) {
            $('#start-data').html("");
            var firstPageContent = {
              "sliderData":[],
              "topData":[],
              "bottomData":[]
            };

            $.each(data.startpage, function(index, obj) {
              // Add to slider
              if(obj.id >= 7) {
                firstPageContent.sliderData.push(data.startpage[index]);
              }
              // add to top row if not dynamic
              if(obj.id <= 3) {
                if(obj.is_dyn != "1") {
                  if (obj.title == "Veckans lunch" || obj.title == "Veckans Lunch" || obj.title == "veckans lunch" || obj.title == "dagens lunch" || obj.title == "Dagens Lunch" || obj.title == "Dagens lunch")  {
                    var lunch = {
                      "id": obj.id,
                      "position": obj.position,
                      "row": obj.row,
                      "title": obj.title,
                      "image_url": obj.image_url,
                      "content": obj.content,
                      "allEntries": data.items,
                      "on_link":  "openLunchAlert"
                    };
                    firstPageContent.topData.push(lunch);
                    firstPageContent.topData.sort(compare);

                  } else {
                    firstPageContent.topData.push(data.startpage[index]);
                  }
                }
              }
              // add to bottom row if not dynamic
              if(obj.id > 3 && obj.id < 7) {
                if(obj.is_dyn != "1") {
                  firstPageContent.bottomData.push(data.startpage[index]);
                  firstPageContent.bottomData.sort(compare);
                }
              }
            });

            $scope.loadposts = function(category) {
              // $http.defaults.useXDomain = true;
              $scope.loading = true;

              var response = $http.get(rs.rows.item(0).otourl +'category/'+category+'/?json=1&'+ p_apikey);

              response.success(function(data, status, headers, config) {
                if (data.category.post_count == 0) {
                  console.log("ERROR 404, no guides found start-tab");
                  $scope.posts = 0;
                } else {
                  $('#start-data').html('');
                  $scope.posts = data.posts;
                }
                $scope.loading = false;
              });

              response.error(function(data, status, headers, config) {
                $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
                $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                console.log(data);
              });
            };


            // These functions will only work if static data is choosen, if dynamic is choosen then it will be an empty function
            $scope.goToLinkTopRow = function(url, passedAllEntries) {
              //alert(url);
              if(url.indexOf('http') == 0) {
                var ref = window.open(url, '_blank', 'location=yes');
              } else if(url == "openLunchAlert") {
                //navigator.notification.alert(combinedString, null, 'Veckans Lunch', 'close')
                //http://www.amica.se/modules/MenuRss/MenuRss/CurrentDay?costNumber=6203&language=sv
                //http://www.amica.se/modules/MenuRss/MenuRss/CurrentWeek?costNumber=6203&language=sv
                $http.get("http://rss2json.com/api.json?rss_url=http%3A%2F%2Fwww.amica.se%2Fmodules%2FMenuRss%2FMenuRss%2FCurrentWeek%3FcostNumber%3D6203%26language%3Dsv")
                .success(function(data) {
                  var combinedString = "";
                  for(var i = 0; i< data.items.length; i++) {
                    var title = data.items[i].title;
                    var contents = data.items[i].content;
                    var innerComb = title+"\n"+contents;
                    combinedString += innerComb;
                  }
                  $ionicPopup.show({
                    template: combinedString,
                    title: 'Veckans Lunch',
                    scope: $scope,
                    buttons: [
                      { text: 'Stäng' }
                    ]
                  });
                })
                .error(function(data) {
                  console.log("ERROR: " + data);
                });

              } else {
                location.href=url;
              }
            };
            $scope.goToLinkBottomRow = function(url) {
              //alert(url);
              if(url.indexOf('http') == 0) {
                var ref = window.open(url, '_blank', 'location=yes');
              } else {
                location.href=url;
              }
            };

            // Declaring empty functions. They will be activated if the latest guides have been choosen
            $scope.goToGuideTopRow = function() {};
            $scope.goToGuideBottomRow = function() {};

            // Add dynamic data if is_dyn = 1 for top row
            if(data.startpage[0].is_dyn == "1") {
              $http.get(data.startpage[0].dyn_link).
              success(function(data) {
                $scope.goToLinkTopRow = function() {};
                if(data.hasOwnProperty('posts')) { // the latest guides
                  $.each(data.posts, function(index, post) {
                    firstPageContent.topData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "Publicerad: "+post.date, on_link: '', contentClass: 'dynamiska' });
                  });
                  $scope.goToGuideTopRow = function(id) {
                    if(typeof id == "number") {
                      location.href="#/tab/start/"+id;
                    }
                  };
                } else if(data.hasOwnProperty('list_all_courses')) { // the latest courses
                  $.each(data.list_all_courses, function(index, course) {
                    if(index < 3) {
                      firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Publicerad: '+post.date, on_link: '', contentClass: 'dynamiska'});
                    }
                  });
                  $scope.goToGuideTopRow = function() {};
                }
              }).
              error(function(data) {
                $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel med en dynamiska datan! Testa att sätta på WIFI eller Mobildata.</p>');
                $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                console.log(data);
              });

            }

            // Add dynamic data if is_dyn = 1 for bottom row
            if(data.startpage[3].is_dyn == "1") {
              $http.get(data.startpage[3].dyn_link).
              success(function(data) {
                $scope.goToLinkBottomRow = function() {};
                if(data.hasOwnProperty('posts')) { // the latest guides
                  $.each(data.posts, function(index, post) {
                    firstPageContent.bottomData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: 'Publicerad: '+post.date, on_link: '', contentClass: 'dynamiska' });
                  });
                  $scope.goToGuideBottomRow = function(id) {
                    if(typeof id == "number") {
                      location.href="#/tab/start/"+id;
                    }
                  };
                } else if(data.hasOwnProperty('list_all_courses')) { // the latest courses

                  $.each(data.list_all_courses.reverse() , function(index, course) {
                    if(index < 3) {
                      firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Publicerad: '+post.date, on_link: '', contentClass: 'dynamiska' });
                    }
                  });
                  $scope.goToGuideBottomRow = function() {};
                }
              }).
              error(function(data) {
                $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel med en dynamiska datan! Testa att sätta på WIFI eller Mobildata.</p>');
                $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                console.log(data);
              });
            }

            //alert(JSON.stringify(firstPageContent, null, 4));
            $scope.topData = firstPageContent.topData;
            $scope.bottomData = firstPageContent.bottomData;
            $scope.sliderData = firstPageContent.sliderData;

          }).
          error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
          });
        } else {
          console.log("no school selected");
          $state.go('front');

        }
      }, app.onError);
    });
  });

}])

//controller for the sidemenu, functions in here depend on existence of guide Categories and the tab.guides
.controller('TabsSidemenuController', ['$scope', '$ionicSideMenuDelegate', '$state','$stateParams', '$ionicNavBarDelegate','$ionicViewSwitcher', '$ionicHistory', '$http', function($scope, $ionicSideMenuDelegate, $state, $stateParams, $ionicNavBarDelegate, $ionicViewSwitcher, $ionicHistory, $http) {
  $scope.listCate = function() {
    app.db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
        var rowlength = rs.rows.length;
        if(rowlength > 0) {
          var response = $http.get(rs.rows.item(0).otourl +'eter-app-api/'+ apikey +'&list-taxonomy=1&type=category');
          response.success(function(data) {
            //alert("a");
            var taxonomyArr = [];
            $.each(data.list_taxonomy, function(index, obj) {
              if(parseInt(obj.post_count) != 0) {
                taxonomyArr.push(data.list_taxonomy[index]);
              }
            });
            $scope.cateLoader = taxonomyArr;
            $scope.loading = false;
          }).
          error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
            //alert("b");
          });
        } else {
          console.log("no school selected");
          $state.go('front');
        }
      }, app.onError);
    });
  };

  $scope.loadposts = function(passedCategory) {
    $ionicNavBarDelegate.showBackButton(false);

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();

    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true,
      historyRoot: true
    });

    $ionicSideMenuDelegate.toggleLeft();
    $state.go('tab.guides', {category: passedCategory}, {reload: true});
  };

  $scope.search = function (searchKey) {
    //alert(searchKey);
    $ionicNavBarDelegate.showBackButton(false);

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();

    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true,
      historyRoot: true
    });

    $ionicSideMenuDelegate.toggleLeft();
    $state.go('tab.guides', {searchKeys: searchKey, category: 'noCategory'}, {reload: true});
  };
}])

//Controller for the guides page
.controller('GuidesCtrl', ['$scope', '$ionicNavBarDelegate', '$ionicSideMenuDelegate', '$ionicViewSwitcher', '$ionicHistory', '$state','$stateParams', '$http', function($scope, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicViewSwitcher, $ionicHistory, $state, $stateParams, $http) {
  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.$on('$ionicView.afterEnter', function(event) {
    $ionicSideMenuDelegate.canDragContent(true);
  });

  $scope.$on('$ionicView.beforeLeave', function (event) {
    $ionicSideMenuDelegate.canDragContent(false);
  });
  $scope.goToGuide = function(id, postType) {
    /*location.href="#/tab/guides/"+id+"/"+postType;*/
    $state.go("tab.guides-detail", {pid: id, postType: postType});
  };

  $scope.posts = [];
  $scope.allTags = [];

  $scope.extraTitle = "";

  $scope.$on("$ionicView.enter", function() {
    $( "#tgl-categories" ).unbind().click(function() {
      $( ".cate" ).toggle();
    });
    $( "#tgl-tags" ).unbind().click(function() {
      $( ".tags" ).toggle();
    });
    $scope.extraTitle = "| Ämnen & Senaste";
    $scope.loadpost();
    if($stateParams.category == 'all'){
        $scope.loadTagCloud();
    }
    else{
      $scope.allTags = [];
    }

  });

  $scope.loadTagCloud = function() {
    app.db.transaction(function (tx) {
      $scope.loading = true;
      tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
        var rowlength = rs.rows.length;
          if(rowlength > 0) {

            var response = $http.get(rs.rows.item(0).otourl +'?json=get_tag_index&'+ p_apikey);
            response.success(function(data) {
              //alert(JSON.stringify(data, null, 4));
              $scope.allTags = data.tags;
              //console.log(rs.rows.item(0).otourl +'?json=get_tag_index'+ p_apikey);
              //console.log($scope.allTags);
              $scope.loading = false;
            }).
            error(function(data) {
              $scop.allTags = [];
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
              $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
              console.log(data);
              //alert("b");
            });

          }
      });
    });
  }

  $scope.goToTagArchive = function(passedTag) {
    $ionicNavBarDelegate.showBackButton(false);

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    $ionicViewSwitcher.nextDirection('enter');

    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('tab.guides', {category: 'noCategory', tag: passedTag});
  }

  $scope.loadpost = function() {
    $scope.loading = true;
    console.log("$stateParams",$stateParams);

    app.db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
        var rowlength = rs.rows.length;
        if(rowlength > 0) {
          if($stateParams.category != "all" && $stateParams.category != "systemLoadAllRead" && $stateParams.category != "systemLoadAllUnRead" && $stateParams.category != "noCategory" ) {
            var response = $http.get(rs.rows.item(0).otourl +'category/'+$stateParams.category+'/?json=1&'+ p_apikey);
            response.success(function(data, status, headers, config) {
              if (data.category.post_count == 0 || data.category.post_count == undefined) {
                $('#start-data').html('<h2 style="text-align: center; margin-top: 55px;">ERROR 404 <br> Det finns inga guider i denna kategori</h2>');
                $scope.posts = 0;
              } else {
                $('#start-data').html('');
                $scope.posts = data.posts;

                $scope.extraTitle = " | "+ data.category.title;

              }
              $scope.loading = false;
            });

            response.error(function(data, status, headers, config) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
              $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
              console.log(data);
            });
          } else if($stateParams.category == "noCategory" && $stateParams.tag.length > 0 && $stateParams.tag!= 'none'){
            var response = $http.get(rs.rows.item(0).otourl +'tag/'+$stateParams.tag+'/?json=1&'+ p_apikey);
            response.success(function(data, status, headers, config) {
              if (data.tag.post_count == 0 || data.tag.post_count == undefined) {
                $('#start-data').html('<h2 style="text-align: center; margin-top: 55px;">ERROR 404 <br> Det finns inga guider i denna kategori</h2>');
                $scope.posts = 0;
              } else {
                $('#start-data').html('');
                $scope.posts = data.posts;
                $scope.extraTitle =  " | "+ data.tag.title;
              }
              $scope.loading = false;
            });

            response.error(function(data, status, headers, config) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
              $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
              console.log(data);
            });
          } else if($stateParams.category == "noCategory" && $stateParams.searchKeys.length > 0){
            var response = $http.get(rs.rows.item(0).otourl +'api/get_search_results/?search='+ $stateParams.searchKeys +'&'+ p_apikey);
            response.success(function(data, status, headers, config) {
              if (data.count == 0 || data.count == undefined) {
                $('#start-data').html('<h2 style="text-align: center; margin-top: 55px;">ERROR 404 <br> Det finns inga guider i denna kategori</h2>');
                $scope.posts = 0;
              } else {
                $('#start-data').html('');
                $scope.posts = data.posts;
                $scope.extraTitle = " | "+ $stateParams.searchKeys;
              }
              $scope.loading = false;
            });

            response.error(function(data, status, headers, config) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
              $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
              console.log(data);
            });
          } else if($stateParams.category == "systemLoadAllRead"){
            var l_index = 0; // loading index (fixes overwriting bug when clicking on this menu option), must use recursion

            $scope.loading = true;
            app.db.transaction(function (tx) {
              tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
                var rowlength = rs.rows.length;
                if(rowlength > 0) {
                  var read = [];
                  var response = $http.get(rs.rows.item(0).otourl +'api/get_recent_posts/?'+ p_apikey +'&count=99999999999999999999999');
                  response.success(function(data) {
                    app.db.transaction(function (tx) {
                      tx.executeSql("SELECT * FROM readposts ORDER BY ID DESC", [], function(tx, rs) {
                        var row;
                        var rowlength = rs.rows.length;
                        if(rowlength > 0) {
                          $.each(data.posts, function(index, post) { // loop through posts
                            for (var i = 0; i < rowlength; i++) { // loop through read db
                              row = rs.rows.item(i);

                              if(parseInt(row.postid) == parseInt(post.id)) {
                                data.posts[index].read = "Läst: " + row.added_on;
                                read.push(data.posts[index]);
                                break;
                              }
                            }
                          });
                          //alert(JSON.stringify(read, null, 4));
                          $scope.posts = read;
                        }

                        $scope.loading = false;
                      }, app.onError);
                    });
                  }).
                  error(function(data) {
                    $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
                    $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                    console.log(data);
                  });
                } else {
                  console.log("no school selected");
                  $state.go('front');
                }
              }, app.onError);
            });
          } else if($stateParams.category == "systemLoadAllUnRead"){
            var l_index2 = 0; // loading index 2 (fixes overwriting bug when clicking on this menu option), must use recursion
            $scope.loading = true;
            app.db.transaction(function (tx) {
              tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
                var rowlength = rs.rows.length;
                if(rowlength > 0) {
                  var notRead = [];
                  var response = $http.get(rs.rows.item(0).otourl +'api/get_recent_posts/?'+ p_apikey +'&count=99999999999999999999999');
                  response.success(function(data) {
                    app.db.transaction(function (tx) {
                      tx.executeSql("SELECT * FROM readposts", [], function(tx, rs) {
                        var row;
                        var rowlength = rs.rows.length;
                        if(rowlength > 0) {
                          $.each(data.posts, function(index, post) { // loop through posts
                            for (var i = 0; i < rowlength; i++) { // loop through read db
                              row = rs.rows.item(i);

                              if(parseInt(row.postid) == parseInt(post.id)) {
                                return true;
                              } else {
                                if(i == (rowlength-1)) {
                                  notRead.push(data.posts[index]);
                                }
                              }
                            }
                          });
                          //alert(JSON.stringify($scope.posts, null, 4));
                          $scope.posts = notRead;
                        } else {
                          $scope.posts = data.posts;
                        }

                        $scope.loading = false;
                      }, app.onError);
                    });
                  }).
                  error(function(data) {
                    $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
                    $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                    console.log(data);
                  });
                } else {
                  console.log("no school selected");
                  $state.go('front');
                }
              }, app.onError);
            });
          } else {
            var response = $http.get(rs.rows.item(0).otourl +'category/guides/?json=1&count=10&'+ p_apikey);
            response.success(function(data) {
              $scope.posts = data.posts;
              $scope.loading = false;
              $scope.extraTitle = "| Ämnen & Senaste";
            }).
            error(function(data) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
              $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
              console.log(data);
            });
          }
        } else {
          console.log("no school selected");
          $state.go('front');
        }
      }, app.onError);
    });
  };
}])

.controller('GuidesDetailCtrl', ['$scope', '$ionicNavBarDelegate', '$ionicSideMenuDelegate', '$ionicViewSwitcher', '$ionicHistory','$http',  '$state', '$stateParams', '$sce','guidesInCourse', function GuidesDetailCtrl($scope, $ionicNavBarDelegate, $ionicSideMenuDelegate, $ionicViewSwitcher, $ionicHistory, $http,  $state, $stateParams, $sce, guidesInCourse) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.$on('$ionicView.afterEnter', function(event) {
    $ionicSideMenuDelegate.canDragContent(false);
  });
  $scope.goBackToCourses = function() {
    $ionicHistory.clearCache();
    $ionicViewSwitcher.nextDirection('back');
    $state.go('tab.courses');
    $ionicHistory.clearHistory();
    $ionicHistory.removeBackView();
  }
  $scope.goBackGuides = function() {
    $ionicHistory.goBack();
  }
  $scope.goToTagArchive = function(passedTag) {
    $ionicNavBarDelegate.showBackButton(false);

    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    $ionicViewSwitcher.nextDirection('back');

    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('tab.guides', {category: 'noCategory', tag: passedTag});
  }

  $scope.loadpost = function() {
    $scope.loading = true;
    app.db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
        var rowlength = rs.rows.length;
        if(rowlength > 0) {
          console.log("$stateParams",$stateParams);

          var response = $http.get(rs.rows.item(0).otourl +'?p=' + $stateParams.pid + '&json=1&custom_fields=eter_guide_position&'+ p_apikey);

          response.success(function(data, status, headers, config) {
            console.log(data);
            $('#start-data').html('');
            $scope.post = data.post;
            console.log($scope.post);
            $scope.guideInCourseTitle = $stateParams.courseName;

            if($scope.post.type != 'guide') {
              $scope.trustedHtml = $sce.trustAsHtml($scope.post.content);
            } else {
              var getParts = $scope.post.content.guide_parts;
              var finaleParts = "";

              for (var i=0; i< getParts.length; i++){
                console.log(Object.keys(getParts[i]));
                var key = String(Object.keys(getParts[i]));
                console.log(key);

                if(key != "_Guide_post_desc"){
                  var part = getParts[i][key];
                  console.log(part);
                  var buildPartHtml = '<div class="card guideStepBox"><div class="item item-divider">Steg: '+i+'</div><div class="item item-text-wrap">'+part+'</div></div>';
                  finaleParts += buildPartHtml;
                } else {
                  var part = getParts[i][key];
                  console.log(part);
                  finaleParts += '<div class="introduction">'+part+'</div>';
                }

                $scope.trustedHtml = $sce.trustAsHtml(finaleParts);
              }
            }
            var machineRedablePosition = parseInt($scope.post.custom_fields.eter_guide_position);
            if(isNaN(machineRedablePosition)) {
              $scope.humanRedablePosition = 1;
            } else {
              $scope.humanRedablePosition = machineRedablePosition;
            }

            /*BEGIN FIND NEXT AND PREV*/
            // Get all courses
            $http.get(rs.rows.item(0).otourl +'category/43/'+$stateParams.courseSlug+'/?json=1&custom_fields=eter_guide_position').
            success(function(data) {
              var prevNext = [];
              $.each(data.posts, function(index, obj) {
                var listId = $scope.post.custom_fields.eter_guide_position;

                var prev = listId-1;
                var next = prev+2;

                if(obj.custom_fields.eter_guide_position == prev || obj.custom_fields.eter_guide_position == next) {
                  prevNext.push({ id: obj.id, title: obj.title, position: obj.custom_fields.eter_guide_position});
                }
                $scope.goToCourseGuide = function(id,typeofs) {
                  $ionicViewSwitcher.nextDirection('forward');
                  $state.go('tab.courses-detail',{pid: id, postType: typeofs, inCourse: $stateParams.inCourse, courseName:$stateParams.courseName});
                }
                $scope.goBackGuide = function(id, typeofs) {
                  $ionicViewSwitcher.nextDirection('back');
                  $state.go('tab.courses-detail',{pid: id, postType: typeofs, inCourse: $stateParams.inCourse, courseName:$stateParams.courseName});
                }
              });

              $.each(prevNext, function(index, obj) {
                if($stateParams.inCourse == 'inCourseTrue' ) {
                  var listId = $scope.post.custom_fields.eter_guide_position;
                  if(parseInt(obj.position) > parseInt(listId)){
                    //console.log(obj.position+" > "+ listId);
                    $scope.showNextButton = $sce.trustAsHtml("<button nav-direction='forward' class='button back-button buttons  button-clear header-item' style='color: black;'   ng-click='goToCourseGuide("+obj.id+",\""+obj.type+"\")'>Moment "+obj.position+" <i style='color: #9e1b32;' class='icon ion-ios-arrow-forward'></i> </button>");
                  }
                  if(!(listId <= 1) && parseInt(obj.position) < parseInt(listId)) {
                    //console.log(obj.position+" < "+ listId);
                    $scope.showPreviousButton = $sce.trustAsHtml("<button nav-direction='back' class='button back-button buttons  button-clear header-item' style='color: black;' ng-click='goBackGuide("+obj.id+",\""+obj.type+"\")'><i style='color: #9e1b32;' class='icon ion-ios-arrow-back'></i> Moment "+obj.position+"</button>");
                  }
                }
              });
              //console.log(prevNext);
              $scope.loading = false;
            }).
            error(function(data) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
              console.log(data);
            });

            /*
            Get recommended courses for the slider
            */
            $http.get(rs.rows.item(0).otourl +'eter-app-api/'+ apikey +'&courses-slider=1').
            success(function(data) {
              //alert(JSON.stringify(data.courses_slider, null, 4));
              $scope.courses_slider = data.courses_slider;
            }).
            error(function(data) {
              $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in de rekommenderade kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
              console.log(data);
            });

            $http.get(rs.rows.item(0).otourl + "eter-app-api/"+ apikey +"&post_vote=1&post_id="+ $stateParams.pid +"").success(function(data, status) {
              $('.action-like').html("");
              $('#num_likes_' + $stateParams.pid).html(" ("+ data.num_votes+")");
              $("#like-icn_"+pid).css("color", "#387EF5");
            })
            response.error(function(data, status, headers, config) {
              alert('Något gick fel');
              console.log(data);
            });
            document.getElementById('share').addEventListener("click", function() {
              //alert('Pressed url: ' + $scope.post.url);
              console.log('like' + $stateParams.pid);
              window.plugins.socialsharing.share('Kolla in denna artikel: '+ $scope.post.title, 'Rekomenderad artikel på ETER-sajten: ' + $scope.post.title, null, $scope.post.url);
            });
            $scope.loading = false;
            fixCordovaOutboundLinks();
            fixCordovaYoutubePlayers();
          });

          response.error(function(data, status, headers, config) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
          });
        } else {
          console.log("no school selected");
          $state.go('front');
        }
      }, app.onError);
    });
  };

  $scope.like = function (pid) {
    id = parseInt(pid);
    app.checkIfLikedAndAdd(pid);
    app.db.transaction(function (tx) {
      tx.executeSql("SELECT * FROM likedposts", [], function(tx, rs) {
        var row;
        var rowlength = rs.rows.length;
        if(rowlength > 0) {
          for (var i = 0; i < rowlength; i++) {
            row = rs.rows.item(i);
            if(id == row.postid) {
              $('#num_likes_'+pid).html("(Redan gillat)");
              break;
            } else {
              if(i == (rowlength-1)) {
                tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
                  var rowlength = rs.rows.length;
                  if(rowlength > 0) {
                    $http.get(rs.rows.item(0).otourl + "eter-app-api/"+ apikey +"&post_vote=1&post_id="+pid  +"&new_vote=1").success(function(data, status) {
                      $('.action-like').html("");
                      $('#num_likes_'+pid).html(" ("+ data.num_votes+")");
                      $("#like-icn_"+pid).css("color", "#387EF5");
                    })
                    response.error(function(data, status, headers, config) {
                      alert('Något gick fel när du skulle gilla');
                      console.log(data);
                    });
                  } else {
                    console.log("no school selected");
                    $state.go('front');
                  }
                }, app.onError);
              }
            }
          }
        } else {
          $http.get(rs.rows.item(0).otourl + "eter-app-api/"+ apikey +"&post_vote=1&post_id="+pid  +"&new_vote=1").success(function(data, status) {
            $('.action-like').html("");
            $('#num_likes_'+pid).html(" ("+ data.num_votes+")");
            $("#like-icn_"+pid).css("color", "#387EF5");
          })
          response.error(function(data, status, headers, config) {
            alert('Något gick fel när du skulle gilla');
            console.log(data);
          });
        }
      }, app.onError);
    });
  };

  $scope.$on("$ionicView.beforeEnter", function() {
    $scope.loadpost();
    console.log("$stateParams",$stateParams);
    app.checkIfReadAndAdd($stateParams.pid);
  });
}])

.directive('compileTemplate', function($compile, $parse){
  return {
    link: function(scope, element, attr){
      var parsed = $parse(attr.ngBindHtml);
      function getStringValue() { return (parsed(scope) || '').toString(); }

      //Recompile if the template changes
      scope.$watch(getStringValue, function() {
        $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
      });
    }
  }
})

.controller('CoursesCtrl', ['$scope','$ionicHistory', '$ionicSideMenuDelegate', '$ionicNavBarDelegate', '$http', '$ionicSlideBoxDelegate', function($scope, $ionicHistory, $ionicSideMenuDelegate,$ionicNavBarDelegate, $http, $ionicSlideBoxDelegate) {
  $scope.loading = true;

  $scope.$on('$ionicView.afterEnter', function(event) {
    $ionicSideMenuDelegate.canDragContent(false);
  });

  $scope.courseDropdown = function(id, e) {
    //e.currentTarget.innerHTML = id;
    var eid = "#e" + id; // id of dropdown element
    var ccid = "#cc" + id; // id of course container
    var cid = "#c" + id; // if of clicked element
    $(eid).slideToggle();
    var otherDropdowns = ".dropdown1:not(" + eid + ")";
    $(otherDropdowns).slideUp();
    // toggle highlighting
    $(ccid).toggleClass('courseHighlight');
    $(".courseContainer").not(ccid).removeClass('courseHighlight');

  }

  $scope.slideHasChanged = function() {
    $ionicSlideBoxDelegate.$getByHandle('course-viewer').update();
  }
  $scope.$on("$ionicView.beforeEnter", function(){
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
    $ionicNavBarDelegate.showBackButton(false);
  });

  app.db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
      var rowlength = rs.rows.length;
      if(rowlength > 0) {
        // Get all courses
        $http.get(rs.rows.item(0).otourl +'eter-app-api/'+ apikey +'&list-all-courses=1&parent=43').
        success(function(data) {
          var courses = [];
          $.each(data.list_all_courses, function(index, obj) { // loop through courses
            courses.push({ id: obj.id, slug: obj.slug, name: obj.name, desc: obj.description, elements: [] });
            var elementsRaw = data.list_all_courses[index].elements;
            if(elementsRaw != undefined) {
              $.each(data.list_all_courses[index].elements, function(i, el) { // loop through elements

                courses[index].elements.push({ postid: el.id, posttitle: el.title, elementOrder: el.custom_fields.eter_guide_position, type: el.type});
                courses[index].elements.sort(function (a, b) {
                  return a.elementOrder - b.elementOrder;
                });
              });
            }
          });
          //alert(JSON.stringify(courses, null, 4));
          $scope.courses = courses;

          $scope.goToGuide = function(id, posttype, incourseval, courseName, courseSlug) {
            location.href="#/tab/courses/"+id+"/"+posttype+"/"+incourseval+"/"+courseName+'/'+courseSlug;
          }
          $scope.loading = false;
        }).
        error(function(data) {
          $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
          console.log(data);
        });

        /* Get recommended courses for the slider
        */
        $http.get(rs.rows.item(0).otourl +'eter-app-api/'+ apikey +'&courses-slider=1').
        success(function(data) {
          //alert(JSON.stringify(data.courses_slider, null, 4));
          $scope.courses_slider = data.courses_slider;
        }).
        error(function(data) {
          $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in de rekommenderade kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
          console.log(data);
        });
      } else {
        console.log("no school selected");
        $state.go('front');
      }
    }, app.onError);
  });
  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();
}])

.controller('EterCtrl', function($scope, $http, $ionicSideMenuDelegate) {
  $scope.$on('$ionicView.afterEnter', function(event) {
    $ionicSideMenuDelegate.canDragContent(false);
  });

  app.db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
      var rowlength = rs.rows.length;
      if(rowlength > 0) {
        //rs.rows.item(0).otourl
        $('#supportForm').submit(function(){
          var postData = $(this).serialize();
          $.ajax({
            type: 'POST',
            data: postData,
            url: rs.rows.item(0).otourl +'support/#contact-form-425',
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

        $http.get(rs.rows.item(0).otourl +'om-ikt-coacher/?json=1&'+ p_apikey).
        success(function(data) {
          $scope.iktCoach = data.page;
          fixCordovaOutboundLinks();
          fixCordovaYoutubePlayers();
        }).
        error(function(data) {
          $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
          $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
          console.log(data);
        });
        $http.get(rs.rows.item(0).otourl +'om-eter/?json=1&'+ p_apikey).
        success(function(data) {
          $scope.omEter = data.page;
          fixCordovaOutboundLinks();
          fixCordovaYoutubePlayers();
        }).
        error(function(data) {
          $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
          $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
          console.log(data);
        });

      } else {
        console.log("no school selected");
        $state.go('front');
      }
    }, app.onError);
  });
})

.controller('EterDetailCtrl', function($scope) {})
