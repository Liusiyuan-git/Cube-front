let app = require("../../app")
import "../style/style.scss"

window.app.controller("forumCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', 'Upload', '$q',
    function ($rootScope, $scope, $state, $timeout, dataService, Upload, $q) {
        $scope.init = function () {
            $timeout(function () {
                let frame = document.getElementById("container");
                frame.className = "container in";
            }, 300);
            $scope.filterSelect($scope.forumBlock[0])
            $scope.contentDataGet()
        };

        $scope.filterSelect = function (i) {
            $scope.forumBlock.forEach(function (item) {
                item.select = i.key === item.key
            })
            $scope.currentFilter = i
        };

        $scope.filterChildSelect = function (i) {
            $scope.currentFilter.child.forEach(function (item){
                item.select = item.key === i.key
            })
        };

        $scope.forumBlock = [{
            "key": "all",
            "name": "全部",
            "select": true
        }, {
            "key": "language",
            "name": "语言",
            "child": [{
                "key": "all",
                "name": "all",
                "select": true
            }, {
                "key": "Python",
                "name": "Python",
                "select": false
            }, {
                "key": "Go",
                "name": "Go",
                "select": false
            }, {
                "key": "Java",
                "name": "Java",
                "select": false
            }, {
                "key": "JavaScript",
                "name": "JavaScript++",
                "select": false
            }, {
                "key": "C++",
                "name": "C++",
                "select": false
            }, {
                "key": "C",
                "name": "C",
                "select": false
            }],
            "select": false
        }, {
            "key": "middleware",
            "name": "中间件",
            "select": false
        }, {
            "key": "Virtualization",
            "name": "虚拟化",
            "select": false
        }]

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
                    $("#PageCount").val("10");
                    $("#PageSize").val("5");
                    $rootScope.loadpage()
                }
            })
        };
    }])