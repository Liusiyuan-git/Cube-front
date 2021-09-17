let app = require("../../app")
import "../style/style.scss"

app.controller("communityCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService',
    function ($rootScope, $scope, $state, $timeout, dataService) {
        $scope.initCommunity = function () {
            $rootScope.cubelocation = "community";
            $scope.loginStatusCheck();
        };

        $scope.loginStatusCheck = function () {
            let starttime = parseInt(localStorage.getItem("setLoginStartTime"));
            let currenttime = (Date.parse(new Date())) / 1000;
            let second = Math.floor(currenttime - starttime);
            if (second <= 86400) {
                $rootScope.userId = localStorage.getItem("CubeId");
                $rootScope.login = true;
                return true
            } else {
                localStorage.removeItem('setLoginStartTime');
                localStorage.removeItem('CubeId');
                $rootScope.userId = "";
                $rootScope.login = false;
                return false
            }
        };

        $scope.rabbitmq = function () {

        }
    }])