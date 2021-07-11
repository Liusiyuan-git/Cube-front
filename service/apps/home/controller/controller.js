let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.contentDataGet()
    };

    $scope.menuSelect = function (key) {
        $scope.homeMenu.forEach(function (item) {
            item.select = item.key === key
        })
    };


    $scope.contentDataGet = function () {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("blog.get", {}, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success) {
                if (data.content) {
                    data.content.forEach(function (item) {
                        let time = item.date.split(" ")[0].split("-").join("")
                        item.author = item.name
                        if (item.cover) {
                            let cover = ["http://47.119.151.14:3001/blog", item["cube_id"], time, item.cover].join("/")
                            item.cover = cover
                        }
                    })
                }
                $scope.content = data.content
            }
        })
    };

    $scope.blog = function (id) {
        $state.go("blog", {id: id})
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