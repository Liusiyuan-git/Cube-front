let app = require("../../app")
import "../style/style.scss"

app.controller("homeCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.initState();
        $scope.contentDataGet($scope.current_page);
        $scope.userProfileGet();
        $scope.scroll();
        $timeout(function () {
            $scope.collectionGet();
        }, 500);
    };

    $scope.initState = function () {
        let page = parseInt($state.params.page)
        let menu = parseInt($state.params.menu)
        let filter = parseInt($state.params.filter)
        let filterChild = parseInt($state.params.child)
        $scope.current_page = page ? page : 1
        if (!$scope.homeMenu[menu]) {
            $scope.initParams(0, 0, 0);
            $state.go("home", {page: 1, menu: 0, filter: 0, child: 0}, {notify: false, reload: false})
            return null;
        }
        if (!$scope.forumBlock[filter]) {
            $scope.initParams(0, 0, 0);
            $state.go("home", {page: 1, menu: 0, filter: 0, child: 0}, {notify: false, reload: false})
            return null;
        }
        if (!$scope.forumBlock[filter].child[filterChild]) {
            $scope.initParams(0, 0, 0);
            $state.go("home", {page: 1, menu: 0, filter: 0, child: 0}, {notify: false, reload: false})
            return null;
        }
        $scope.initParams(menu, filter, filterChild);
    };

    $scope.initParams = function (menu, filter, filterChild) {
        $scope.currentMenu = $scope.homeMenu[menu].key;
        $scope.currentFilter = $scope.forumBlock[filter];
        $scope.currentFilterChild = $scope.forumBlock[filter].child[filterChild];
    };

    $scope.goToUserProfile = function (index, cube_id, e) {
        e && e.stopPropagation();
        localStorage.setItem("profileId", cube_id || $rootScope.userId);
        $state.go("profile", {state: 'profile', "menu": index});
    };

    $scope.filterSelect = function (i, index) {
        $scope.currentFilter = i;
        $state.go("home", {filter: index}, {notify: false, reload: false})
        $timeout(function () {
            $scope.filterChildSelect($scope.currentFilter.child[0], 0);
        }, 50)
    };

    $scope.filterChildSelect = function (i, index) {
        $scope.page_created = false;
        $scope.currentFilterChild = i;
        $scope.currentMenu = $scope.homeMenu[0].key;
        $state.go("home", {page: 1, menu: 0, child: index}, {notify: false, reload: false})
        $scope.contentDataGet()
    };

    $scope.rocket = function () {
        document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
    };

    $scope.rocketTop = function () {
        document.documentElement.scrollIntoView({block: 'start'})
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

    $scope.menuSelect = function (key, index) {
        $scope.page_created = false;
        $scope.currentMenu = key;
        $state.go("home", {page: 1, menu: index}, {notify: false, reload: false})
        $scope.contentDataGet()
    };

    $scope.collectionGet = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi("cube.collection.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            if (data.success) {
                $scope.cubeCollection = data.content;
                if (data.content && data.content.length > 5) {
                    $scope.collect_up = false;
                    $scope.intervalId = setInterval($scope.collectBlockTransform, 3000);
                }
            } else {
                $rootScope.cubeWarning("error", data.msg || "未知错误");
            }
        })
    };

    $scope.userProfileGet = function () {
        dataService.callOpenApi("user.profile.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            if (data.success) {
                $rootScope.userImage = data.profile[0] ? $rootScope.fileServer + "/user/image/" + $rootScope.userId + "/" + data.profile[0] : null
                $scope.userName = data.profile[1];
                $scope.userIntroduce = data.profile[2];
                $scope.userCare = data.profile[6];
                $scope.userCaring = data.profile[7]
            }
        })
    };

    $scope.collectBlockTransform = function () {
        let element = document.getElementById("collect-content-block")
        if (!$scope.collect_up) {
            element.style.transform = "translate3d(0px, -180px, 0px)";
            $scope.collect_up = true;
        } else {
            element.style.transform = "translate3d(0px, 0px, 0px)";
            $scope.collect_up = false;
        }
    }

    $scope.contentDataGet = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("blog.get", {
            "mode": $scope.currentMenu,
            "page": page + "",
            "label": $scope.currentFilter.key,
            "label_type": $scope.currentFilterChild.key
        }, "common").then(function (data) {
            $rootScope.swal.close();
            if (data.success && data.length) {
                if (data.content) {
                    let profileIdBox = [];
                    data.content.forEach(function (item, index) {
                        item = JSON.parse(item);
                        profileIdBox.push(item.id);
                        let time = item.date.split(" ")[0].split("-").join("");
                        item.author = item.name;
                        if (item.cover) {
                            let cover = [$rootScope.fileServer + "/blog", item["cube_id"], time, item.cover].join("/");
                            item.cover = cover;
                        }
                        data.content[index] = item;
                    })
                    $scope.blogProfileGet(profileIdBox);
                }
                $scope.content = data.content;
                $scope.current_page = page;
                $scope.pageCreate(data);
                $scope.page_created = true;
            } else {
                $scope.content = null;
            }
        })
    };

    $scope.blogProfileGet = function (profileIdBox) {
        dataService.callOpenApi("blog.profile.get", {
            ids: profileIdBox.join(";")
        }, "common").then(function (data) {
            $scope.blogProfile = data.profile;
        })
    };

    $scope.pageCreate = function (data) {
        $("#PageCount").val(data.length);
        $("#PageSize").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.contentDataGet(num);
                    $state.go("home", {page: num}, {notify: false, reload: false})
                }
            }, "", $scope.current_page > data.length ? 1 : $scope.current_page)
        }
    };

    $scope.collectionSelect = function (id) {
        $state.go("blog", {id: id})
    };

    $scope.blog = function (id) {
        $state.go("blog", {id: id})
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
            "name": "JavaScript",
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
            "key": "microServices",
            "name": "微服务",
            "select": false
        }, {
            "key": "network",
            "name": "网络",
            "select": false
        }, {
            "key": "dataStructure",
            "name": "数据结构和算法",
            "select": false
        }, {
            "key": "operatingSystem",
            "name": "操作系统",
            "select": false
        }, {
            "key": "computerComposition",
            "name": "计算机组成原理",
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
            "name": "JavaScript",
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
        "name": "云原生",
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
        }, {
            "key": "microServices",
            "name": "微服务",
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
        "key": "basics",
        "name": "计算机基础",
        "select": false,
        "child": [{
            "key": "all",
            "name": "All",
            "select": true
        }, {
            "key": "network",
            "name": "网络",
            "select": false
        }, {
            "key": "dataStructure",
            "name": "数据结构和算法",
            "select": false
        }, {
            "key": "operatingSystem",
            "name": "操作系统",
            "select": false
        }, {
            "key": "computerComposition",
            "name": "计算机组成原理",
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