let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $scope.contentDataGet()
    };

    $scope.menuSelect = function (key) {
        $scope.homeMenu.forEach(function (item) {
            item.select = item.key === key
        })
    };

    $scope.contentDataGet = function (){
        dataService.callOpenApi("blog.get",{},"community").then(function (data){
            if(data.success){
                $scope.content = data.content
            }
        })
    };

    $scope.homeMenu = [{
        key: "new",
        name: "最新",
        select: true
    }, {
        key: "hot",
        name: "最热",
        select: false
    }, {
        key: "follow",
        name: "关注",
        select: false
    }]
}])