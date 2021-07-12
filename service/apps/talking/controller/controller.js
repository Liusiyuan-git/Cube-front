let app = require("../../app")
import "../style/style.scss"

app.controller("talkingCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.contentDataGet()
    };

    $scope.menuSelect = function (key) {
        $scope.talkingMenu.forEach(function (item) {
            item.select = item.key === key
        })
    };

    $scope.talkingMenu = [{
        key: "new",
        name: "动态",
        select: true
    }, {
        key: "care",
        name: "关注",
        select: false
    },{
        key: "talk",
        name: "树洞",
        select: false
    }]
}])