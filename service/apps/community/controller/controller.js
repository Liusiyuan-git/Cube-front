let app = require("../../app")
import "../style/style.scss"

app.controller("communityCtrl", ["$rootScope", "$scope", "$state", "$timeout", '$q', 'dataService',
    function ($rootScope, $scope, $state, $timeout, $q, dataService) {
        $scope.initCommunity = function () {
            $rootScope.cubelocation = "community";
            $scope.childHtml = false;
            $rootScope.messageCount = 0;
            $scope.loginStatusConfirm().then(function () {
                $scope.messageProfileGet();
            });
        };

        $scope.messageProfileGet = function () {
            if (!$scope.loginStatusCheck()) {
                return
            }
            dataService.callOpenApi("message.profile.get", {
                "cube_id": $rootScope.userId
            }, "private").then(function (data) {
                if (data.success) {
                    $rootScope.messageCount = data['profile'][0];
                }
                $scope.rabbitMqInit();
            });
        };

        $scope.loginStatusConfirm = function () {
            let defer = $q.defer()
            $rootScope.loginStatusCheck().then(function (data) {
                if (data.success) {
                    $rootScope.userName = localStorage.getItem("userName");
                    $rootScope.userId = localStorage.getItem("CubeId");
                    $rootScope.userImage = localStorage.getItem("userImage") ? $rootScope.fileServer + "/user/image/" + $rootScope.userId + "/" + localStorage.getItem("userImage") : null;
                    $rootScope.login = true;
                } else {
                    localStorage.removeItem('CubeId');
                    localStorage.removeItem('userImage');
                    localStorage.removeItem('userName');
                    $rootScope.userId = "";
                    $rootScope.userImage = "";
                    $rootScope.login = false;
                }
                $scope.childHtml = true;
                defer.resolve()
            });
            return defer.promise;
        }

        $scope.loginStatusCheck = function () {
            return $rootScope.login
        };

        $scope.rabbitMqInit = function () {
            if ($scope.client == null || !$scope.client.connected) {
                // let ws = new WebSocket('ws://81.68.104.55:15674/ws');
                // let ws = new WebSocket('ws://43.155.100.23:445/ws');
                let ws = new WebSocket('wss://cube.fan:445/ws');
                $scope.client = Stomp.over(ws);
                $scope.client.debug = null;
                $scope.client.connect('user', 's', $scope.onConnect, $scope.onError, '/');
            }
        };

        $scope.onConnect = function () {
            $scope.client.subscribe("/amq/queue/" + $rootScope.userId, function (d) {
                if ($rootScope.messageCount < d.body) {
                    $rootScope.messageCount = d.body;
                }
                $scope.$apply();
            });
        };

        $scope.onError = function (e) {
            $scope.rabbitMqInit()
        };

        $rootScope.$on('$MqClose', function () {
            if ($scope.client.connected) {
                $scope.client.disconnect();
            }
        });
    }])