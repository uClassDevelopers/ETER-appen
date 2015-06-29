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
                    if(pid != "start") {
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

    /*loadReadItems: function (tx, rs) {
        var rowOutput = "",
            todoItems = document.getElementById("lblInfo"),
            row;

        for (var i = 0; i < rs.rows.length; i++) {
            row = rs.rows.item(i);
            rowOutput += "<li style='border:1px solid #000000; margin: 2px;'> ID: " + row.ID + ", postid:" + row.postid + ", added_on: <span style='color:red;'>" + row.added_on + "</span> [<a href='javascript:void(0);' onclick=\'app.deleteReadById(" + row.ID + ");\'>Delete</a>]</li>";
        }
        if (typeof window.MSApp != 'undefined') {
            MSApp.execUnsafeLocalFunction(function () {
                todoItems.innerHTML = rowOutput;
            });
        } else {
            todoItems.innerHTML = rowOutput;
        }
    },

    dbError: function (error) {
        console.log('DB Error: ' + JSON.stringify(error));
        document.getElementById("lblDBError").innerHTML = 'DB ERROR: ' + JSON.stringify(error);
    },*/

    dbSuccess: function () {
        console.log('DB Operation completed successfully');
        document.getElementById("lblDBInfo").innerHTML += 'DB Operation completed successfully<br\>';
    },

    testEvents: function() {
        var db = openDatabase('testEvents.db', '1.0', 'testEvents', 2 * 1024);
        db.transaction (
            function (tx) {
                console.log('transaction 1');
                tx.executeSql('DROP TABLE IF EXISTS foo');
                tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
                tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "foobar")');
                document.querySelector('#status').innerHTML = '<p>foo created and row inserted.</p>';
            },
            app.dbError,
            function () {
                db.transaction(function (tx) {
                    console.log('transaction 2');
                    tx.executeSql('DROP TABLE foo');

                    // known to fail - so should rollback the DROP statement
                    tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "foobar")');
                }, 
                function (err) {
                    console.log('transaction 2 err: ' + JSON.stringify(err));
                    document.querySelector('#status').innerHTML += '<p>should be rolling back caused by: <code>' + err + '</code></p>';

                    db.transaction(function (tx) {
                        console.log('transaction 3');
                        tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
                            document.querySelector('#status').innerHTML += '<p>found rows (should be 1): ' + results.rows.length + '</p>';
                        }, function (tx, err) {
                            document.querySelector('#status').innerHTML += '<p>failed (rollback failed): <em>' + err.message + '</em></p>';
                            document.querySelector('#status').className = 'error';
                        });
                    });
                },
                function () {
                    console.log('transaction 2 unexpected success!');
                });
            });        
    },

    testJSONBlob: function () {
        var arr = [{name: 'Ivan', title: 'Mr.', age: 25}, 'some string', 42, [1, 2, 3], ['a', 'b', 1, 10], [[1, 2, 3], ['a', 'b', 'c']]];
        var db = openDatabase('testJSONBlob.db', '1.0', 'testJSONBlob', 2 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS blob');
            tx.executeSql('CREATE TABLE IF NOT EXISTS blob (id unique, text)');
            tx.executeSql('INSERT INTO blob (id, text) VALUES (?, ?)', [1, JSON.stringify(arr)]);
            document.querySelector('#status').innerHTML = '<p>foo created and row inserted.</p>';

            tx.executeSql('SELECT * FROM blob', [], function (tx, results) {
                document.querySelector('#status').innerHTML += '<p>found rows (should be 1): ' + results.rows.length + '</p>';
                document.querySelector('#status').innerHTML += '<p>found row value: ' + results.rows[0].text + '</p>';
                var parsedArr = JSON.parse(results.rows[0].text);
                document.querySelector('#status').innerHTML += '<p>parsed array: ' + parsedArr + '</p>';
                document.querySelector('#status').innerHTML += '<p>parsed array (stringified): ' + JSON.stringify(parsedArr) + '</p>';
            }, function (tx, err) {
                document.querySelector('#status').innerHTML += '<p>blob select failed: <em>' + err.message + '</em></p>';
                document.querySelector('#status').className = 'error';
            });
        }, app.dbError, app.dbSuccess);
    },

    testRollbacksAfterFailures: function() {
       function log(message) {
                document.getElementById("console").innerHTML += message + "<br>";
            }
            // signal to testRunner when this reaches zero.
        var testCount = 4;
         // we first retrieve and store the number of rows already in our test database.
         // our goal is to keep the number unchanged through the tests.
        var initialRowCount = 0;
        var database;
        var successCallbackCalled;

        function finishTest() {
            if (--testCount)
                return;
            log("All Tests are complete.");
            if (window.testRunner)
                testRunner.notifyDone();
        }

        function successCallback() {
            successCallbackCalled = true;
        }

        function verifySuccess(msg) {
            database.transaction(function(tx) {
                tx.executeSql("SELECT count(*) AS count FROM ErrorCallbackTest", [], function(tx, rs) {
                    log(msg + " : " + (rs.rows.item(0).count == initialRowCount && !successCallbackCalled ? "SUCCESS" : "FAILURE"));
                    finishTest();
                });
            });
        }

        function failMidWay(errorCallback) {
            successCallbackCalled = false;
            database.transaction(function(tx) {
                tx.executeSql("INSERT INTO ErrorCallbackTest(someValue) VALUES(?);", [1]);
                tx.executeSql("MUTTER SOMETHING ILLEGIBLE");
            }, errorCallback, successCallback);
        }

        function statementCallbackThrowsException(errorCallback) {
            successCallbackCalled = false;
            database.transaction(function(tx) {
                tx.executeSql("INSERT INTO ErrorCallbackTest(someValue) VALUES(?);", [1], function() {
                    throw {};
                });
            });
        }

        function runTest() {
            database = openDatabase("testRollbacksAfterFailures.db", "1.0", "testRollbacksAfterFailures", 1);

            database.transaction(function(tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS ErrorCallbackTest (someValue)", []);
                tx.executeSql("SELECT count(*) AS count FROM ErrorCallbackTest", [], function(tx, rs) {
                    initialRowCount = rs.rows.item(0).count;
                });
            });

            failMidWay(function() {
                return true;
            });
            verifySuccess("Testing transaction failing mid-way and error callback returning true");

            failMidWay(function() {
                return false;
            });
            verifySuccess("Testing transaction failing mid-way and error callback return false");

            statementCallbackThrowsException(function() {
                return true;
            });
            verifySuccess("Testing statement callback throwing exception and error callback returning true");

            statementCallbackThrowsException(function() {
                return false;
            });
            verifySuccess("Testing statement callback throwing exception and error callback returning false");
        } 

        runTest();
    },
            
    testLongTransactions: function () {
        //sleep function for simulate long transaction
        function sleep(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }

        var db = openDatabase('testLongTransaction.db', '1.0', 'testLongTransaction', 2 * 1024);
        document.querySelector('#status').innerHTML += '<p>start1</p>';
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS foo');
            tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
            tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "foobar")');
        }, function() {
            document.querySelector('#status').innerHTML += '<p>Table created</p>';
        });

        document.querySelector('#status').innerHTML += '<p>start2.</p>';
        db.readTransaction(function (tx) {
            sleep(2000);
            tx.executeSql('SELECT * FROM foo', [], function(tx, results) {
                document.querySelector('#status').innerHTML += '<p>found rows (should be 1): ' + results.rows.length + ' (first)</p>';
            });
        });

        document.querySelector('#status').innerHTML += '<p>start3.</p>';
        db.readTransaction(function (tx) {
            sleep(1000);
            tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
                document.querySelector('#status').innerHTML += '<p>found rows (should be 1): ' + results.rows.length + ' (second)</p>';
            });
        });

        db.transaction(function (tx) {
            sleep(500);
            tx.executeSql('INSERT INTO foo (id, text) VALUES(2, "foobar")');
        });

        db.readTransaction(function (tx) {
            tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
                document.querySelector('#status').innerHTML += '<p>found rows (should be 2): ' + results.rows.length + ' (first)</p>';
            });
        });
    },

    testPrelightPostflight: function() {
        var db = openDatabase('testPrelightPostflight.db', '1.0', 'testPrelightPostflight', 2 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('DROP TABLE IF EXISTS foo');
            tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
            tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "foobar")');

            document.querySelector('#status').innerHTML += '<p>operations done</p>';
        }, null, function () {
            document.querySelector('#status').innerHTML += '<p>onSuccess run</p>';
        }, function() {
            document.querySelector('#status').innerHTML += '<p>Preflight run</p>';
        }, function() {
            document.querySelector('#status').innerHTML += '<p>Postflight run</p>';
        });
    },

    testNestedTransaction: function() {
        var db = openDatabase('testNestedTransaction.db', '1.0', 'testNestedTransaction', 2 * 1024);
        db.transaction(function(tx) {
            tx.executeSql('DROP TABLE IF EXISTS foo', [], function() {
                document.querySelector('#status').innerHTML += '<p>table dropped</p>';
            }, function() {
                document.querySelector('#status').innerHTML += '<p>error drop</p>';
            });
            tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)', [], function() {
                document.querySelector('#status').innerHTML += '<p>table created</p>';
            });
            tx.executeSql('SELECT * FROM foo', [], function(tx, res) {
                document.querySelector('#status').innerHTML += '<p>' + JSON.stringify(res.rows) + '</p>';
            });
            db.transaction(function(tx1) {
                tx1.executeSql('INSERT INTO foo (id, text) VALUES (1, "foobar")');
            }, function() {
                document.querySelector('#status').innerHTML += '<p>error nested</p>';
            }, function() {
                document.querySelector('#status').innerHTML += '<p>row inserted</p>';
            }, null, null, false, tx);
            tx.executeSql('SELECT * FROM foo', [], function(tx, res) {
                document.querySelector('#status').innerHTML += '<p>' + JSON.stringify(res.rows) + '</p>';
                document.querySelector('#status').innerHTML += '<p>Expected 1 row</p>';
            });
        });
    },

    openDatabaseMultipleTimes: function () {
        var dbSize = 5 * 1024 * 1024; // 5MB
        // open database        
        app.tempDb1 = openDatabase("TodoMultiple", "", "Todo manager", dbSize, function() {
            console.log('db successfully opened or created #1');
            app.tempDb1.transaction(function (tx) {
                tx.executeSql("DROP TABLE IF EXISTS todo", [], null, app.onError);
                tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on TEXT)", [],
                    null, app.onError);
                var text = "test1";
                var ts = new Date().toUTCString();
                tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)", [text, ts], null, app.onError);
            }, app.dbError, function() {
                app.tempDb2 = openDatabase("TodoMultiple", "", "Todo manager", dbSize, function () {
                    console.log('db successfully opened or created #2');
                    app.tempDb2.transaction(function (tx) {
                        var text = "test2";
                        var ts = new Date().toUTCString();
                        tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)", [text, ts], null, app.onError);

                        console.log('there should be 2 rows now:');
                        tx.executeSql("SELECT * FROM todo", [], function (tx, res) {
                            console.log(res.rows.length);
                            document.querySelector('#status').innerHTML += '<p>found rows (should be 2): ' + res.rows.length + '</p>';
                        }, app.onError);
                    });
                });
            });
        });
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
        
        return dfd.promise();      
    }
};