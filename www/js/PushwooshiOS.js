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
* PW PRODUCTION com.uclass.eter id 4AB6E-0238F
*
* PW DEV com.uclassdevs.eter id 04AA1-0ECE1
*/

function registerPushwooshIOS() {
  var pushNotification = window.plugins.pushNotification;

  //set push notification callback before we initialize the plugin
  document.addEventListener('push-notification', function(event) {
    //get the notification payload
    var notification = event.notification;
    console.log(notification);


    function alertDismissed(buttonIndex) {
      //alert('You selected button ' + buttonIndex);
      if(buttonIndex == 1) {
        console.log('alert dismissed');
        location.href="#/tab/start/"+notification.l;
      }
    }

    function showAlert() {
      navigator.notification.confirm(
        notification.aps.alert, // message
        alertDismissed,            // callback to invoke with index of button pressed
        'ETER',           // title
        ['Visa','Avböj']     // buttonLabels
      );
    }
    showAlert();

    //clear the app badge
    pushNotification.setApplicationIconBadgeNumber(0);
  });

  //initialize the plugin
  pushNotification.onDeviceReady({pw_appid:"04AA1-0ECE1"});

  if(!window.localStorage['Pushwoosh']){
    //register for pushes
    pushNotification.registerDevice(
      function(status) {
        var deviceToken = status['deviceToken'];
        console.warn('registerDevice: ' + deviceToken);
        window.localStorage['Pushwoosh'] = true;
      },
      function(status) {
        console.warn('failed to register : ' + JSON.stringify(status));
        alert(JSON.stringify(['failed to register ', status]));
      }
    );
  }

  //reset badges on app start
  pushNotification.setApplicationIconBadgeNumber(0);
}
