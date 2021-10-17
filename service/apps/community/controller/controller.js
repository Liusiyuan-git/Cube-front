let app = require("../../app")
import "../style/style.scss"

app.controller("communityCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService',
    function ($rootScope, $scope, $state, $timeout, dataService) {
        $scope.initCommunity = function () {
            $rootScope.cubelocation = "community";
            $rootScope.messageCount = 0;
            $scope.loginStatusCheck();
            $scope.rabbitMqInit();
        };

        $scope.loginStatusCheck = function () {
            let starttime = parseInt(localStorage.getItem("setLoginStartTime"));
            let currenttime = (Date.parse(new Date())) / 1000;
            let second = Math.floor(currenttime - starttime);
            if (second <= 86400) {
                $rootScope.userId = localStorage.getItem("CubeId");
                $rootScope.userImage = localStorage.getItem("userImage") ? "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + localStorage.getItem("userImage") : null;
                $rootScope.login = true;
                return true
            } else {
                localStorage.removeItem('setLoginStartTime');
                localStorage.removeItem('CubeId');
                localStorage.removeItem('userImage');
                $rootScope.userId = "";
                $rootScope.userImage = "";
                $rootScope.login = false;
                return false
            }
        };


        $scope.rabbitMqInit = function () {
            if (!$rootScope.userId) {
                return
            }
            let ws = new WebSocket('ws://81.68.104.55:15674/ws');
            let client = Stomp.over(ws);
            client.debug = null;
            let on_connect = function (x) {
                client.subscribe("/amq/queue/" + $rootScope.userId, function () {
                    $rootScope.messageCount += 1;
                    client.disconnect(function () {
                        $scope.rabbitMqInit();
                    });
                });
            };
            let on_error = function () {
                ws.close();
                $scope.rabbitMqInit();
            };
            client.connect('admin', '201020120402ssS~', on_connect, on_error, '/');
        };
    }])