let app = require("../../app")
import "../style/style.scss"

window.app.controller("forumCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', 'Upload', '$q',
    function ($rootScope, $scope, $state, $timeout, dataService, Upload, $q) {
        $scope.init = function () {
            $scope.currentFilter = $scope.forumBlock[0]
                $timeout(function () {
                    let frame = document.getElementById("container");
                    frame.className = "container in";
                }, 300);
            $scope.filterSelect($scope.forumBlock[0])
            $scope.contentDataGet()
            $scope.scroll()
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

        $scope.rocket = function () {
            document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
        };

        $scope.filterSelect = function (i) {
            $scope.forumBlock.forEach(function (item) {
                item.select = i.key === item.key
            })
            $scope.currentFilter = i
        };

        $scope.filterChildSelect = function (i) {
            $scope.currentFilter.child.forEach(function (item) {
                item.select = item.key === i.key
            })
        };

        $scope.contentDataGet = function (mode = "all", page = "1") {
            $rootScope.cubeLoading("加载中...")
            dataService.callOpenApi("forum.blog.get", {"mode": mode, "page": page}, "common").then(function (data) {
                $rootScope.swal.close()
                if (data.success) {
                    if (data.content) {
                        data.content.forEach(function (item) {
                            let time = item.date.split(" ")[0].split("-").join("")
                            item.author = item.name
                            if (item.cover) {
                                let cover = [$rootScope.fileServer + "/blog", item["cube_id"], time, item.cover].join("/")
                                item.cover = cover
                            }
                        })
                    }
                    $scope.rocket()
                    $scope.content = data.content
                    $scope.current_page = parseInt(page)
                    $scope.pageCreate(data)
                    $scope.page_created = true
                }
            })
        };

        $scope.pageCreate = function (data) {
            $("#PageCount").val(data.length);
            $("#PageSize").val(10);
            if (!$scope.page_created) {
                $rootScope.loadpage(function (num, type) {
                    if (num !== $scope.current_page) {
                        $scope.contentDataGet("all", "" + num)
                    }
                })
            }
        };

        $scope.forumBlock = [{
            "key": "all",
            "name": "全部",
            "select": true,
            "child": [{
                "key": "All",
                "name": "All",
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
    }])