let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.initParams();
        $scope.contentDataGet();
        $scope.userProfileGet()
        $scope.scroll();
        $timeout(function () {
            $scope.collectionGet()
        }, 500);
    };

    $scope.initParams = function () {
        $scope.currentMenu = $scope.homeMenu[0].key;
        $scope.currentFilter = $scope.forumBlock[0];
        $scope.currentFilterChild = $scope.forumBlock[0].child[0];

    };

    $scope.filterSelect = function (i) {
        $scope.forumBlock.forEach(function (item) {
            item.select = i.key === item.key;
        })
        $scope.currentFilter = i;
        $scope.filterChildSelect($scope.currentFilter.child[0]);
    };

    $scope.filterChildSelect = function (i) {
        $scope.currentFilter.child.forEach(function (item) {
            item.select = item.key === i.key;
        })
        $scope.currentFilterChild = i;
        $scope.contentDataGet($scope.currentMenu)
    };

    $scope.rocket = function () {
        document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
    };

    $scope.scroll = function () {
        let body = document.getElementById("cube-body");
        let rocket = document.getElementById("rocket");
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
                $scope.cubeCollection = data.content;
                if (data.content.length > 5) {
                    $scope.collect_up = false;
                    $scope.intervalId = setInterval($scope.collectBlockTransform, 3000)
                }
            }
        })
    };

    $scope.userProfileGet = function (){
        dataService.callOpenApi("user.profile.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            if (data.success) {
                $rootScope.userImage = "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + data.profile.image;
                $scope.userName = data.profile.name;
                $scope.userIntroduce = data.profile.introduce;
            }
        })
    };

    $scope.collectBlockTransform = function () {
        let element = document.getElementById("collect-content-block")
        if (!$scope.collect_up) {
            element.style.transform = "translate3d(0px, -180px, 0px)";
            $scope.collect_up = true
        } else {
            element.style.transform = "translate3d(0px, 0px, 0px)";
            $scope.collect_up = false
        }
    }

    $scope.contentDataGet = function (mode = "new", page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("blog.get", {
            "mode": mode,
            "page": page + "",
            "label": $scope.currentFilter.key,
            "label_type": $scope.currentFilterChild.key
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
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
                $scope.rocket();
                $scope.content = data.content;
                $scope.current_page = page;
                $scope.pageCreate(data);
                $scope.page_created = true;
            } else {
                $scope.content = null
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
        name: "最新发布",
        select: true
    }, {
        key: "hot",
        name: "按热度排序",
        select: false
    }];

    $scope.$on('$stateChangeStart', function (event, toState, toParams) {
        clearInterval($scope.intervalId)
    });

    $scope.forumBlock = [{
        "key": "",
        "name": "全部",
        "select": true,
        "child": [{
            "key": "",
            "name": "All",
            "select": true
        }, {
            "key": "python",
            "name": "Python",
            "select": false
        }, {
            "key": "go",
            "name": "Go",
            "select": false
        }, {
            "key": "java",
            "name": "Java",
            "select": false
        }, {
            "key": "javaScript",
            "name": "JavaScript++",
            "select": false
        }, {
            "key": "c++",
            "name": "C++",
            "select": false
        }, {
            "key": "c",
            "name": "C",
            "select": false
        }, {
            "key": "redis",
            "name": "Redis",
            "select": false
        }, {
            "key": "rabbitmq",
            "name": "Rabbitmq",
            "select": false
        }, {
            "key": "docker",
            "name": "Docker",
            "select": false
        }, {
            "key": "kubernetes",
            "name": "kubernetes",
            "select": false
        }, {
            "key": "mysql",
            "name": "Mysql",
            "select": false
        }, {
            "key": "live",
            "name": "生活",
            "select": false
        }],
    }, {
        "key": "language",
        "name": "语言",
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "python",
            "name": "python",
            "select": false
        }, {
            "key": "go",
            "name": "Go",
            "select": false
        }, {
            "key": "java",
            "name": "Java",
            "select": false
        }, {
            "key": "javaScript",
            "name": "JavaScript++",
            "select": false
        }, {
            "key": "c++",
            "name": "C++",
            "select": false
        }, {
            "key": "c",
            "name": "C",
            "select": false
        }],
        "select": false
    }, {
        "key": "middleware",
        "name": "中间件",
        "select": false,
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "redis",
            "name": "Redis",
            "select": false
        }, {
            "key": "rabbitmq",
            "name": "Rabbitmq",
            "select": false
        }]
    }, {
        "key": "virtualization",
        "name": "虚拟化",
        "select": false,
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "docker",
            "name": "Docker",
            "select": false
        }, {
            "key": "kubernetes",
            "name": "kubernetes",
            "select": false
        }]
    }, {
        "key": "database",
        "name": "数据库",
        "select": false,
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "mysql",
            "name": "Mysql",
            "select": false
        }]
    }, {
        "key": "other",
        "name": "其他",
        "select": false,
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "live",
            "name": "生活",
            "select": false
        }]
    }]
}])