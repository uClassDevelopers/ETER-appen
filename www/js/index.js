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
 * 
 * WEB SQL LICENSE:
 * Copyright (c) Microsoft Open Technologies, Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
 */
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

function initPushwoosh() {
	
	var pushNotification = window.plugins.pushNotification;
	
	//set push notification callback before we initialize the plugin
	document.addEventListener('push-notification', function(event) {
								//get the notification payload
								var notification = event.notification;

								//display alert to the user for example
                                function alertDismissed() {
                                    // reload
                                }
                                function showAlert() {
                                    navigator.notification.alert(
                                        notification.aps.alert,  // message
                                        alertDismissed,         // callback
                                        'ETER',            // title
                                        'OK'                  // buttonName
                                    );
                                }
                        showAlert();
        
								pushNotification.setApplicationIconBadgeNumber(0);
							});

	
    //initialize the plugin
    pushNotification.onDeviceReady({pw_appid:"4AB6E-0238F"}); //8EC51-04BD0 //4AB6E-0238F

    //register for pushes
	pushNotification.registerDevice(function(status) {
                                        var deviceToken = status['deviceToken'];
                                        console.warn('registerDevice: ' + deviceToken);
									},
									function(status) {
                                        console.warn('failed to register : ' + JSON.stringify(status));
									});
    
	pushNotification.setApplicationIconBadgeNumber(0);
    
	pushNotification.getTags(function(tags) {
								console.warn('tags for the device: ' + JSON.stringify(tags));
							 },
							 function(error) {
								console.warn('get tags error: ' + JSON.stringify(error));
							 });

	pushNotification.getPushToken(function(token) {
								  console.warn('push token device: ' + token);
							 });

	pushNotification.getPushwooshHWID(function(token) {
									console.warn('Pushwoosh HWID: ' + token);
								});
}

var app = {
    // Application Constructor
    initialize: function() {
        this.db = null;
        this.openDatabase();
        this.createTable();
        this.bindEvents();
    },
    
    // Web SQL Methods
    onError: function (transaction, error) {
        console.log('Error: ' + error.message);
        alert('onError: ' + error.message);
        document.getElementById("lblInfo").innerHTML = 'onError: ' + error.message;
    },

    onSuccess: function (transaction, resultSet) {
        console.log('Operation completed successfully');
        document.getElementById("lblTxInfo").innerHTML = 'RowsAffected: ' + resultSet.rowsAffected + '; InsertId: ' + resultSet.insertId;
        app.renderReadItems(transaction);
    },

    openDatabase: function () {
        var dbSize = 5 * 1024 * 1024; // 5MB
        // open database
        app.db = openDatabase("eterdb", "", "Eter app db", dbSize, function() {
            console.log('db successfully opened or created');
        });
    },

    createTable: function () {
        app.db.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS readposts(ID INTEGER PRIMARY KEY ASC, postid INTEGER, added_on TEXT)", [],
                app.onSuccess, app.onError);
        });
    },

    checkIfReadAndAdd: function (pid) {
        app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM readposts", [], function(tx, rs) {
                var row;
                var rowlength = rs.rows.length;
                if(rowlength > 0) {
                    for (var i = 0; i < rowlength; i++) {
                        row = rs.rows.item(i);
                        if(parseInt(row.postid) == parseInt(pid)) {
                            //alert("break");
                            break;
                        }
                        if(i == (rowlength-1)) {
                            if(parseInt(row.postid) == parseInt(pid)) {
                                //alert("break on last index");
                                break;
                            } else {
                                if(pid != "start") {
                                    app.db.transaction(function (tx) {
                                        var ts = new Date().toUTCString();
                                        tx.executeSql("INSERT INTO readposts(postid, added_on) VALUES (?,?)", [pid, ts], app.onSuccess, app.onError);
                                        //alert("added!");
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if(pid != "start" && pid != "courses") {
                        app.db.transaction(function (tx) {
                            var ts = new Date().toUTCString();
                            tx.executeSql("INSERT INTO readposts(postid, added_on) VALUES (?,?)", [pid, ts], app.onSuccess, app.onError);
                            //alert("added!");
                        });
                    }
                }
            }, app.onError);
        });
    },

    renderReadItems: function (tx) {
        tx.executeSql("SELECT * FROM readposts ORDER BY ID DESC", [], function (tx, rs) {
            var rowOutput = "",
                todoItems = document.getElementById("lblInfo"),
                row;

            for (var i = 0; i < rs.rows.length; i++) {
                row = rs.rows.item(i);
                rowOutput += "<li style='border:1px solid #000000; margin: 2px;'> ID: " + row.ID + ", postid:" + row.postid + ", added_on: <span style='color:green;'>" + row.added_on + "</span> [<a href='javascript:void(0);' onclick=\'app.deleteReadById(" + row.ID + ");\'>Delete</a>]</li>";
            }
            if (typeof window.MSApp != 'undefined') {
                MSApp.execUnsafeLocalFunction(function () {
                    todoItems.innerHTML = rowOutput;
                });
            } else {
                todoItems.innerHTML = rowOutput;
            }
        }, app.onError);
    },

    deleteReadById: function (id) {
        console.log('Delete item: ' + id);
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM readposts WHERE ID=?", [id], app.renderReadItems);
        });
    },
    
    deleteReadByPostId: function (postid) {
        console.log('Delete item by postid ' + postid);
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM readposts WHERE postid=?", [postid], app.renderReadItems);
        });
    },

    deleteAll: function () {
        console.log('Deleting all');
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM readposts", [], app.renderReadItems);
        });
    },

    dbSuccess: function () {
        console.log('DB Operation completed successfully');
        document.getElementById("lblDBInfo").innerHTML += 'DB Operation completed successfully<br\>';
    },

    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		
        document.getElementById('renderDb').addEventListener('click', this.onSuccess);
		document.getElementById('btnOpenDb').addEventListener('click', this.openDatabase);
        document.getElementById('btnCreateTable').addEventListener('click', this.createTable);
        document.getElementById('btnDeleteAll').addEventListener('click', this.deleteAll);
        document.getElementById('btnTestEvents').addEventListener('click', this.testEvents);
        document.getElementById('btnTestJSONBlob').addEventListener('click', this.testJSONBlob);
        document.getElementById('btnTestRollbacksAfterFailures').addEventListener('click', this.testRollbacksAfterFailures);
        document.getElementById('bthTestLongTransactions').addEventListener('click', this.testLongTransactions);
        document.getElementById('btnTestPrelightPostflight').addEventListener('click', this.testPrelightPostflight);
        document.getElementById('btnTestNestedTransaction').addEventListener('click', this.testNestedTransaction);
        document.getElementById('btnOpenDbMul').addEventListener('click', this.openDatabaseMultipleTimes);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        cordova.exec.setJsToNativeBridgeMode(cordova.exec.jsToNativeModes.XHR_NO_PAYLOAD);
        app.receivedEvent('deviceready');
        initPushwoosh();
        app.initialize();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
/*start: function () {
    function getStarts() {
        $('#start-data').html('<p style="text-align: center;"><img src="img/ajax-loader.gif"> loading...</p>');
        $('#recommended-data').html('<p></p>');
        var dfd = $.Deferred();
        $.ajax({
               url: 'http://192.168.1.4:8888/wordpress/eter-start-api/?apikey=vV85LEH2cUJjshrFx5',
               type: 'GET',
               dataType: 'json',
               success: function(data){
                   var firstPageContent = { 
                       "sliderData":[],
                       "topData":[],
                       "bottomData":[]
                   };

                   $.each(data.startpage, function(index, obj) {
                       if(obj.id <= 3) {
                           firstPageContent.topData[index] = data.startpage[index]; 
                       } else if(obj.id > 3 && obj.id < 7) {
                           firstPageContent.bottomData[index-3] = data.startpage[index]; 
                       } else if(obj.id >= 7) {
                            firstPageContent.sliderData[index-7] = data.startpage[index]; 
                       }
                   });
                   //alert(JSON.stringify(firstPageContent, null, 4));
                   
                   // Handlebars setup for top and bottom data
                   var source   = $("#start-template").html();
                   var template = Handlebars.compile(source);
                   var blogData = template(firstPageContent);
                   $('#start-data').html(blogData);
                   $('#start-data').trigger('create');
                       $('#recommended-data').html('<p></p>');
                   dfd.resolve(firstPageContent);
                   
                   // Handlebars setup for slider data
                   var source2   = $("#slider-template").html();
                   var template2 = Handlebars.compile(source2);
                   var blogData2 = template2(firstPageContent);
                   $('#slider-data').html(blogData2);
                   $('#slider-data').trigger('create');
                       $('#recommended-data').html('<p></p>');
                   dfd.resolve(firstPageContent);
               
               },
               error: function(data){
               $('#start-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
               $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
               console.log(data);
               }
               });
        return dfd.promise();
    };
    
    getStarts().then(function(data){
        $('#start-posts').on('click','div', function(e){                
            localStorage.setItem('postData', JSON.stringify(data.posts[$(this).index()]));
        });
  }); 
    
    
},*/    
/*
guides: function(){
    function getLatest() {
        $('#recommended-data').html('<p></p>');
        $('#blog-data').html('<p style="text-align: center;"><img src="img/ajax-loader.gif"> loading...</p>');
        var dfd = $.Deferred();
        $.ajax({
               url: 'http://eter.rudbeck.info/category/sjalvstudier/?json=1&count=10&apikey=ErtYnDsKATCzmuf6',
               type: 'GET',
               dataType: 'json',
               success: function(data){
                   var output = "";
                   app.db.transaction(function (tx) {
                        tx.executeSql("SELECT * FROM readposts ORDER BY ID DESC", [], function (tx, rs) {
                            var row;
                            for (var i = 0; i < rs.rows.length; i++) { // loop through web sql db
                                row = rs.rows.item(i);
                                $.each(data.posts, function(index, obj) { // loop through fetched json       
                                    if(parseInt(row.postid) == parseInt(data.posts[index].id)) {
                                        //alert("match! delete postid="+row.postid+",obj,id"+obj.id );
                                        //data.posts[index].read = "läst";
                                    } else {
                                         //data.posts[index].read = "oläst";
                                    }
                                });
                            }
                            
                        }, app.onError);
                        //alert(JSON.stringify(data, null, 4));
                    });
                    var source   = $("#blog-template").html();
                    var template = Handlebars.compile(source);
                    var blogData = template(data);
                    $('#blog-data').html(blogData);
                    $('#blog-data').trigger('create');
                    dfd.resolve(data);
                    $(".nav1 li a").removeClass('active-menu');       
                    $('#btn-senaste').addClass("active-menu"); 
                    $('#recommended-data').html('<p></p>');
               },
               error: function(data){    
                   $('#blog-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
                   $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
                   console.log(data);
               }
        });
        return dfd.promise();
    };
    
    getLatest().then(function(data){
        $('#blog-data').on('click','.post', function(e){       
            localStorage.setItem('postData', JSON.stringify(data.posts[$(this).index()]));
         });
  });

},  
courses: function() {
    
},*/
single: function() {
    var type =  window.location.href;
    var postid = /[^/]*$/.exec(type)[0];
    
    $('#single-data').html('<p style="text-align: center;"><img src="img/ajax-loader.gif"> loading...</p>');
    var dfd = $.Deferred();
    $.ajax({
           url: 'http://eter.rudbeck.info/?p=' + postid + '&json=1&apikey=ErtYnDsKATCzmuf6',
           type: 'GET',
           dataType: 'json',
           success: function(data){
                var source   = $("#single-template").html();
                var template = Handlebars.compile(source);
                var blogData = template(data);
                $('#single-data').html(blogData);

                $('#single-data').trigger('create');

                $(".youtube-player").css('display', 'none');
                $('iframe').contents().find('a').click(function(event) {
                    event.preventDefault();
                    var url = ($(this).attr('href')); 
                    $(this).attr('href', '#' );
                    var ref = window.open(url, '_blank', 'location=yes');
                    return false;  
                });   
                if ($('.youtube-player').length) {
                    $(".lc").prepend('<button class="button button-light" id="ankan"><i class="icon ion-ios-play-outline"></i> Spela upp videon</button><br/>');
                }           
                $( "#ankan" ).click(function() {
                    var url= $(".youtube-player").attr("src");
                    function extractVideoID(url) {
                        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                        var match = url.match(regExp);
                        if ( match && match[7].length == 11 ) {
                            return match[7];
                        } else {
                            alert("Could not extract video ID.");
                        }
                    }
                    var id = extractVideoID(url);
                    YoutubeVideoPlayer.openVideo(id);
                });
               dfd.resolve(data);
               // Add to read
               app.checkIfReadAndAdd(postid);
                
           },
           error: function(data){
               $('#single-data').html('<p class="bg-danger" style="text-align: center;">Något gick fel! Testa att sätta på WIFI eller Mobildata.</p>');
               $('#uclass').html('<p class="text-danger" style="text-align: center;">.</p>');
               console.log(data);
            }
        });
        
        // like ajax post
        function vote(pid) {
            alert("like! vote fired off");
            alert("pid: " + pid);
            $.ajax({
                type: 'POST',
                data: { action:'wti_like_post_process_vote', task:'like', postid: pid, nonce: 'e707a027a7'},
                url: 'http://eter.rudbeck.info/wp-admin/admin-ajax.php',
                success: function(data){            
                    alert("msg: " + data.msg + ", like: " + data.like);
                    fixCordovaOutboundLinks();
                },
                error: function(){
                    function showAlert() {
                        navigator.notification.alert(
                            'Något fel inträffade, prova igen.',  // message
                            alertDismissed,         // callback
                            'ETER',            // title
                            'OK'                  // buttonName
                        );
                    }
                    showAlert();
                }
            });
            return false;
        }
        
        return dfd.promise();      
    }
};