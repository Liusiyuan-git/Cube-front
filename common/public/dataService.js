import app from "../base"

app.service("dataService", ["$rootScope", "$http", "$q",
    function ($rootScope, $http, $q) {
        return {
            callOpenApi: function (api_name, api_params = {}, mode = "main") {
                let defer = $q.defer()
                // let _url = "http://" + "127.0.0.1:8080" + "/api/" + mode + "/" + api_name;
                // let _url = "http://43.155.100.23:8080" + "/api/" + mode + "/" + api_name;
                let _url = "https://www.cube.fan:8080" + "/api/" + mode + "/" + api_name;
                $http.post(_url, api_params).then(function (data) {
                    success_handler(data.data)
                }, function (data) {
                    fail_handler(data.data)
                })

                function success_handler(data) {
                    defer.resolve(data)
                }

                function fail_handler(data) {
                    defer.reject(data)
                }
                return defer.promise;
            },
        }
    }])