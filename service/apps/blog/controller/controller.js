import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.css'

app.controller("blogCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', '$q', function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.rocketTop();
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $rootScope.$emit('$stateChangeSuccess');
        $scope.scroll();
        $scope.editorInit();
        $scope.commentEditorInit();
        $scope.blogDetailGet($state.params.id);
        $scope.collectProfileGet($state.params.id);
        $scope.blogViewSet($state.params.id);
    };

    $scope.editorInit = function () {
        $scope.editor = new E('#blog-toolbar', '#blog-text');
        $scope.editor.config.height = 1200;
        $scope.editor.config.zIndex = 2000;
        $scope.editor.config.uploadImgMaxSize = 2 * 1024 * 1024;
        $scope.editor.config.uploadImgShowBase64 = true;
        $scope.editor.config.showLinkImg = false;
        $scope.editor.config.fontSizes = "17";
        $scope.editor.highlight = hljs;
        $scope.editor.create();
        $scope.editor.disable();
    };

    $scope.goToUserProfile = function (cube_id, e) {
        e && e.stopPropagation();
        localStorage.setItem("profileId", cube_id);
        $state.go("profile", {state: 'profile', "menu": 0});
    };

    $scope.commentEditorInit = function () {
        $scope.commentEditor = new E('#comment-toolbar', '#comment-text');
        $scope.commentEditor.config.placeholder = '请填写评论（字数不超200）';
        $scope.commentEditor.config.zIndex = 2000;
        $scope.commentEditor.config.height = 1200;
        $scope.commentEditor.config.menus = [
            'emoticon'
        ];
        $scope.commentEditor.create();
    };

    $scope.blogViewSet = function (id) {
        dataService.callOpenApi("blog.view", {id: id}, "common");
    };

    $scope.care = function (cube_id) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning("info", "请先登录");
            return null
        }
        dataService.callOpenApi("user.care.set", {
            id: $rootScope.userId,
            cubeid: cube_id
        }, "private").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("success", "感谢关注！");
                $scope.userCareConfirm();
            } else {
                $rootScope.cubeWarning("error", data.msg || "关注出错");
            }
        })
    };

    $scope.userCareConfirm = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi("user.care.confirm", {
            id: $rootScope.userId,
            cubeid: $scope.content["cube_id"],
        }, "private").then(function (data) {
            if (data.success) {
                $scope.careComfirm = data["exist"]
            }
        })
    };

    $scope.blogDetailGet = function (id) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("blog.detail", {id: id}, "common").then(function (data) {
            $rootScope.swal.close();
            $scope.detailGetSuccess = data.success;
            if (data.success) {
                if (data.content) {
                    $scope.coverOrigin = data.content[0]["cover"];
                    let blog = data.content[0];
                    let content = JSON.parse(blog.content);
                    let images = blog.image.split(":");
                    let date = blog.date.split(" ")[0].split("-").join("");
                    let comment = parseInt(data.content[0]["comment"]);
                    let cover = [$rootScope.fileServer + "/blog", data.content[0]["cube_id"], date, data.content[0]["cover"]].join("/");
                    $scope.imageSet(content, images, blog["cube_id"], date).then(function () {
                        $scope.editor.txt.setJSON(content);
                    })
                    $scope.content = data.content[0];
                    $scope.content["cover"] = cover;
                    $scope.content["comment"] = comment;
                    $scope.blogCollectConfirm();
                    $scope.userProfileGet(blog["cube_id"]);
                    $scope.commentGet();
                    $scope.userCareConfirm();
                }
            }
        })
    };

    $scope.userProfileGet = function (cube_id) {
        dataService.callOpenApi("user.profile.get", {cubeid: cube_id}, "common").then(function (data) {
            if (data.success && data.profile[0] !== "") {
                $scope.userImage = $rootScope.fileServer + "/user/image/" + cube_id + "/" + data.profile[0];
            } else {
                $scope.userImage = null;
            }
        })
    };

    $scope.collectProfileGet = function (id) {
        dataService.callOpenApi("collect.profile.get", {id: id}, "common").then(function (data) {
            if (data.success) {
                $scope.collectProfile = data.profile;
            }
        })
    };

    $scope.blogCollectConfirm = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi("blog.collect.confirm", {
            id: $state.params.id,
            cubeid: $rootScope.userId
        }, "private").then(function (data) {
            $scope.collectConfirm = data.success;
        })
    };

    $scope.careCancel = function (cube_id) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning("info", "请先登录")
            return null
        }
        dataService.callOpenApi("user.care.cancel", {
            id: $rootScope.userId,
            cubeid: cube_id
        }, "private").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("success", "已取消关注");
                $scope.userCareConfirm();
            } else {
                $rootScope.cubeWarning("error", data.msg || "未知错误");
            }
        })
    };

    $scope.careCancelFront = function (cube_id) {
        $rootScope.coco({
            title: "关注",
            el: "#care",
            okText: "确认",
            zIndexOfModal: 10001,
            zIndexOfMask: 10000,
            zIndexOfActiveModal: 10001,
            buttonColor: '#03a9f4',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $scope.careCancel(cube_id);
                done()
            } else {
                done()
            }
        });
    };

    $scope.imageSet = function (content, images, cubeid, date) {
        let defer = $q.defer();
        if (images[0] !== "") {
            content.forEach(function (item) {
                if (item["children"]) {
                    item["children"].forEach(function (_item) {
                        if (_item["tag"] && _item["tag"] === 'img') {
                            let image = [$rootScope.fileServer + "/blog", cubeid, date, images.shift()].join("/")
                            _item["attrs"].forEach(function (_attr) {
                                if (_attr["name"] === 'src') {
                                    _attr["value"] = image;
                                }
                            })
                            if (images.length === 0) {
                                defer.resolve();
                            }
                        }
                    })
                }
            })
        } else {
            defer.resolve();
        }
        return defer.promise;
    };

    $scope.image2Base64 = function (img, type) {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let dataURL = canvas.toDataURL("image/" + type);
        return dataURL;
    };

    $scope.getImgBase64 = function (src) {
        let defer = $q.defer();
        let base64 = "";
        let img = new Image();
        img.crossOrigin = 'anonymous';
        let type = src.split(".").pop();
        img.src = src;
        img.onload = function () {
            base64 = $scope.image2Base64(img, type);
            defer.resolve(base64);
        }
        return defer.promise;
    };


    $scope.scroll = function () {
        let body = document.getElementById("cube-body");
        let like = document.getElementById("like");
        let star = document.getElementById("star");
        let container = document.getElementById("container");
        let rocket = document.getElementById("rocket");
        like.style.right = container.offsetLeft + 50 + "px";
        star.style.right = container.offsetLeft + 50 + "px";
        rocket.style.right = container.offsetLeft + 50 + "px";
        body.onscroll = function () {
            let scrollT = document.documentElement.scrollTop;
            rocket.style.display = "flex";
            if (70 - scrollT >= 0) {
                rocket.style.display = "none";
            }
        };
    };

    $scope.like = function () {
        dataService.callOpenApi("blog.like", {
            id: $state.params.id,
        }, "common").then(function (data) {
            if (data.success) {
                document.getElementById("like").style["color"] = "#409eff";
                $rootScope.cubeWarning('success', "点赞+1 😄");
                $scope.collectProfileGet($state.params.id);
            } else {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            }
        })
    };

    $scope.collect = function () {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        if ($scope.collectConfirm) {
            $rootScope.cubeWarning('info', '已经收藏过了哦 😆');
            return null
        }
        dataService.callOpenApi("blog.collect", {
            id: $state.params.id,
            cubeid: $rootScope.userId,
            cover: $scope.coverOrigin,
            title: $scope.content["title"],
            date: $scope.content["date"],
            label_type: $scope.content["label_type"],
        }, "private").then(function (data) {
            if (data.success) {
                $scope.collectConfirm = data.success;
                $rootScope.cubeWarning('success', "收藏+1 😄");
                $scope.collectProfileGet($state.params.id);
            } else {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            }
        })
    };

    $scope.commentGet = function (page = 1) {
        dataService.callOpenApi("blog.comment.get", {
            id: $state.params.id,
            page: page + ""
        }, "common").then(function (data) {
            if (data.success) {
                $scope.comment = data.comment;
                $scope.content["comment"] = parseInt(data.length);
                $scope.current_page = page;
                $scope.pageCreate(data);
                $scope.page_created = true;
            } else {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            }
        })
    };

    $scope.pageCreate = function (data) {
        if (data.length) {
            $("#PageCount").val(data.length);
            $("#PageSize").val(10);
            if (!$scope.page_created) {
                $rootScope.loadpage(function (num, type) {
                    if (num !== $scope.current_page) {
                        $scope.commentGet(num);
                    }
                })
            }
        }
    };

    $scope.commentDelete = function (id, blog_id, cube_id, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        $rootScope.coco({
            title: "评论删除",
            el: "#blog-comment-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                dataService.callOpenApi('delete.blog.comment', {
                    id: id,
                    index: index + "",
                    cube_id: cube_id,
                    blog_id: blog_id,
                }, 'private').then(function (data) {
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || '未知錯誤')
                    } else {
                        $scope.page_created = false;
                        $scope.commentGet();
                    }
                    done()
                })
            } else {
                done()
            }
        });
    };

    $scope.commentLike = function (item, index) {
        item["love"] = 1 + parseInt(item["love"]);
        dataService.callOpenApi("blog.comment.like", {
            id: item.id,
            blogid: $scope.content["id"],
            like: JSON.stringify(item["love"]),
            index: index + ""
        }, "common").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', "点赞+1 😄");
            } else {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            }
        })
    };

    $scope.commentSend = function () {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        let comment = $scope.commentEditor.txt.text();
        if (comment === "") {
            $rootScope.cubeWarning('info', '请输入评论内容');
            return null
        }
        if (comment.length > 200) {
            $rootScope.cubeWarning('info', '字数：' + comment.length + " （大于200）");
            return null
        }
        dataService.callOpenApi("blog.comment.send", {
            id: $state.params.id,
            cubeid: $rootScope.userId,
            blogCubeId: $scope.content["cube_id"],
            comment: comment,
            commentNum: JSON.stringify($scope.content["comment"] + 1)
        }, "private").then(function (data) {
            if (data.success) {
                $scope.commentEditor.txt.clear();
                $scope.commentGet()
                $rootScope.cubeWarning('success', "发表成功");
            } else {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            }
        })
    };

    $scope.rocket = function () {
        document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'});
    };

    $scope.rocketTop = function () {
        document.documentElement.scrollIntoView({block: 'start'});
    };
}])
