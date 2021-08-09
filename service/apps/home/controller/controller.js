let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.initParams()
        $scope.filterSelect($scope.forumBlock[0]);
        $scope.contentDataGet();
        $scope.scroll();
        $timeout(function () {
            $scope.collectionGet()
        }, 500);
    };

    $scope.initParams = function (){
        $scope.currentMenu = $scope.homeMenu[0].key
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


    $scope.menuSelect = function (key) {
        $scope.homeMenu.forEach(function (item) {
            item.select = item.key === key
        })
        $scope.currentMenu = key;
        $scope.contentDataGet(key)
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

    $scope.contentDataGet = function (mode = "new", page = 1) {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("blog.get", {"mode": mode, "page": page + ""}, "common").then(function (data) {
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
                $scope.rocket()
                $scope.content = data.content
                $scope.current_page = page
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
                    $scope.contentDataGet($scope.currentMenu, num)
                }
            })
        }
    };

    $scope.collectionSelect = function (id) {
        $state.go("blog", {id: id})
    };

    $scope.blog = function (id) {
        window.open("http://127.0.0.1:3000/#!/main/community/blog?id=" + id)
    };

    $scope.homeMenu = [{
        key: "new",
        name: "最近更新",
        select: true
    }, {
        key: "hot",
        name: "点赞最多",
        select: false
    }, {
        key: "collect",
        name: "收藏最多",
        select: false
    }, {
        key: "comment",
        name: "评论最多",
        select: false
    }, {
        key: "view",
        name: "浏览最多",
        select: false
    }];

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