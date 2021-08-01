let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.contentDataGet()
        $scope.cubeInformationGet()
        $scope.cubeViewGet()
        $scope.scroll()
        $timeout(function () {
            $scope.collectionGet()
        }, 500)
        $scope.cubetest = [1, 2, 3, 4, 5]
    };

    $scope.rocket = function () {
        document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
    };

    $scope.scroll = function () {
        let body = document.getElementById("cube-body")
        let rocket = document.getElementById("rocket")
        body.onscroll = function () {
            let scrollT = document.documentElement.scrollTop;
            rocket.style.display = "flex"
            if (70 - scrollT >= 0) {
                rocket.style.display = "none"
            }
        };
    };

    $scope.echarts = function (count) {
        let echarts = require("echarts/dist/echarts")
        let month = (new Date()).getMonth() + 1;
        let chartElement = document.getElementById('active-echarts')
        chartElement.style.height = JSON.stringify(chartElement.clientWidth) + "px"
        let myChart = echarts.init(chartElement);

        let option = {
            title: {
                text: '每月访问量'
            },
            tooltip: {},
            xAxis: {
                data: [month - 5, month - 4, month - 3, month - 2, month - 1, month]
            },
            yAxis: {},
            series: [{
                name: '访问数',
                type: 'line',
                color: ['#03a9f4'],
                data: [count[0], count[1], count[2], count[3], count[4], count[5]]
            }]
        };
        myChart.setOption(option);
    }

    $scope.menuSelect = function (key) {
        $scope.homeMenu.forEach(function (item) {
            item.select = item.key === key
        })
        $scope.contentDataGet(key)
    };

    $scope.cubeInformationGet = function () {
        dataService.callOpenApi("cube.information.get", {}, "common").then(function (data) {
            if (data.success) {
                $scope.cubeInformation = data.content
            }
        })
    };

    $scope.collectionGet = function () {
        if (!$rootScope.userId) {
            return null
        }
        dataService.callOpenApi("cube.collection.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            if (data.success) {
                $scope.cubeCollection = data.content
            }
        })
    };

    $scope.cubeViewGet = function () {
        dataService.callOpenApi("cube.view.get", {}, "common").then(function (data) {
            if (data.success) {
                $scope.echarts(data.content)
            }
        })
    };

    $scope.contentDataGet = function (mode = "new") {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("blog.get", {"mode": mode}, "common").then(function (data) {
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
                // $("#PageCount").val("10");
                // $("#PageSize").val("5");
                // $rootScope.loadpage()
            }
        })
    };

    $scope.collectionSelect = function (id) {
        $state.go("blog", {id: id})
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