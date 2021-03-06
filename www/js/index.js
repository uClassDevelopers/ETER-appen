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
        console.log('Created tables successfully!');
        document.getElementById("lblTxInfo").innerHTML = 'RowsAffected: ' + resultSet.rowsAffected + '; InsertId: ' + resultSet.insertId;
		app.renderSchoolItems(transaction);
        app.renderReadItems(transaction);
		app.renderLikedItems(transaction);
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
            tx.executeSql("CREATE TABLE IF NOT EXISTS readposts(ID INTEGER PRIMARY KEY ASC, postid INTEGER, added_on TEXT)", []);
			tx.executeSql("CREATE TABLE IF NOT EXISTS likedposts(ID INTEGER PRIMARY KEY ASC, postid INTEGER)", []);
			tx.executeSql("CREATE TABLE IF NOT EXISTS schoolinfo(ID INTEGER PRIMARY KEY ASC, otoid INTEGER, otourl TEXT)", [],
                app.onSuccess, app.onError);

        });
    },

	deleteSchoolInfoById: function (id) {
        console.log('Delete school info item: ' + id);
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM schoolinfo WHERE ID=?", [id], app.renderSchoolItems);
        });
    },

	checkForSchoolOrAdd: function(oid, oUrl) {
		app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM schoolinfo", [], function(tx, rs) {
                var row;
                var rowlength = rs.rows.length;
                if(rowlength > 0) {
                    for (var i = 0; i < rowlength; i++) {
                        row = rs.rows.item(i);
                        app.deleteSchoolInfoById(row.ID);
											  console.log("adding school: " + row.ID + " | " + row.otourl);
												tx.executeSql("INSERT INTO schoolinfo(otoid, otourl) VALUES (?,?)", [oid, oUrl], app.onSuccess, app.onError);
                    }
                } else {
					app.db.transaction(function (tx) {
						tx.executeSql("INSERT INTO schoolinfo(otoid, otourl) VALUES (?,?)", [oid, oUrl], app.onSuccess, app.onError);
						//alert("added!");
					});
                }
            }, app.onError);
        });
	},

    checkIfReadAndAdd: function (pid) {
		//alert("checkIfReadAndAdd: "+pid);
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

	checkIfLikedAndAdd: function (pid) {
		//alert("checkIfLikedAndAdd: "+pid);
        app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM likedposts", [], function(tx, rs) {
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
                                        tx.executeSql("INSERT INTO likedposts(postid) VALUES (?)", [pid], app.onSuccess, app.onError);
                                        //alert("added!");
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if(pid != "start" && pid != "courses") {
                        app.db.transaction(function (tx) {
                            tx.executeSql("INSERT INTO likedposts(postid) VALUES (?)", [pid], app.onSuccess, app.onError);
                            //alert("added!");
                        });
                    }
                }
            }, app.onError);
        });
    },

	renderSchoolItems: function (tx) {
        tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function (tx, rs) {
            var rowOutput = "",
                todoItems = document.getElementById("lblInfo0"),
                row;

            for (var i = 0; i < rs.rows.length; i++) {
                row = rs.rows.item(i);
                rowOutput += "<li style='border:1px solid #000000; margin: 2px;'> ID: " + row.ID + ", otoid:" + row.otoid + ", otourl: " + row.otourl + "[<a href='javascript:void(0);' onclick=\'app.deleteSchoolInfoById(" + row.ID + ");\'>Delete</a>]</li>";
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

	renderLikedItems: function (tx) {
        tx.executeSql("SELECT * FROM likedposts ORDER BY ID DESC", [], function (tx, rs) {
            var rowOutput = "",
                todoItems = document.getElementById("lblInfo2"),
                row;

            for (var i = 0; i < rs.rows.length; i++) {
                row = rs.rows.item(i);
                rowOutput += "<li style='border:1px solid #000000; margin: 2px;'> ID: " + row.ID + ", postid:" + row.postid + " <span style='color:green;'></span> [<a href='javascript:void(0);' onclick=\'app.deleteLikedById(" + row.ID + ");\'>Delete</a>]</li>";
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
        console.log('Delete read item: ' + id);
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM readposts WHERE ID=?", [id], app.renderReadItems);
        });
    },

	deleteLikedById: function (id) {
        console.log('Delete liked item: ' + id);
        app.db.transaction(function (tx) {
            tx.executeSql("DELETE FROM likedposts WHERE ID=?", [id], app.renderLikedItems);
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
        /*document.addEventListener('deviceready', this.onDeviceReady, false);

        document.getElementById('renderDb').addEventListener('click', this.onSuccess);
		document.getElementById('btnOpenDb').addEventListener('click', this.openDatabase);
        document.getElementById('btnCreateTable').addEventListener('click', this.createTable);
        document.getElementById('btnDeleteAllRead').addEventListener('click', this.deleteAllRead);
        document.getElementById('btnTestEvents').addEventListener('click', this.testEvents);
        document.getElementById('btnTestJSONBlob').addEventListener('click', this.testJSONBlob);
        document.getElementById('btnTestRollbacksAfterFailures').addEventListener('click', this.testRollbacksAfterFailures);
        document.getElementById('bthTestLongTransactions').addEventListener('click', this.testLongTransactions);
        document.getElementById('btnTestPrelightPostflight').addEventListener('click', this.testPrelightPostflight);
        document.getElementById('btnTestNestedTransaction').addEventListener('click', this.testNestedTransaction);
        document.getElementById('btnOpenDbMul').addEventListener('click', this.openDatabaseMultipleTimes);*/
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        cordova.exec.setJsToNativeBridgeMode(cordova.exec.jsToNativeModes.XHR_NO_PAYLOAD);
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};
