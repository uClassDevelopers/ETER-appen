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

.controller('StartCtrl', function($scope, $http, $ionicSlideBoxDelegate) {
    $scope.slideHasChanged = function() {
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
    }
    $scope.$on("$ionicView.beforeEnter", function() {
         app.start();
    });
    $scope.goToGuide = function(id) {
		if(typeof id == "number") {
			location.href="#/tab/guides/"+id;
		}
    }
    
    // GET TAB-START API
    $http.get('http://eter.rudbeck.info/eter-app-api/?apikey=vV85LEH2cUJjshrFx5&startpage=1').
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
        
            // Add dynamic data if is_dyn = 1 for top row
            if(data.startpage[0].is_dyn == "1") {
                $http.get(data.startpage[0].dyn_link).
                success(function(data) {
                    if(data.hasOwnProperty('posts')) { // the latest guides 
                        $.each(data.posts, function(index, post) {
                            firstPageContent.topData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "Senaste guider", on_link: '#/tab/guides/' + post.id });
                        });
                    } else if(data.hasOwnProperty('list_all_courses')) { // the latest courses
                        $.each(data.list_all_courses, function(index, course) {
                            if(index < 3) {
                                firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Senaste kurser', on_link: '' });
                            }
                        });
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
                    if(data.hasOwnProperty('posts')) { // the latest guides 
                        $.each(data.posts, function(index, post) {
                            firstPageContent.bottomData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "En Guide", on_link: '#/tab/guides/' + post.id });
                        });
                    } else if(data.hasOwnProperty('list_all_courses')) { // the latest courses
                        
                        $.each(data.list_all_courses.reverse() , function(index, course) {
                            if(index < 3) {
                                firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'Senaste kurser', on_link: '' });
                            }
                        });
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
            
            
            fixCordovaOutboundLinks();
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
            console.log(data);
        });
})
.controller('StartDetailCtrl', function($scope) {
    $scope.$on("$ionicView.beforeEnter", function() {
        app.single();
        fixCordovaOutboundLinks();
    });
})


.controller('GuidesCtrl', function($scope, $http) {
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
    
	$scope.goToGuide = function(id) {
		location.href="#/tab/guides/"+id;
	}
    $scope.posts = [];

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
	
	var l_index = 0; // loading index (fixes overwriting bug when clicking on this menu option)
	$scope.loadRead = function() {
		$scope.loading = true;
		var read = [];
        var response = $http.get('http://eter.rudbeck.info/api/get_recent_posts/?apikey=ErtYnDsKATCzmuf6&count=99999999999999999999999');
        response.success(function(data) {
			app.db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM readposts", [], function(tx, rs) {
					var row;
					var rowlength = rs.rows.length;
					if(rowlength > 0) {
						$.each(data.posts, function(index, post) { // loop through posts
							for (var i = 0; i < rowlength; i++) { // loop through read table
								row = rs.rows.item(i);

								if(parseInt(row.postid) == parseInt(post.id)) {
									data.posts[index].read = "Read: " + row.added_on;
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
	var l_index2 = 0; // loading index 2 (fixes overwriting bug when clicking on this menu option)
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
								for (var i = 0; i < rowlength; i++) { // loop through read table
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
	
	// restore the loading indexes to be able to run the functions twice again
	$scope.restoreLoadIndex = function() {
		l_index = 0;
	}
	$scope.restoreLoadIndex2 = function() {
		l_index2 = 0;
	}
	
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
            $( "#tgl-categories" ).unbind().click(function() {
                $( ".cate" ).toggle();
            });
            $( "#tgl-tags" ).unbind().click(function() {
              $( ".tags" ).toggle();
            });
            $scope.latest();
    });
})
.controller('GuidesDetailCtrl', function($scope, $http) {
    $scope.$on("$ionicView.beforeEnter", function() {
        app.single();
    });
    /*$scope.vote = function(pid) {
        alert("like! vote fired off");
        alert("pid: " + pid);
        $http.post('http://eter.rudbeck.info/wp-admin/admin-ajax.php', { action:'wti_like_post_process_vote', task:'like', postid: pid, nonce: 'e707a027a7'}).
        success(function(data) {
            
        }).
        error(function(data) {
            $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
            $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
        console.log(data);
        });
    }*/
})


.controller('CoursesCtrl', function($scope, $http, $ionicSlideBoxDelegate) {
    $scope.loading = true;
    $scope.slideHasChanged = function() {
        $ionicSlideBoxDelegate.$getByHandle('course-viewer').update();
    }
    $scope.$on("$ionicView.enter", function() {

    });
    
	/* Get recommended courses for the slider
    */
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
	
    /* Get all courses
	*/
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
	
	// Course dropdown function
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
		/*$(cid).toggleClass('courseHighlight');
		$(".course").not(cid).removeClass('courseHighlight');
		$(eid).toggleClass('courseHighlight');
		$(".dropdown1").not(eid).removeClass('courseHighlight');
		$(eid).children("div").toggleClass('courseHighlight');
		$(".dropdown1").children("div").not(eid).children("div").removeClass('courseHighlight');*/
	}
    
})

.controller('CoursesDetailCtrl', function($scope) {
    $scope.$on("$ionicView.beforeEnter", function() {
        app.single();
        fixCordovaOutboundLinks();
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