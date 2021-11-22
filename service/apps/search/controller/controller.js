import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

app.filter(
    'changeToHtml', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        }
    }]
)

app.controller("searchCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame1 = document.getElementById("container");
            let frame2 = document.getElementById("search");
            frame1.className = "container in";
            frame2.className += " search-disappear in";
        }, 300);
    };

    $scope.searchListSelect = function (i) {
        $scope.searchContent["text"] = i;
    };

    $scope.searchFocus = function () {
        $scope.searchList = JSON.parse(localStorage.getItem("search"));
        $scope.searchListShow = true;
    };

    $scope.searchBlur = function () {
        $scope.searchListShow = false;
    };

    $scope.cubeSearch = function (content) {
        if (content === '') {
            $rootScope.cubeWarning("info", "请输入搜索内容");
            return null;
        }
        let search = JSON.parse(localStorage.getItem("search"));
        if (!search) {
            search = [];
            search.unshift(content);
        } else if (search.length < 10) {
            if (search.indexOf(content) === -1) {
                search.unshift(content);
            }
        } else {
            if (search.indexOf(content) === -1) {
                search.pop();
                search.unshift(content);
            }
        }
        $scope.searchWord = true;
        $scope.page_created = false;
        localStorage.setItem("search", JSON.stringify(search));
        $scope.searchContent["text"] = content;
        if ($scope.currentSearchMenu) {
            $scope.currentSearchMenu.func()
        } else {
            $scope.searchBlog();
        }
        $state.go("search", {state: "search", search: content}, {notify: false, reload: false})
    };

    $scope.initParams = function () {
        $scope.searchContent = {};
        if ($state.params.search) {
            $scope.searchWord = true;
            $scope.cubeSearch($state.params.search);
        } else {
            $scope.searchWord = null;
        }
        $scope.searchListShow = false;
        $scope.currentSearchMenu = $scope.searchMenu[0];
    };

    $scope.$on('$stateChangeStart', function (event, toState, toParams) {
        let frame = document.getElementById("search");
        frame.className += "container";
    });

    $scope.searchBlog = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("blog.search", {
            keyWord: $scope.searchContent["text"],
            page: page + ""
        }, "common").then(function (data) {
            $rootScope.swal.close();
            data.content.forEach(function (item) {
                let time = item['_source'].date.split(" ")[0].split("-").join("");
                if (item['_source'].cover) {
                    let cover = ["http://47.119.151.14:3001/blog", item['_source']["cube_id"], time, item['_source'].cover].join("/")
                    item['_source'].cover = cover
                }
                if (item["highlight"]["text"]) {
                    item["highlight"]["text"] = [item["highlight"]["text"].join("...")]
                }
            })
            $scope.blogData = data.content;
            $scope.current_page = page;
            $scope.pageBlogCreate(data);
            $scope.page_created = true;
        });
    };

    $scope.searchTalk = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("talk.search", {
            keyWord: $scope.searchContent["text"],
            page: page + ""
        }, "common").then(function (data) {
            $rootScope.swal.close();
            $scope.talkImagesSet(data.content);
            $scope.talkData = data.content;
            $scope.current_page = page;
            $scope.pageTalkCreate(data);
            $scope.page_created = true;
        });
    };

    $scope.searchUser = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("user.search", {
            keyWord: $scope.searchContent["text"],
            page: page + ""
        }, "common").then(function (data) {
            $rootScope.swal.close();
            $scope.userData = data.content;
            $scope.current_page = page;
            $scope.pageUserCreate(data);
            $scope.page_created = true;
        });
    };

    $scope.talkImagesSet = function (content) {
        $scope.talkImagesBlock = {};
        content.forEach(function (item) {
            let time = item['_source'].date.split(" ")[0].split("-").join("")
            if (item['_source'].images) {
                item['_source'].images.split(":").forEach(function (image) {
                    let link = ["http://47.119.151.14:3001/talk", item['_source']["cube_id"], time, image].join("/")
                    if (!$scope.talkImagesBlock[item['_source']["index"]]) {
                        $scope.talkImagesBlock[item['_source']["index"]] = [link]
                    } else {
                        $scope.talkImagesBlock[item['_source']["index"]].push(link)
                    }
                });
            }
            if (item["highlight"]["text"]) {
                item["highlight"]["text"] = [item["highlight"]["text"].join("...")]
            }
        });
    };

    $scope.talkImagesClick = function (image) {
        const viewer = new Viewer(document.getElementById(image), {
            navbar: false,
            title: false,
            keyboard: false,
            zIndex: 20000,
            toolbar: {
                zoomIn: 4,
                zoomOut: 4,
                reset: 4,
                rotateLeft: 4,
                rotateRight: 4,
                flipHorizontal: 4,
                flipVertical: 4,
            },
        });
        viewer.show();
    };

    $scope.goToUserProfile = function (cube_id) {
        localStorage.setItem("profileId", cube_id);
        $state.go("profile", {state: 'profile', "menu": 0});
    };

    $scope.pageBlogCreate = function (data) {
        if (data.length) {
            $("#PageCountblog").val(data.length);
            $("#PageSizeblog").val(10);
            if (!$scope.page_created) {
                $rootScope.loadpage(function (num, type) {
                    if (num !== $scope.current_page) {
                        $scope.rocketTop();
                        $scope.searchBlog(num);
                    }
                }, "blog")
            }
        }
    };

    $scope.goToUserProfile = function (cube_id, e) {
        e && e.stopPropagation();
        localStorage.setItem("profileId", cube_id);
        $state.go("profile", {state: 'profile', "menu": 0});
    };

    $scope.pageTalkCreate = function (data) {
        if (data.length) {
            $("#PageCounttalk").val(data.length);
            $("#PageSizetalk").val(10);
            if (!$scope.page_created) {
                $rootScope.loadpage(function (num, type) {
                    if (num !== $scope.current_page) {
                        $scope.rocketTop();
                        $scope.searchTalk(num);
                    }
                }, "talk")
            }
        }
    };

    $scope.blog = function (id) {
        $state.go("blog", {id: id})
    };

    $scope.pageUserCreate = function (data) {
        if (data.length) {
            $("#PageCountuser").val(data.length);
            $("#PageSizeuser").val(10);
            if (!$scope.page_created) {
                $rootScope.loadpage(function (num, type) {
                    if (num !== $scope.current_page) {
                        $scope.rocketTop();
                        $scope.searchUser(num);
                    }
                }, "user")
            }
        }
    };

    $scope.menuSelect = function (key) {
        $scope.page_created = false;
        $scope.searchMenu.forEach(function (item) {
            if (item.key === key) {
                $scope.currentSearchMenu = item;
                item.func();
            }
            item.select = item.key === key;
        })
    };

    $scope.rocketTop = function () {
        document.documentElement.scrollIntoView({block: 'start'})
    };

    $scope.searchMenu = [{
        key: "blog",
        name: "文章",
        func: $scope.searchBlog,
        select: true
    }, {
        key: "talk",
        name: "说说",
        func: $scope.searchTalk,
        select: false
    }, {
        key: "user",
        name: "找人",
        func: $scope.searchUser,
        select: false
    }]
}])