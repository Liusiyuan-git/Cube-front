import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"

app.controller("talkingCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.talkEditorInit();
        $scope.talkDataGet();
    };

    $scope.initParams = function () {
        $scope.talkImages = []
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
        $scope.talkEditor.config.placeholder = '分享点学习、工作、生活的新鲜事'
        $scope.talkEditor.config.menus = [
            'emoticon', 'image'
        ];
        $scope.talkEditor.config.uploadImgMaxLength = 3;
        $scope.talkEditor.config.customUploadImg = function (resultFiles, insertImgFn) {
            console.log($scope.talkImages.length)
            if ($scope.talkImages.length >= 3) {
                $rootScope.cubeWarning('info', "上传图片不得超过3张");
            } else {
                $scope.getImgBase64(resultFiles)
            }
        }
        $scope.talkEditor.config.showLinkImg = false

        $scope.talkEditor.config.customAlert = function (s, t) {
            switch (t) {
                case 'success':
                    $rootScope.cubeWarning('success', s);
                    break
                case 'info':
                    $rootScope.cubeWarning('info', s);
                    break
                case 'warning':
                    $rootScope.cubeWarning('warning', s);
                    break
                case 'error':
                    $rootScope.cubeWarning('error', s);
                    break
                default:
                    $rootScope.cubeWarning('info', s);
                    break
            }
        }
        $scope.talkEditor.create();
    };

    $scope.imageDelete = function (index) {
        $scope.talkImages.splice(index,1)
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

    $scope.getImgBase64 = function (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file[0]);
        reader.onload = function (e) {
            $scope.talkImages.push(e.target.result);
            console.log($scope.talkImages)
            $scope.$apply()
        }
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
    };

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
        key: "all",
        name: "全部",
        select: true
    }, {
        key: "hot",
        name: "精华",
        select: false
    }, {
        key: "concern",
        name: "关注",
        select: false
    }]
}])