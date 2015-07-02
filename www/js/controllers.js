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

// Replace all a tags with http links in href with window.open to open in the inapp browser
function fixCordovaOutboundLinks() {
    $('a').each(function() { 
        var url = ($(this).attr('href')); 
        if (url.indexOf('http') == 0) {
            $(this).css('text-decoration', 'none');
            $(this).attr('href', '#' );
            $(this).click(function() {
                var ref = window.open(url, '_blank', 'location=yes');             
            });       
        }
    });
}

// modules
angular.module('eter.controllers', [])

/*
* Controller for tab-start
*/
.controller('StartCtrl', function($scope, $http, $ionicSlideBoxDelegate) {
	// Update slider
    $scope.slideHasChanged = function() {
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
    }
	
    /*$scope.$on("$ionicView.beforeEnter", function() {
         app.start();
    });*/
    
    // GET TAB-START API
    $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&startpage=1').
        success(function(data) {
            $('#start-data').html("");
			
			// array that will store data for the slider and the top and bottom row
            var firstPageContent = { 
               "sliderData":[],
               "topData":[],
               "bottomData":[]
            };
            
			// Add if is_dyn = 0 then add static data to the firstPageContent array
            $.each(data.startpage, function(index, obj) {
                // Add to slider
                if(obj.id >= 7) {
                    firstPageContent.sliderData.push(data.startpage[index]); 
                }
                // add to top row if not dynamic
                if(obj.id <= 3) {
                    if(obj.is_dyn != "1") {
                        firstPageContent.topData.push(data.startpage[index]);
                    }
                }
                // add to bottom row if not dynamic
                if(obj.id > 3 && obj.id < 7) {
                    if(obj.is_dyn != "1") {
                        firstPageContent.bottomData.push(data.startpage[index]); 
                    }
                }
            });
        
			/* These functions will only work if static data is choosen, if is_dyn = 1
			then the function will be assigned to an empty function. The functions opens links in
			the inapp browser if the url contains 'http' or goes to the path inside the app if it
			doesnt contain 'http'
			*/
			$scope.goToLinkTopRow = function(url) {
				//alert(url);
                if(url.indexOf('http') == 0) {
                    var ref = window.open(url, '_blank', 'location=yes');
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
		
			/* These functions will only be activated if the dynamic data and the
			latest guides have been choosen. The functionality is commented inside the functions.
			DO NOT REMOVE THE COMMENT INSIDE THE FUNCTION!!
			This function goes to a guide if the post id is valid*/
			$scope.goToGuideTopRow = function() {
				/*if(typeof id == "number") {
					location.href="#/tab/start/"+id;
				}*/
			};
			$scope.goToGuideBottomRow = function() {
				/*if(typeof id == "number") {
					location.href="#/tab/start/"+id;
				}*/
			};
		
            // Add dynamic data for the TOP ROW if is_dyn = 1
            if(data.startpage[0].is_dyn == "1") {
                $http.get(data.startpage[0].dyn_link). // api url fetched from the original http request
                success(function(data) {
					$scope.goToLinkTopRow = function() {}; // disable static links
                    if(data.hasOwnProperty('posts')) { // if the latest guides have been choosen
                        $.each(data.posts, function(index, post) { // add the latest guide the firstPageContent array
                            firstPageContent.topData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "Senaste Guider", on_link: '' });
                        });
						$scope.goToGuideTopRow = function(id) { // enable dynamic link to guide
							if(typeof id == "number") {
								location.href="#/tab/start/"+id;
							}
						};
                    } else if(data.hasOwnProperty('list_all_courses')) { // if the latest courses have been choosen
                        $.each(data.list_all_courses, function(index, course) { // add the three latest courses to the firstPageContent array and top row
                            if(index < 3) {
                                firstPageContent.topData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Senaste Kurser', on_link: '' });
                            }
                        });
						$scope.goToGuideTopRow = function() {}; // disable guide links
                    }
                }).
                error(function(data) {
                    $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel med en dynamiska datan! Testa att sätta på WIFI eller Mobildata.</p>');
                    $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                    console.log(data);
                });

            }
        
            // Add dynamic data for the BOTTOM ROW if is_dyn = 1
            if(data.startpage[3].is_dyn == "1") {
                $http.get(data.startpage[3].dyn_link). // api url fetched from the original http request
                success(function(data) {
					$scope.goToLinkBottomRow = function() {}; // disable static links
                    if(data.hasOwnProperty('posts')) { // if the latest guides have been choosen 
                        $.each(data.posts, function(index, post) { // add the latest guide the firstPageContent array
                            firstPageContent.bottomData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "Senaste Guider", on_link: '' });
                        });
						$scope.goToGuideBottomRow = function(id) { // enable dynamic link to guide
							if(typeof id == "number") {
								location.href="#/tab/start/"+id;
							}
						};
                    } else if(data.hasOwnProperty('list_all_courses')) { // if the latest courses have been choosen
                        
                        $.each(data.list_all_courses.reverse() , function(index, course) { // add the three latest courses to the firstPageContent array and bottom row
                            if(index < 3) {
                                firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Senaste Kurser', on_link: '' });
                            }
                        });
						$scope.goToGuideBottomRow = function() {}; // disable guide links
                    }
                }).
                error(function(data) {
                    $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel med en dynamiska datan! Testa att sätta på WIFI eller Mobildata.</p>');
                    $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                    console.log(data);
                });
            }
        
            $scope.topData = firstPageContent.topData;
            $scope.bottomData = firstPageContent.bottomData;
            $scope.sliderData = firstPageContent.sliderData;
            
            
            fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
})

/*
* Controller for tab-guides
*/
.controller('GuidesCtrl', function($scope, $http) {
	$scope.$on("$ionicView.beforeEnter", function() {
		// Setup slideout menu
		var slideout = new Slideout({
			'panel': document.getElementById('panel'),
			'menu': document.getElementById('menu'),
			'padding': 256,
			'tolerance': 70
		 });
		 // slideout toggle button
		 document.querySelector('.toggle-button').addEventListener('click', function() {
			slideout.toggle();
		 });
	});
    
	// Go to the choosen guide via post id
	$scope.goToGuide = function(id) {
		location.href="#/tab/guides/"+id;
	}
	// Posts array, will be updated depending on what menu option is choosen
    $scope.posts = [];
	
	/*$scope.doRefresh = function() {
    	$scope.latest();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
  	};*/
	
	// Get the latest guides
    $scope.latest = function() {
        $scope.loading = true;
        var response = $http.get('http://eter.rudbeck.info/category/sjalvstudier/?json=1&count=10&apikey=ErtYnDsKATCzmuf6');
        response.success(function(data) {
			$scope.posts = data.posts;
			$scope.loading = false;
			fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
        
    };
	
	// Get all read guides
	var l_index = 0; // loading index (fixes an overwriting bug when clicking on this menu option)
	$scope.loadRead = function() {
		$scope.loading = true;
		var read = [];
        var response = $http.get('http://eter.rudbeck.info/api/get_recent_posts/?apikey=ErtYnDsKATCzmuf6&count=99999999999999999999999');
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
					
					l_index++;
					if(l_index < 2) { // make sure function runs twice and not get overwritten by other posts
						$scope.loadRead();
					} else {
						$scope.restoreLoadIndex();
					}
					
					$scope.loading = false;
					fixCordovaOutboundLinks();
				}, app.onError);
			});
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
	};
	
	// Get all posts that have not been read
	var l_index2 = 0; // loading index 2 (fixes overwriting an bug when clicking on this menu option)
	$scope.loadNotRead = function() {
		$scope.loading = true;
		var notRead = [];
        var response = $http.get('http://eter.rudbeck.info/api/get_recent_posts/?apikey=ErtYnDsKATCzmuf6&count=99999999999999999999999');
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
						
						l_index2++;
						if(l_index2 < 2) { // make sure function runs twice and not get overwritten by other posts
							$scope.loadNotRead();
						} else {
							$scope.restoreLoadIndex2();
						}
						
						$scope.loading = false;
                		fixCordovaOutboundLinks();
                    }, app.onError);
                });
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
	};
	
	// restore the loading indexes to be able to run the functions twice again and fix the overwriting bug
	$scope.restoreLoadIndex = function() {
		l_index = 0;
	}
	$scope.restoreLoadIndex2 = function() {
		l_index2 = 0;
	}
	
	// List all the categories in the slideout menu
    $scope.listCate = function() {
        var response = $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&list-taxonomy=1&type=category');
        response.success(function(data) {
            var taxonomyArr = [];    
            $.each(data.list_taxonomy, function(index, obj) { 
                if(parseInt(obj.post_count) != 0) {
                    taxonomyArr.push(data.list_taxonomy[index]);
                }
            });
            $scope.cateLoader = taxonomyArr;
            $scope.loading = false;
                
            fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
        
    };
	
	// Load all posts within a choosen category
    $scope.loadposts = function(category) {
        // $http.defaults.useXDomain = true;
        $scope.loading = true;
        
        var response = $http.get('http://eter.rudbeck.info/category/'+category+'/?json=1&apikey=ErtYnDsKATCzmuf6');
        
        response.success(function(data, status, headers, config) {  
            if (data.category.post_count == 0) {
                $('#start-data').html('<h2 style="text-align: center; margin-top: 55px;">ERROR 404 <br> Det finns inga guider i denna kategori</h2>');
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
    
	// Get posts with wordpress post search
    $scope.searchKey = "";
    $scope.search = function () {
        // $http.defaults.useXDomain = true;
        $scope.loading = true;
        
        var response = $http.get('http://eter.rudbeck.info/api/get_search_results/?search='+ $scope.searchKey +'&apikey=ErtYnDsKATCzmuf6');
        
        response.success(function(data, status, headers, config) {  
            $('#start-data').html('');
            $scope.posts = data.posts;
            
            $scope.loading = false;
        });
        
        response.error(function(data, status, headers, config) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    };
    
    $scope.$on("$ionicView.enter", function() {
			// Show categories if menu option 'categories' have been clicked
            $( "#tgl-categories" ).unbind().click(function() {
                $( ".cate" ).toggle();
            });
            $( "#tgl-tags" ).unbind().click(function() {
              $( ".tags" ).toggle();
            });
            $scope.latest();
    });
})

/*
* Controller for start-detail, guide-detail, courses-detail
*/
.controller('GuidesDetailCtrl', ['$scope','$http', '$stateParams', function($scope, $http, $stateParams) { 
	
	// Fetch choosen post with $stateParams
   $scope.loadpost = function() {
        $scope.loading = true;
        console.log("$stateParams",$stateParams);
        
        var response = $http.get('http://eter.rudbeck.info/?p=' + $stateParams.pid + '&json=1&apikey=ErtYnDsKATCzmuf6');
        
        response.success(function(data, status, headers, config) {  
            console.log(data);
            $('#start-data').html('');
            $scope.post = data.post;
            $http.get("http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&post_vote=1&post_id="+ $stateParams.pid +"").success(function(data, status) {
                $('.action-like').html("");
                $('#num_likes_'+$stateParams.pid).html(" ("+ data.num_votes+")");
                $("#like-icn_"+pid).css("color", "#387EF5"); 
            })
            response.error(function(data, status, headers, config) {
            alert('Något gick fel');
            console.log(data);
        });
            $scope.loading = false;
            fixCordovaOutboundLinks();
        });
        
        response.error(function(data, status, headers, config) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    };
	
	// If the like button is clicked check if it has already been clicked and then increase the likes if not
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
									$http.get("http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&post_vote=1&post_id="+pid  +"&new_vote=1").success(function(data, status) {
										$('.action-like').html("");
										$('#num_likes_'+pid).html(" ("+ data.num_votes+")");
										$("#like-icn_"+pid).css("color", "#387EF5"); 
									})
									response.error(function(data, status, headers, config) {
										alert('Något gick fel när du skulle gilla');
										console.log(data);
									});
								}
							}
							
						}
					} else {
						$http.get("http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&post_vote=1&post_id="+pid  +"&new_vote=1").success(function(data, status) {
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

/*
* Controller for tab-courses
*/
.controller('CoursesCtrl', function($scope, $http, $ionicSlideBoxDelegate) {
    $scope.loading = true;
	
	// Dropdown animation for courses
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
	
	// Update slides in slider
    $scope.slideHasChanged = function() {
        $ionicSlideBoxDelegate.$getByHandle('course-viewer').update();
    }
    
    // Get ALL COURSES
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
        //fixCordovaOutboundLinks();
    }).
    error(function(data) {
        $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
        console.log(data);
    });
    
    // Get RECOMMENDED COURSES for the slider
    $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&courses-slider=1').
    success(function(data) {
        //alert(JSON.stringify(data.courses_slider, null, 4));
        $scope.courses_slider = data.courses_slider;
        fixCordovaOutboundLinks();
    }).
    error(function(data) {
        $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel när du skulle ladda in de rekommenderade kurserna! Testa att sätta på WIFI eller Mobildata.</p>');
        console.log(data);
    });
    
})

/*
* Controller for tab-eter
*/
.controller('EterCtrl', function($scope, $http) {
    $scope.$on("$ionicView.enter", function() {
		// Post request from the form where you can ask for support (http post in jQuery)
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
                    fixCordovaOutboundLinks();
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
    
	// Get some info about the ETER app from http get request
    $http.get('http://eter.rudbeck.info/om-ikt-coacher/?json=1&apikey=ErtYnDsKATCzmuf6').
        success(function(data) {
            $scope.iktCoach = data.page;
            fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    $http.get('http://eter.rudbeck.info/om-eter/?json=1&apikey=ErtYnDsKATCzmuf6').
        success(function(data) {
            $scope.omEter = data.page;
            fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
    
})

.controller('EterDetailCtrl', function($scope) {})