import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

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
        $scope.talkImages = [];
        $scope.currentTalkingMenu = $scope.talkingMenu[0];
        $scope.talkCommentLength = 0;
        $scope.talkCommentBlockShow = false;
    };

    $scope.talkDataGet = function (mode = "new", page = 1) {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("talk.get", {
            "mode": $scope.currentTalkingMenu["key"],
            "page": page + "",
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误")
            } else {
                $scope.talkData = data.content;
                $scope.talkImagesSet(data.content);
                $scope.current_page = page;
                $scope.pageCreate(data);
                $scope.page_created = true;
            }
        })
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
        viewer.show()
    };

    $scope.pageCreate = function (data) {
        $("#PageCount").val(data.length);
        $("#PageSize").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.talkDataGet($scope.currentTalkingMenu["key"], num)
                }
            })
        }
    };

    $scope.menuSelect = function (key) {
        $scope.talkingMenu.forEach(function (item) {
            if (item.key === key) {
                $scope.currentTalkingMenu = item
            }
            item.select = item.key === key
        })
        $scope.talkDataGet()
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
            if ($scope.talkImages.length >= 3) {
                $rootScope.cubeWarning('info', "上传图片不得超过3张");
            } else {
                $scope.getImgBase64(resultFiles)
            }
        }
        $scope.talkEditor.config.showLinkImg = false;
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
        $scope.talkImages.splice(index, 1)
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
            $scope.$apply()
        }
    };

    $scope.talkCommentSend = function (id, item, index) {
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
            index: index + "",
            cubeid: $rootScope.userId,
            text: text,
            mode: $scope.currentTalkingMenu["key"],
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

    $scope.talkCommentGet = function (id, item, index, page = 1) {
        $rootScope.cubeLoading("加载中...")
        dataService.callOpenApi("talk.comment.get", {
            id: id,
            page: page + ""
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || "未知错误")
            } else {
                item.commentData = data.content;
                item.comment = data.length;
                $timeout(function () {
                    $scope.talk_comment_current_page = page;
                    $scope.talkCommentPageCreate(data, id, item, index);
                    $scope.talk_comment_page_created = true;
                    $scope.talkCommentBlockShow = false;
                }, 500)
            }
        })
    };

    $scope.talkCommentPageCreate = function (data, id, item, index) {
        console.log(11111)
        $("#PageCount" + index).val(data.length);
        $("#PageSize" + index).val(10);
        if (!$scope.talk_comment_page_created || $scope.talkCommentBlockShow) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.talk_comment_current_page) {
                    $scope.talkCommentGet(id, item, index, num)
                }
            }, index)
        }
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
            text: text,
            images: $scope.talkImages.length > 0 ? JSON.stringify($scope.talkImages) : JSON.stringify([])
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功')
                $scope.menuSelect("new")
            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错')
            }

        })
    };

    $scope.talkLike = function (id, item, index) {
        item.love = parseInt(item.love) + 1
        dataService.callOpenApi('talk.like', {
            id: id,
            index: index + "",
            mode: $scope.currentTalkingMenu["key"],
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

    $scope.talkComment = function (id, item, index) {
        $scope.talkCommentBlockShow = true;
        $scope.talkData.forEach(function (item) {
            item.select = item.id === id
        });
        $scope.talkCommentGet(id, item, index);
        if ($scope.talkCommentEditor) {
            $scope.talkCommentEditor.destroy()
        }
        $timeout(function () {
            $scope.talkCommentEditorCreate()
        }, 50)
    };

    $scope.talkCommentEditorCreate = function () {
        $scope.talkCommentEditor = new E('#talk-comment-toolbar', "#talk-comment-text");
        $scope.talkCommentEditor.config.menus = [
            'emoticon'
        ]
        $scope.talkCommentEditor.config.showFullScreen = false
        $scope.talkCommentEditor.config.height = 33;
        $scope.talkCommentEditor.create();
    };

    $scope.talkingMenu = [{
        key: "new",
        name: "最新",
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