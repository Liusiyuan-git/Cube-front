import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

app.controller("messageCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.menuSelect("message");
        $scope.userMessageClean();
    };

    $scope.initParams = function () {
        $scope.scopeId = $scope.$id;
    };

    $scope.blogGet = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        $scope.profileCare().then(function (data) {
            if (data.length) {
                $scope.careSelect(0);
            }
        }, function () {

        })
    };

    $scope.talkGet = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        $scope.profileCare().then(function (data) {
            if (data.length) {
                $scope.careSelect(0);
            }
        }, function () {

        })
    };

    $scope.messageProfileTalkGet = function (careData) {
        let idBox = [];
        careData.forEach(function (item) {
            idBox.push(item.cube_id)
        });
        let idString = idBox.join(";")
        dataService.callOpenApi("message.profile.user.talk.get", {
            id: $rootScope.userId,
            idBox: idString
        }, "private").then(function (data) {
            if (data.success) {
                $scope.userMessageTalk = data.content
            } else {
                $scope.userMessageTalk = null;
            }
        });
    };

    $scope.messageProfileBlogGet = function (careData) {
        let idBox = [];
        careData.forEach(function (item) {
            idBox.push(item.cube_id)
        });
        let idString = idBox.join(";")
        dataService.callOpenApi("message.profile.user.blog.get", {
            id: $rootScope.userId,
            idBox: idString
        }, "private").then(function (data) {
            if (data.success) {
                $scope.userMessageBlog = data.content
            } else {
                $scope.userMessageBlog = null;
            }
        });
    };

    $scope.menuSelect = function (key) {
        $scope.page_created = false;
        $scope.messageMenu.forEach(function (item) {
            if (item.key === key) {
                $scope.currentMessageMenu = item;
                item.func()
            }
            item.select = item.key === key
        })
    };

    $scope.goToUserProfile = function (cube_id) {
        localStorage.setItem("profileId", cube_id);
        $state.go("profile", {state: 'profile'});
    };

    $scope.userMessageClean = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi('user.message.clean', {
            id: $rootScope.userId,
        }, 'private').then(function () {
            $scope.messageProfileGet()
        })
    };

    $scope.messageProfileGet = function () {
        if (!$scope.loginStatusCheck()) {
            return
        }
        dataService.callOpenApi("message.profile.get", {
            "cube_id": $rootScope.userId
        }, "private").then(function (data) {
            if (data.success) {
                $rootScope.messageCount = data['profile'][0];
                $scope.messageBlogCount = data['profile'][1];
                $scope.messageTalkCount = data['profile'][2];
            }

        });
    };

    $scope.userMessageGet = function (page = 1) {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi('user.message.get', {
            id: $rootScope.userId,
            page: page + ""
        }, 'private').then(function (data) {
            $rootScope.swal.close();
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || '未知錯誤')
            } else if (data.length) {
                $scope.userMessageData = data.content || null;
                $scope.userMessageData.forEach(function (item) {
                    if (item.blog === '1' || item.blog_comment === '1') {
                        let time = item.date.split(" ")[0].split("-").join("")
                        item.author = item.name
                        if (item.cover) {
                            let cover = ["http://47.119.151.14:3001/blog", item.blog === '1' ? item["send_id"] : $rootScope.userId, time, item.cover].join("/")
                            item.cover = cover
                        }
                    }
                })
                $scope.current_page = page;
                $scope.pageCreateMessage(data);
                $scope.page_created = true;
            } else {
                $scope.userMessageData = null
            }
        })
    };

    $scope.blog = function (id) {
        $state.go("blog", {id: id})
    };

    $scope.messageDelete = function (item, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        $rootScope.coco({
            title: "删除",
            el: "#message-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $rootScope.cubeLoading("加载中...");
                dataService.callOpenApi("message.delete", {
                    "id": item["id"],
                    "cube_id": $rootScope.userId,
                    "index": index + "",
                }, "private").then(function (data) {
                    $rootScope.swal.close();
                    if (data.success) {
                        $scope.page_created = false;
                        $scope.userMessageGet();
                    } else {
                        $rootScope.cubeWarning("error", data.message || "未知错误")
                    }
                })
                done()
            } else {
                done()
            }
        });
    }

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

    $scope.talkLike = function (id, item, index) {
        dataService.callOpenApi('talk.like', {
            id: id,
        }, 'common').then(function (data) {
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || '未知錯誤')
            } else {
                $rootScope.cubeWarning('success', '感谢鼓励！');
                $scope.talkDataCount[2 * index] = parseInt($scope.talkDataCount[2 * index]) + 1
            }
        })
    };

    $scope.talkComment = function (id, item, index) {
        $scope.currentTalk = item;
        $scope.currentTalkIndex = index;
        $timeout(function () {
            $scope.talkCommentDialog();
            $scope.talkCommentEditorCreate();
            $scope.talkCommentGet(id, item);
        }, 500)
    };

    $scope.talkCommentPageCreate = function (data, id, item) {
        $("#PageCount" + 'talkComment').val(data.length);
        $("#PageSize" + 'talkComment').val(10);
        if (!$scope.talk_comment_page_created) {
            $rootScope.loadpage(function (num) {
                if (num !== $scope.talk_comment_current_page) {
                    $scope.talkCommentGet(id, item, num);
                }
            }, 'talkComment')
        }
    };

    $scope.talkCommentGet = function (id, item, page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("talk.comment.get", {
            id: id,
            page: page + ""
        }, "common").then(function (data) {
            $rootScope.swal.close();
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误")
            } else {
                item.commentData = data.content;
                item.comment = data.length;
                $rootScope.talkCommentData = data.content;
                if ($rootScope.talkCommentData) {
                    $timeout(function () {
                        $scope.talk_comment_current_page = page;
                        $scope.talkCommentPageCreate(data, id, item);
                        $scope.talk_comment_page_created = true;
                    }, 500)
                }
            }
        })
    };

    $scope.talkCommentEditorCreate = function () {
        $scope.talkCommentEditor = new E('#talk-comment-toolbar', "#talk-comment-text");
        $scope.talkCommentEditor.config.menus = [
            'emoticon'
        ];
        $scope.talkCommentEditor.config.showFullScreen = false;
        $scope.talkCommentEditor.config.height = 33;
        $scope.talkCommentEditor.config.showMenuTooltips = false;
        $scope.talkCommentEditor.create();
    };

    $scope.talkCommentDialog = function () {
        $scope.commentDialog = $rootScope.coco({
            title: "评论",
            el: "#talk-comment-block-message" + $scope.scopeId,
            width: "600px",
            height: "650px",
            destroy: false,
        }).onClose(function (ok, cc, done) {
            $scope.talkCommentEditor.destroy();
            $scope.talkCommentEditor = null;
            $rootScope.talkCommentData = null;
            $scope.talk_comment_page_created = false;
            done()
        });
    };

    $scope.talkCommentSend = function () {
        let item = $scope.currentTalk;
        let id = $scope.currentTalk.id;
        let index = $scope.currentTalkIndex;
        item.comment = parseInt(item.comment) + 1
        let text = $scope.talkCommentEditor.txt.text()
        if (text === '') {
            $rootScope.cubeWarning('warning', '内容不能为空')
            return null
        }
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi('send.talk.comment', {
            id: id,
            cubeid: $rootScope.userId,
            text: text,
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功')
                $scope.talkCommentEditor.txt.clear();
                $scope.talkDataCount[2 * index + 1] = parseInt($scope.talkDataCount[2 * index + 1]) + 1;
                $scope.talk_comment_page_created = false;
                $scope.talkCommentGet(id, item);
            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错')
            }
        })
    };

    $scope.$on('$stateChangeStart', function (event, toState, toParams) {
        if ($scope.commentDialog) {
            $scope.commentDialog.onClose(function () {
            })
            $scope.commentDialog.destroyModal();
            $scope.commentDialog.close()
        }
    });

    $scope.talkCommentDelete = function (id, item_id, item) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        item.comment = parseInt(item.comment) - 1;
        $rootScope.coco({
            title: "评论删除",
            el: "#delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                dataService.callOpenApi('delete.talk.Comment', {
                    id: id,
                    cubeid: $rootScope.userId,
                    talkid: item_id,
                    comment: JSON.stringify(item.comment)
                }, 'private').then(function (data) {
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || '未知錯誤')
                    } else {
                        $scope.talkCommentGet(item_id, item);
                    }
                    done()
                })
            } else {
                done()
            }
        });
    };

    $scope.profileCare = function () {
        let defer = $q.defer();
        dataService.callOpenApi('user.profile.care', {
            cubeid: $rootScope.userId,
        }, 'private').then(function (data) {
            if (data.success && data["profileCare"]) {
                data["profileCare"].forEach(function (item) {
                    item.select = false;
                });
                $scope.profileCareData = data["profileCare"];
                defer.resolve(data["profileCare"]);
            } else {
                defer.reject();
            }
        })
        return defer.promise;
    };

    $scope.careSelect = function (index) {
        $scope.currentCareId = $scope.profileCareData[index]['cube_id'];
        $scope.profileCareData.forEach(function (item, i) {
            $scope.profileCareData[index]['select'] = i === index;
        });
        if ($scope.currentMessageMenu['key'] === 'talk') {
            $scope.messageProfileUserTalkClean($scope.currentCareId);
            $scope.careTalkDataGet($scope.currentCareId);
        } else {
            $scope.messageProfileUserBlogClean($scope.currentCareId);
            $scope.careBlogDataGet($scope.currentCareId);
        }
    };

    $scope.messageProfileUserTalkClean = function (id) {
        dataService.callOpenApi("message.profile.user.talk.clean", {
            id: $rootScope.userId,
            deleteId: id
        }, "private").then(function () {
            $scope.messageProfileGet();
            $scope.messageProfileTalkGet($scope.profileCareData);
        })
    };

    $scope.messageProfileUserBlogClean = function (id) {
        dataService.callOpenApi("message.profile.user.blog.clean", {
            id: $rootScope.userId,
            deleteId: id
        }, "private").then(function () {
            $scope.messageProfileGet();
            $scope.messageProfileBlogGet($scope.profileCareData);
        })
    };

    $scope.menuDirection = function (item) {
        console.log(item)
        if (item['talk'] === 1) {
            $scope.menuSelect('talk');
            return 0
        }
        if (item['blog'] === 1) {
            $scope.menuSelect('blog');
            return 0
        }
    };

    $scope.careBlogDataGet = function (cube_id, page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.blog.get", {
            "page": page + "",
            "cube_id": cube_id
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
                $scope.profileBlogData = data.content || null;
                $scope.current_page = page;
                $scope.pageCreateBlog(data);
                $scope.page_created = true;
            } else {
                $scope.profileBlogData = null;
            }
        })
    };

    $scope.pageCreateBlog = function (data) {
        $("#PageCountblog").val(data.length);
        $("#PageSizeblog").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.careBlogDataGet($scope.currentCareId, num);
                }
            }, "blog")
        }
    };

    $scope.blogDetail = function (id) {
        $state.go("blog", {id: id});
    };

    $scope.careTalkDataGet = function (cube_id, page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.talk.get", {
            "page": page + "",
            "cube_id": cube_id
        }, "common").then(function (data) {
            $rootScope.swal.close();
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误");
            } else if (data.length !== 0) {
                data.content.forEach(function (item) {
                    item['user_image'] = item['user_image'] || null;
                });
                $scope.talkData = data.content;
                $scope.talkDataCount = data.count;
                $scope.talkDataMode = data.mode;
                $scope.talkImagesSet(data.content);
                $scope.current_page = page;
                $scope.pageCreateTalk(data);
                $scope.page_created = true;
            } else {
                $scope.talkData = null;
            }
        })
    };

    $scope.pageCreateTalk = function (data) {
        $("#PageCounttalk").val(data.length);
        $("#PageSizetalk").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.careTalkDataGet($scope.currentCareId, num)
                }
            }, 'talk')
        }
    };

    $scope.talkImagesSet = function (content) {
        $scope.talkImagesBlock = {};
        content.forEach(function (item) {
            let time = item.date.split(" ")[0].split("-").join("")
            if (item.images) {
                item.images.split(":").forEach(function (image) {
                    let link = ["http://47.119.151.14:3001/talk", item["cube_id"], time, image].join("/")
                    if (!$scope.talkImagesBlock[item["id"]]) {
                        $scope.talkImagesBlock[item["id"]] = [link]
                    } else {
                        $scope.talkImagesBlock[item["id"]].push(link)
                    }
                });
            }
        });
    };

    $scope.pageCreateMessage = function (data) {
        $("#PageCountmessage").val(data.length);
        $("#PageSizemessage").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.userMessageGet(num);
                }
            }, "message")
        }
    };

    $scope.rocketTop = function () {
        document.documentElement.scrollIntoView({block: 'start'})
    };

    $scope.messageMenu = [{
        key: "message",
        name: "消息",
        func: $scope.userMessageGet,
        select: true
    }, {
        key: "blog",
        name: "文章",
        func: $scope.blogGet,
        select: false
    }, {
        key: "talk",
        name: "说说",
        func: $scope.talkGet,
        select: false
    }]
}])