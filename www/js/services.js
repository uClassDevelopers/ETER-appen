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
function BaseUrl(url) {
  this.url = url;
}

angular.module('eter.services', [])
.provider("baseurl", [function () {
  var url = "http://eter.rudbeck.info/";

  this.setUrl = function (textString) {
    url = textString;
  };

  this.$get = [function () {
    return new BaseUrl(url);
  }];
}])
.factory('guidesInCourse', ['$http', function($http){
  return {
    getAll: function() {
      var courses = [];
      app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM schoolinfo ORDER BY ID DESC", [], function(tx, rs) {
          var rowlength = rs.rows.length;
          alert("rowl "+rowlength);
          if(rowlength > 0) {
            // Get all courses
            $http.get(rs.rows.item(0).otourl +'eter-app-api/'+ apikey +'&list-all-courses=1&parent=43').
            success(function(data) {
              console.log(data);
              $.each(data.list_all_courses, function(index, obj) { // loop through courses
                courses.push({ id: obj.id, name: obj.name, desc: obj.description, elements: [] });
                $.each(data.list_all_courses[index].elements.reverse(), function(i, el) { // loop through elements

                  courses[index].elements.push({ postid: el.id, posttitle: el.title, elementOrder: el.custom_fields.eter_guide_position, type: el.type});
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
              console.log(courses);
              return courses;
            });
          }
        });
      });
    }
  }
}]);
