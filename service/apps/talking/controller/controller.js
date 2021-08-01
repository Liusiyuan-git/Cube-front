import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"

app.controller("talkingCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.talkEditorInit()
        $scope.talkDataGet()
    };

    $scope.talkDataGet = function () {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("talk.get", {}, "common").then(function (data) {
            $rootScope.swal.close()
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误")
            } else {
                $scope.talkData = data.content
            }
        })
    }

    $scope.menuSelect = function (key) {
        $scope.talkingMenu.forEach(function (item) {
            item.select = item.key === key
        })
    };

    $scope.talkEditorInit = function () {
        $scope.talkEditor = new E('#talk-toolbar', '#talk-text');
        $scope.talkEditor.config.height = 1200;
        $scope.talkEditor.config.menus = [
            'emoticon'
        ]
        $scope.talkEditor.create();
    };

    $scope.talkCommentSend = function (id, item) {
        item.comment = parseInt(item.comment) + 1
        let text = $scope.talkCommentEditor.txt.text()
        if (text === '') {
            $rootScope.cubeWarning('warning', '内容不能为空')
            return null
        }
        if (!$rootScope.userId) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi('send.talk.comment', {
            id: id,
            cubeid: $rootScope.userId,
            text: text,
            comment: JSON.stringify(item.comment)
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功')
                $scope.talkCommentEditor.txt.clear();
                $scope.talkCommentGet(id, item)

            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错')
            }

        })
    };

    $scope.talkCommentGet = function (id, item) {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("talk.comment.get", {
            id: id
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误")
            } else {
                item.commentData = data.content
            }
        })
    }

    $scope.talkSend = function () {
        let text = $scope.talkEditor.txt.text()
        if (text === '') {
            $rootScope.cubeWarning('warning', '内容不能为空')
            return null
        }
        if (!$rootScope.userId) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi('send.talk', {
            cubeid: $rootScope.userId,
            text: text
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功')
                $scope.talkDataGet()
                $scope.menuSelect("new")
            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错')
            }

        })
    };

    $scope.talkLike = function (id, item) {
        item.love = parseInt(item.love) + 1
        dataService.callOpenApi('talk.like', {
            id: id,
            like: JSON.stringify(item.love)
        }, 'common').then(function (data) {
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || '未知錯誤')
            }

        })
    };

    $scope.talkCommentDelete = function (id, item_id, item) {
        item.comment = parseInt(item.comment) - 1
        $rootScope.confirm('info', '删除评论', '是否删除该条评论？', '确定').then(function (result) {
            if (result.isConfirmed) {
                dataService.callOpenApi('delete.talk.Comment', {
                    id: id,
                    cubeid: $rootScope.userId,
                    talkid: item_id,
                    comment: JSON.stringify(item.comment)
                }, 'private').then(function (data) {
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || '未知錯誤')
                    } else {
                        $scope.talkCommentGet(item_id, item)
                    }
                })
            }
        })
    };

    $scope.talkComment = function (id, item) {
        $scope.talkCommentGet(id, item)
        if ($scope.talkCommentEditor) {
            $scope.talkCommentEditor.destroy()
        }
        $scope.talkData.forEach(function (item) {
            item.select = item.id === id
        })
        $timeout(function () {
            $scope.talkCommentEditorCreate()
        }, 50)
    };

    $scope.talkCommentEditorCreate = function () {
        $scope.talkCommentEditor = new E('#talk-comment-toolbar');
        $scope.talkCommentEditor.config.menus = [
            'emoticon'
        ]
        $scope.talkCommentEditor.config.showFullScreen = false
        $scope.talkCommentEditor.config.height = 100;
        $scope.talkCommentEditor.create();
    };

    $scope.talkingMenu = [{
        key: "new",
        name: "动态",
        select: true
    }, {
        key: "care",
        name: "关注",
        select: false
    }, {
        key: "talk",
        name: "树洞",
        select: false
    }]
}])