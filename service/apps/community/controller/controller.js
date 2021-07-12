let app = require("../../app")
import "../style/style.scss"

app.controller("communityCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService',
    function ($rootScope, $scope, $state, $timeout, dataService) {
        $scope.initCommunity = function () {
            $rootScope.cubelocation = "community"
            $scope.loginStatusCheck()
        };

        $scope.loginStatusCheck = function () {
            if (!$rootScope.login) {
                $rootScope.loginStatusCheck().then(function (data) {
                    if (data.success) {
                        $rootScope.userId = data["cubeId"];
                        $rootScope.login = true;
                        $scope.rabbitmq()
                    }
                })
            }
        };

        $scope.rabbitmq = function () {

        }
    }])