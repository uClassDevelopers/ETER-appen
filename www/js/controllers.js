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

// modules
angular.module('eter.controllers', ['ngSanitize', 'eter.services'])

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

.controller('StartCtrl', ['$scope', '$http', '$ionicSlideBoxDelegate', '$state', '$translate', function($scope, $http, $ionicSlideBoxDelegate, $state, $translate) {
	// change slide
	$scope.slideHasChanged = function() {
  	$ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
  };
	
  $scope.$on("$ionicView.beforeEnter", function() {
  	app.start();
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
															firstPageContent.topData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "oto", on_link: '' });
													});
							$scope.goToGuideTopRow = function(id) {
								if(typeof id == "number") {
									location.href="#/tab/start/"+id;
								}
							};
											} else if(data.hasOwnProperty('list_all_courses')) { // the latest courses
													$.each(data.list_all_courses, function(index, course) {
															if(index < 3) {
																	firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'oto', on_link: '' });
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
															firstPageContent.bottomData.push({ id: (index+1), postid: post.id, title: post.title, image_url: '', content: "oto", on_link: '' });
													});
							$scope.goToGuideBottomRow = function(id) {
								if(typeof id == "number") {
									location.href="#/tab/start/"+id;
								}
							};
											} else if(data.hasOwnProperty('list_all_courses')) { // the latest courses

													$.each(data.list_all_courses.reverse() , function(index, course) {
															if(index < 3) {
																	firstPageContent.bottomData.push({ id: (index+1), courseid: course.id, title: course.name, image_url: '', content: 'oto', on_link: '' });
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

.controller('GuidesCtrl', ['$scope', '$http', function($scope, $http) {
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
  });

	$scope.goToGuide = function(id) {
		location.href="#/tab/guides/"+id;
	};
  
	$scope.posts = [];

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

    $scope.latest = function() {
			$scope.loading = true;
			app.db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
					var rowlength = rs.rows.length;
					if(rowlength > 0) {
						var response = $http.get(rs.rows.item(0).otourl +'category/guides/?json=1&count=10&'+ p_apikey);
						response.success(function(data) {
							$scope.posts = data.posts;
							$scope.loading = false;
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
    };

	var l_index = 0; // loading index (fixes overwriting bug when clicking on this menu option), must use recursion
	$scope.loadRead = function() {
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

								l_index++;
								if(l_index < 2) { // make sure function runs twice and not get overwritten by other posts
									$scope.loadRead();
								} else {
									$scope.restoreLoadIndex();
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
	};
	
	var l_index2 = 0; // loading index 2 (fixes overwriting bug when clicking on this menu option), must use recursion
	$scope.loadNotRead = function() {
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

								l_index2++;
								if(l_index2 < 2) { // make sure function runs twice and not get overwritten by other posts
									$scope.loadNotRead();
								} else {
									$scope.restoreLoadIndex2();
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
	};

	// restore the loading indexes to be able to run the functions twice again
	$scope.restoreLoadIndex = function() {
		l_index = 0;
	};
	$scope.restoreLoadIndex2 = function() {
		l_index2 = 0;
	};

	$scope.loadposts = function(category) {
		// $http.defaults.useXDomain = true;
		$scope.loading = true;
		app.db.transaction(function (tx) {
			tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
				var rowlength = rs.rows.length;
				if(rowlength > 0) {
					var response = $http.get(rs.rows.item(0).otourl +'category/'+category+'/?json=1&'+ p_apikey);
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
				} else {
					console.log("no school selected");
					$state.go('front');
				}
			}, app.onError);
		});
	};

	$scope.searchKey = "";
	$scope.search = function () {
			// $http.defaults.useXDomain = true;
			$scope.loading = true;
			app.db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
					var rowlength = rs.rows.length;
					if(rowlength > 0) {
						var response = $http.get(rs.rows.item(0).otourl +'api/get_search_results/?search='+ $scope.searchKey +'&'+ p_apikey);
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
					} else {
						console.log("no school selected");
						$state.go('front');
					}
				}, app.onError);
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
}])
.controller('GuidesDetailCtrl', ['$scope','$http', '$stateParams', '$sce', function GuidesDetailCtrl($scope, $http, $stateParams, $sce) {
				$scope.loadpost = function() {
					$scope.loading = true;
					app.db.transaction(function (tx) {
						tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
							var rowlength = rs.rows.length;
							if(rowlength > 0) {
								console.log("$stateParams",$stateParams);

								var response = $http.get(rs.rows.item(0).otourl +'?p=' + $stateParams.pid + '&json=1&'+ p_apikey);

								response.success(function(data, status, headers, config) {
									console.log(data);
									$('#start-data').html('');
									$scope.post = data.post;
									$scope.trustedHtml = $sce.trustAsHtml($scope.post.content);
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

.controller('CoursesCtrl', ['$scope', '$http', '$ionicSlideBoxDelegate', function($scope, $http, $ionicSlideBoxDelegate) {
	$scope.loading = true;
	
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
	$scope.$on("$ionicView.enter", function() {

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
							courses.push({ id: obj.id, name: obj.name, desc: obj.description, elements: [] });
							$.each(data.list_all_courses[index].elements.reverse(), function(i, el) { // loop through elements
								courses[index].elements.push({ postid: el.id, posttitle: el.title, elementOrder: el.custom_fields.eter_guide_position });
								courses[index].elements.sort(function (a, b) {
									if (a.elementOrder > b.elementOrder) {
										return 1;
									}
									if (a.elementOrder < b.elementOrder) {
										return -1;
									}
									// a must be equal to b
									return 0;
								});
							});
						});
						//alert(JSON.stringify(courses, null, 4));
						$scope.courses = courses;
						$scope.goToGuide = function(id) {
								location.href="#/tab/courses/"+id;
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
}])

.controller('EterCtrl', function($scope, $http) {
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
