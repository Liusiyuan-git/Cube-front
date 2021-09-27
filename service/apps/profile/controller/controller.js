import Viewer from "viewerjs";

let app = require("../../app")
import "../style/style.scss"
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
import E from "wangeditor";

app.controller("profileCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.initParams();
        $scope.userProfileGet();
        $scope.profileBlogGet();
        $scope.rocketPosition();
        // $scope.introduceEdit()
    };


    $scope.introduceEdit = function () {
        // let btn = document.body.querySelector("#introduce-edit");
        let introduce = document.body.querySelector("#introduce");
        // btn.addEventListener("click", function () {
        //     $rootScope.coco({
        //         title: "设置",
        //         el: "#introduce-edit-dialog",
        //         okText: "提交",
        //         buttonColor: '#03a9f4',
        //     }).onClose(function (ok, cc, done) {
        //         if (ok) {
        //             if (introduce.value.trim() !== "") {
        //                 $scope.introduceSend(introduce.value.trim());
        //                 done()
        //             } else {
        //                 $rootScope.cubeWarning("error", "输入不能为空！");
        //             }
        //         } else {
        //             done()
        //         }
        //     });
        // });
        $rootScope.coco({
            title: "设置",
            el: "#introduce-edit-dialog",
            okText: "提交",
            buttonColor: '#03a9f4',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                if (introduce.value.trim() !== "") {
                    $scope.introduceSend(introduce.value.trim());
                    done()
                } else {
                    $rootScope.cubeWarning("error", "输入不能为空！");
                }
            } else {
                done()
            }
        });
    };

    $scope.talkComment = function (id, item, index) {
        $scope.currentTalk = item;
        $scope.talkCommentBlockShow = true;
        $scope.talkCommentDialog();
        $scope.talkCommentEditorCreate()
        $timeout(function () {
            $scope.talkCommentGet(id, item, index);
        }, 500)
    };

    $scope.talkCommentDialog = function () {
        $rootScope.coco({
            title: "评论",
            el: "#talk-comment-block",
            width: "600px",
            height: "650px"
        }).onClose(function (ok, cc, done){
            $scope.talkCommentEditor.destroy();
            $scope.talkCommentEditor = null;
            done();
        });
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
                $scope.talkCommentData = data.content;
                $timeout(function () {
                    $scope.talk_comment_current_page = page;
                    $scope.talkCommentPageCreate(data, id, item, index);
                    $scope.talk_comment_page_created = true;
                    $scope.talkCommentBlockShow = false;
                }, 500)
            }
        })
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

    $scope.talkCommentPageCreate = function (data, id, item, index) {
        $("#PageCount" + 'talkComment').val(data.length);
        $("#PageSize" + 'talkComment').val(10);
        if (!$scope.talk_comment_page_created || $scope.talkCommentBlockShow) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.talk_comment_current_page) {
                    $scope.talkCommentGet(id, item, index, num)
                }
            }, 'talkComment')
        }
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

    $scope.introduceSend = function (s) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi("user.introduce.send", {
            "cubeid": $rootScope.userId,
            "introduce": s
        }, "private").then(function (data) {
            if (data.success) {
                $scope.userProfile.introduce = s
                $rootScope.cubeWarning("success", "修改成功")
            } else {
                $rootScope.cubeWarning("success", "未知错误")
            }
        })
    };

    $scope.rocketPosition = function () {
        let container = document.getElementById("area");
        let rocket = document.getElementById("rocket");
        rocket.style.right = container.offsetLeft + 50 + "px";
    };

    $scope.rocket = function () {
        document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
    };

    $scope.initParams = function () {
        $scope.inputimage = "";
        $scope.userImage = "";
        $scope.currentOption = $scope.options[0];
        $scope.profileId = localStorage.getItem("profileId");
    };

    $scope.loadingImg = function (eve) {
        let reader = new FileReader();
        if (eve.target.files[0]) {

            //readAsDataURL方法可以将File对象转化为data:URL格式的字符串（base64编码）
            reader.readAsDataURL(eve.target.files[0]);
            reader.onload = (e) => {
                let dataURL = reader.result;
                //将img的src改为刚上传的文件的转换格式
                document.querySelector('#cropImg').src = dataURL;

                const image = document.getElementById('cropImg');

                $scope.CROPPER = new Cropper(image, {
                    aspectRatio: 16 / 16,
                    viewMode: 0,
                    minContainerWidth: 500,
                    minContainerHeight: 500,
                    dragMode: 'move',
                    preview: [document.querySelector('.previewBox'),
                        document.querySelector('.previewBoxRound')]
                })
            }
        }
    };

    $scope.userProfileGet = function () {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("user.profile.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            $rootScope.swal.close()
            if (data.success) {
                $scope.userImage = "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + data.profile.image;
                $scope.userName = data.profile.name;
                $scope.userProfile = data.profile
            }
        })
    };

    $scope.uploadImg = function () {
        $scope.uploadImgStatus = false;
        document.querySelector('#imgReader').click();
        document.querySelector('#imgReader').addEventListener('change', function (eve) {
            if (!$scope.uploadImgStatus) {
                $scope.uploadImgStatus = true;
                $rootScope.coco({
                    title: "设置",
                    el: "#user-image-dialog",
                    okText: "提交",
                    width: "600px",
                    buttonColor: '#03a9f4',
                }).onClose(function (ok, cc, done) {
                    if (ok) {
                        $scope.cutBtnConfirm(done)
                    } else {
                        $scope.cutBtnCancel()
                        done()
                    }
                });
                let image = document.getElementById('user-image-dialog');
                image.style.display = "flex";
                let reader = new FileReader();
                if (eve.target.files[0]) {
                    reader.readAsDataURL(eve.target.files[0]);
                    reader.onload = (e) => {
                        let dataURL = reader.result;
                        document.querySelector('#cropImg').src = dataURL;

                        const image = document.getElementById('cropImg');

                        new Cropper(image, {
                            aspectRatio: 16 / 16,
                            viewMode: 0,
                            minContainerWidth: 50,
                            minContainerHeight: 50,
                            dragMode: 'move',
                            preview: [document.querySelector('#previewBox'),
                                document.querySelector('#previewBoxRound')],
                            ready() {
                                $scope.cropper = this.cropper;
                                $scope.clockwise = function () {
                                    $scope.cropper.rotate(90)
                                };

                                $scope.counterclockwise = function () {
                                    $scope.cropper.rotate(-90)
                                };

                                $scope.narrow = function () {
                                    $scope.cropper.zoom(-0.1)
                                };

                                $scope.enlarge = function () {
                                    $scope.cropper.zoom(0.1)
                                };

                                $scope.reset = function () {
                                    $scope.cropper.reset()
                                };
                            },
                        })
                    }
                }
            }
        })
    };

    $scope.imageDialogClose = function () {
        $scope.cropper.destroy();
        let file = document.getElementById("imgReader");
        file.value = "";
        let image = document.getElementById('user-image-dialog');
        image.style.display = "none";
    };

    $scope.cutBtnCancel = function () {
        $scope.imageDialogClose()
    };

    $scope.cutBtnConfirm = function (done) {
        $scope.cropper.getCroppedCanvas({
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'medium',
        }).toBlob((blob) => {
            $scope.getUserImgBase64(blob, done);
        })
    };

    $scope.sendUserImage = function (image, done) {
        if (!$rootScope.userId) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        $rootScope.cubeLoading("上传中...");
        dataService.callOpenApi('send.user.image', {
            image: image,
            cubeid: $rootScope.userId,
            mode: "private"
        }, 'private').then(function (data) {
            $rootScope.swal.close()
            if (data.success) {
                $rootScope.cubeWarning("success", "上传成功")
            } else {
                $rootScope.cubeWarning("error", "上传出错")
            }
            $scope.imageDialogClose();
            done()
        })
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

    $scope.getUserImgBase64 = function (file, done) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            $scope.userImage = e.target.result;
            $scope.$apply();
            $scope.sendUserImage(e.target.result, done)
        }
    };

    $scope.profileBlogGet = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.blog.get", {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "private").then(function (data) {
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
                $scope.profileBlogData = data.content;
                $scope.current_page = page;
                $scope.pageCreateBlog(data);
                $scope.page_created = true;
            } else {
                $scope.content = null
            }
        })
    };

    $scope.profileTalkGet = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.talk.get", {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "private").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                if (data.content) {
                    $scope.profileTalkData = data.content
                    $scope.talkImagesSet(data.content);
                }
                $scope.rocket();
                $scope.current_page = page;
                $scope.pageCreateTalk(data);
                $scope.page_created = true;
            } else {
                $scope.content = null
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

    $scope.pageCreateBlog = function (data) {
        $("#PageCountblog").val(data.length);
        $("#PageSizeblog").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.profileBlogGet(num)
                }
            }, "blog")
        }
    };

    $scope.pageCreateTalk = function (data) {
        $("#PageCounttalk").val(data.length);
        $("#PageSizetalk").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.profileTalkGet(num)
                }
            }, "talk")
        }
    };


    $scope.optionsSelect = function (each) {
        $scope.options.forEach(function (item) {
            item.select = item.key === each.key
        })
        $scope.currentOption = each;
        $scope.page_created = false;
        each.func()
    };


    $scope.blog = function (id) {
        window.open("http://127.0.0.1:3000/#!/main/community/blog?id=" + id)
    };

    $scope.options = [{
        "key": "blog",
        "name": "文章",
        "select": true,
        "func": $scope.profileBlogGet,
        "eachFunc": $scope.blog
    }, {
        "key": "talk",
        "name": "说说",
        "select": false,
        "func": $scope.profileTalkGet
    }, {
        "key": "collect",
        "name": "收藏",
        "select": false
    }, {
        "key": "cared",
        "name": "关注我的",
        "select": false
    }, {
        "key": "care",
        "name": "我关注的",
        "select": false
    }, {
        "key": "leave",
        "name": "留言板",
        "select": false
    }, {
        "key": "message",
        "name": "消息",
        "select": false
    }]

}])