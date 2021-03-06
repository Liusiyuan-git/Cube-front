import Viewer from "viewerjs";

let app = require("../../app")
import "../style/style.scss"
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
import E from "wangeditor";


app.controller("profileCtrl", ["$rootScope", "$scope", "$state", "$timeout", "$q", 'dataService', function ($rootScope, $scope, $state, $timeout, $q, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.initParams();
        $scope.userProfileGet();
        $scope.rocketPosition();
        $scope.userCareConfirm();
    };

    $scope.userCareConfirm = function () {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi("user.care.confirm", {
            id: $rootScope.userId,
            cubeid: $scope.profileId,
        }, "private").then(function (data) {
            if (data.success) {
                $scope.careComfirm = data["exist"];
            }
        })
    };

    $scope.care = function () {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning("info", "请先登录")
            return null
        }
        dataService.callOpenApi("user.care.set", {
            id: $rootScope.userId,
            cubeid: $scope.profileId
        }, "private").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("success", "感谢关注！");
                $scope.userCareConfirm();
                $scope.userProfileGet();
            } else {
                $rootScope.cubeWarning("error", data.msg || "关注出错")
            }
        })
    };

    $scope.careCancelFront = function () {
        $rootScope.coco({
            title: "关注",
            el: "#care",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $scope.careCancel();
                done()
            } else {
                done()
            }
        });
    };

    $scope.careCancel = function () {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning("info", "请先登录")
            return null
        }
        dataService.callOpenApi("user.care.cancel", {
            id: $rootScope.userId,
            cubeid: $scope.profileId
        }, "private").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("success", "已取消关注");
                $scope.userCareConfirm();
                $scope.userProfileGet();
            } else {
                $rootScope.cubeWarning("error", data.msg || "未知错误");
            }
        })
    };

    $scope.nameEdit = function () {
        let introduce = document.body.querySelector("#name");
        $rootScope.coco({
            title: "设置",
            el: "#name-edit-dialog",
            okText: "提交",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                let s = introduce.value.trim();
                if (s !== "") {
                    if (s.length <= 8) {
                        $scope.nameSend(introduce.value.trim());
                        done()
                    } else {
                        $rootScope.cubeWarning("info", "字数不要超过8！");
                    }
                } else {
                    $rootScope.cubeWarning("error", "输入不能为空！");
                }
            } else {
                done()
            }
        });
    };

    $scope.nameSend = function (s) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        dataService.callOpenApi("user.name.send", {
            "cubeid": $rootScope.userId,
            "name": s
        }, "private").then(function (data) {
            if (data.success) {
                $scope.userProfile.name = s;
                $scope.userName = s;
                $rootScope.cubeWarning("success", "修改成功")
            } else {
                $rootScope.cubeWarning("success", data.msg || "未知错误")
            }
        })
    };

    $scope.introduceEdit = function () {
        let introduce = document.body.querySelector("#introduce");
        $rootScope.coco({
            title: "设置",
            el: "#introduce-edit-dialog",
            okText: "提交",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                let s = introduce.value.trim();
                if (s !== "") {
                    if (s.length <= 30) {
                        $scope.introduceSend(introduce.value.trim());
                        done()
                    } else {
                        $rootScope.cubeWarning("info", "字数不要超过30个！");
                    }
                } else {
                    $rootScope.cubeWarning("error", "输入不能为空！");
                }
            } else {
                done()
            }
        });
    };

    $scope.talkDelete = function (id, cube_id, images, date, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        $rootScope.coco({
            title: "评论删除",
            el: "#talk-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                dataService.callOpenApi('talk.delete', {
                    id: id,
                    index: index + "",
                    images: images,
                    date: date,
                    cube_id: cube_id,
                }, 'private').then(function (data) {
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || '未知錯誤')
                    } else {
                        $scope.page_created = false;
                        $scope.profileTalkGet().then(function () {
                            $scope.userProfileGet();
                        });
                    }
                    done()
                })
            } else {
                done()
            }
        });
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

    $scope.talkCommentDialog = function () {
        $scope.commentDialog = new ($rootScope.coco({
            title: "评论",
            el: "#talk-comment-block-profile-" + $scope.scopeId,
            width: "600px",
            height: "650px",
            destroy: false,
        })).onClose(function (ok, cc, done) {
            $scope.talkCommentEditor.destroy();
            $scope.talkCommentEditor = null;
            $scope.talkCommentData = null;
            $scope.talk_comment_page_created = false;
            done()
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

    $scope.talkCommentGet = function (id, item, page = 1) {
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
                if ($scope.talkCommentData) {
                    $timeout(function () {
                        $scope.talk_comment_current_page = page;
                        $scope.talkCommentPageCreate(data, id, item);
                        $scope.talk_comment_page_created = true;
                        $rootScope.$apply();
                    }, 500)
                }
            }
        })
    };

    $scope.talkCommentSend = function () {
        let item = $scope.currentTalk;
        let id = $scope.currentTalk.id;
        let index = $scope.currentTalkIndex;
        let talkCubeId = $scope.currentTalk["cube_id"]
        item.comment = parseInt(item.comment) + 1
        let text = $scope.talkCommentEditor.txt.text()
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('error', '请先登录');
            return null
        }
        if (text === '') {
            $rootScope.cubeWarning('warning', '内容不能为空');
            return null
        }
        if (text.length > 200) {
            $rootScope.cubeWarning('warning', '字数：' + text.length + " （大于200）");
            return null
        }
        dataService.callOpenApi('send.talk.comment', {
            id: id,
            cubeid: $rootScope.userId,
            talkCubeId: talkCubeId,
            text: text,
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功');
                $scope.talkCommentEditor.txt.clear();
                $scope.profileTalkDataCount[2 * index + 1] = parseInt($scope.profileTalkDataCount[2 * index + 1]) + 1;
                $scope.talk_comment_page_created = false;
                $scope.talkCommentGet(id, item);
            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错');
            }
        })
    };

    $scope.talkCommentDelete = function (id, item_id, item, cube_id, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录');
            return null
        }
        let talkIndex = $scope.currentTalkIndex;
        $rootScope.coco({
            title: "评论删除",
            el: "#delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                dataService.callOpenApi('delete.talk.comment', {
                    id: id,
                    index: index + "",
                    cubeid: cube_id,
                    talkid: item_id,
                }, 'private').then(function (data) {
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || '未知錯誤')
                    } else {
                        $scope.profileTalkDataCount[2 * talkIndex + 1] = parseInt($scope.profileTalkDataCount[2 * talkIndex + 1]) - 1;
                        $scope.talk_comment_page_created = false;
                        $scope.talkCommentGet(item_id, item);
                    }
                    done()
                })
            } else {
                done()
            }
        });
    };

    $scope.talkCommentPageCreate = function (data, id, item) {
        $("#PageCount" + 'talkComment').val(data.length);
        $("#PageSize" + 'talkComment').val(10);
        if (!$scope.talk_comment_page_created) {
            $rootScope.loadpage(function (num, type) {
                let talkIndex = $scope.currentTalkIndex;
                $scope.profileTalkDataCount[2 * talkIndex + 1] = data.length;
                if (num !== $scope.talk_comment_current_page) {
                    $scope.talkCommentGet(id, item, num);
                }
            }, 'talkComment')
        }
    };

    $scope.talkCommentEditorCreate = function () {
        $scope.talkCommentEditor = new E('#talk-comment-toolbar', "#talk-comment-text");
        $scope.talkCommentEditor.config.menus = [
            'emoticon'
        ]
        $scope.talkCommentEditor.config.showFullScreen = false;
        $scope.talkCommentEditor.config.placeholder = '请填写评论（字数不超200）';
        $scope.talkCommentEditor.config.showMenuTooltips = false;
        $scope.talkCommentEditor.config.height = 33;
        $scope.talkCommentEditor.create();
    };

    $scope.introduceSend = function (s) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        dataService.callOpenApi("user.introduce.send", {
            "cubeid": $rootScope.userId,
            "introduce": s
        }, "private").then(function (data) {
            if (data.success) {
                $scope.userProfile.introduce = s;
                $scope.userIntroduce = s;
                $rootScope.cubeWarning("success", "修改成功");
            } else {
                $rootScope.cubeWarning("success", data.msg || "未知错误");
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

    $scope.rocketTop = function () {
        document.documentElement.scrollIntoView({block: 'start'})
    };

    $scope.initParams = function () {
        $scope.scopeId = $scope.$id;
        $scope.inputimage = "";
        $scope.userImage = "";
        $scope.profileId = localStorage.getItem("profileId");
        let menu = parseInt($state.params.menu)
        if (!$scope.options[menu]) {
            $scope.currentOption = $scope.options[0];
        } else {
            $scope.currentOption = $scope.options[menu];
        }
        $scope.currentOption.func();
    };

    $scope.blogDelete = function (e, item, index) {
        e.stopPropagation();
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        $rootScope.coco({
            title: "删除",
            el: "#blog-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $rootScope.cubeLoading("加载中...");
                dataService.callOpenApi("blog.delete", {
                    "label": item["label"],
                    "label_type": item["label_type"],
                    "index": index + "",
                    "cover": item["cover"] ? item["cover"].split("/").pop() : "",
                    "date": item["date"],
                    "image": item["image"],
                    "blog_id": item["id"] + "",
                    "cube_id": item["cube_id"]
                }, "private").then(function (data) {
                    $rootScope.swal.close();
                    if (data.success) {
                        $scope.page_created = false;
                        $scope.profileBlogGet().then(function () {
                            $scope.userProfileGet();
                        })
                    } else {
                        $rootScope.cubeWarning("error", data.msg || data.message || "未知错误")
                    }
                })
                done()
            } else {
                done()
            }
        });
    };

    $scope.collectDelete = function (e, item, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        e.stopPropagation();
        $rootScope.coco({
            title: "删除",
            el: "#collect-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $rootScope.cubeLoading("加载中...");
                dataService.callOpenApi("collect.delete", {
                    "index": index + "",
                    "blog_id": item["id"],
                    "cube_id": item["cube_id"]
                }, "private").then(function (data) {
                    $rootScope.swal.close();
                    if (data.success) {
                        $scope.page_created = false;
                        $scope.profileCollectGet().then(function () {
                            $scope.userProfileGet();
                        })
                    } else {
                        $rootScope.cubeWarning("error", data.msg || data.message || "未知错误")
                    }
                })
                done()
            } else {
                done()
            }
        });
    };

    $scope.leaveDelete = function (item, index) {
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        $rootScope.coco({
            title: "删除",
            el: "#leave-delete",
            okText: "确认",
            buttonColor: '#0077ff',
        }).onClose(function (ok, cc, done) {
            if (ok) {
                $rootScope.cubeLoading("加载中...");
                dataService.callOpenApi("profile.leave.delete", {
                    "id": item["id"],
                    "index": index + "",
                    "leave_id": item["leave_id"],
                    "cube_id": item["cube_id"]
                }, "private").then(function (data) {
                    $rootScope.swal.close();
                    if (data.success) {
                        $scope.page_created = false;
                        $scope.profileLeave();
                    } else {
                        $rootScope.cubeWarning("error", data.msg || data.message || "未知错误")
                    }
                })
                done()
            } else {
                done()
            }
        });
    }

    $scope.loadingImg = function (eve) {
        let reader = new FileReader();
        if (eve.target.files[0]) {
            reader.readAsDataURL(eve.target.files[0]);
            reader.onload = (e) => {
                let dataURL = reader.result;
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
        dataService.callOpenApi("user.profile.get", {"cubeid": $scope.profileId}, "common").then(function (data) {
            if (data.success) {
                $scope.userImage = data.profile[0] ? $rootScope.fileServer + "/user/image/" + $scope.profileId + "/" + data.profile[0] : null;
                $scope.userName = data.profile[1];
                $scope.userIntroduce = data.profile[2];
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
                    buttonColor: '#0077ff',
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
        if (!$scope.loginStatusCheck()) {
            $rootScope.cubeWarning('info', '请先登录')
            return null
        }
        $rootScope.cubeLoading("上传中...");
        dataService.callOpenApi('send.user.image', {
            image: image,
            cubeid: $rootScope.userId,
            mode: "private"
        }, 'private').then(function (data) {
            $rootScope.swal.close();
            if (data.success) {
                $rootScope.cubeWarning("success", "上传成功");
                $scope.userImageUpdate();
            } else {
                $rootScope.cubeWarning("error", data.msg || "上传出错");
            }
            $scope.imageDialogClose();
            done()
        })
    };

    $scope.userImageUpdate = function () {
        dataService.callOpenApi('user.image.update', {
            cubeid: $rootScope.userId,
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.userImage = $rootScope.fileServer + "/user/image/" + $rootScope.userId + "/" + data.image;
                localStorage.setItem("userImage", data.image);
            } else {
                $rootScope.cubeWarning("error", data.msg || "未知错误");
            }
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
        let defer = $q.defer();
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.blog.get", {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                if (data.content) {
                    data.content.forEach(function (item) {
                        let time = item.date.split(" ")[0].split("-").join("")
                        item.author = item.name
                        if (item.cover) {
                            let cover = [$rootScope.fileServer + "/blog", item["cube_id"], time, item.cover].join("/")
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
            defer.resolve(data);
        })
        return defer.promise;
    };

    $scope.profileTalkGet = function (page = 1) {
        let defer = $q.defer();
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.talk.get", {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                if (data.content) {
                    $scope.profileTalkData = data.content;
                    $scope.profileTalkDataCount = data.count;
                    $scope.profileTalkDataMode = data.mode;
                    $scope.talkImagesSet(data.content);
                }
                $scope.current_page = page;
                $scope.pageCreateTalk(data);
                $scope.page_created = true;
            } else {
                $scope.profileTalkData = null;
            }
            defer.resolve(data);
        })
        return defer.promise;
    };

    $scope.profileCollectGet = function (page = 1) {
        let defer = $q.defer()
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi("profile.collect.get", {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                if (data.content) {
                    data.content.forEach(function (item) {
                        let time = item.date.split(" ")[0].split("-").join("")
                        item.author = item.name
                        if (item.cover) {
                            let cover = [$rootScope.fileServer + "/blog", item["cube_id"], time, item.cover].join("/")
                            item.cover = cover
                        }
                    })
                }
                $scope.profileCollectData = data.content || null;
                $scope.current_page = page;
                $scope.pageCreateCollect(data);
                $scope.page_created = true;
            } else {
                $scope.profileCollectData = null;
            }
            defer.resolve()
        })
        return defer.promise;
    };

    $scope.talkLike = function (id, item, index) {
        dataService.callOpenApi('talk.like', {
            id: id,
        }, 'common').then(function (data) {
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || '未知錯誤');
            } else {
                $rootScope.cubeWarning('success', '感谢鼓励！');
                $scope.profileTalkDataCount[2 * index] = parseInt($scope.profileTalkDataCount[2 * index]) + 1;
            }
        })
    };

    $scope.talkImagesSet = function (content) {
        $scope.talkImagesBlock = {};
        content.forEach(function (item) {
            let time = item.date.split(" ")[0].split("-").join("");
            if (item.images) {
                item.images.split(":").forEach(function (image) {
                    let link = [$rootScope.fileServer + "/talk", item["cube_id"], time, image].join("/")
                    if (!$scope.talkImagesBlock[item["id"]]) {
                        $scope.talkImagesBlock[item["id"]] = [link];
                    } else {
                        $scope.talkImagesBlock[item["id"]].push(link);
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
                    $scope.rocketTop();
                    $scope.profileBlogGet(num);
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
                    $scope.rocketTop();
                    $scope.profileTalkGet(num);
                }
            }, "talk")
        }
    };

    $scope.pageCreateCollect = function (data) {
        $("#PageCountcollect").val(data.length);
        $("#PageSizecollect").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.profileCollectGet(num);
                }
            }, "collect")
        }
    };


    $scope.optionsSelect = function (each, index) {
        $scope.currentOption = each;
        $scope.page_created = false;
        each.func();
        $state.go("profile", {menu: index}, {notify: false, reload: false})
    };

    $scope.blog = function (id) {
        $state.go("blog", {id: id})
    };

    $scope.goToUserProfile = function (cube_id) {
        localStorage.setItem("profileId", cube_id);
        $state.go("profile", {state: 'profile', "menu": 0}, {reload: 'profile'});
    };

    $scope.profileCare = function () {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi('user.profile.care', {
            cubeid: $scope.profileId,
        }, 'common').then(function (data) {
            $rootScope.swal.close()
            if (data.success) {
                $scope.profileCareData = data["profileCare"]
            }
        })
    };

    $scope.profileCared = function () {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi('user.profile.cared', {
            cubeid: $scope.profileId,
        }, 'common').then(function (data) {
            $rootScope.swal.close()
            if (data.success) {
                $scope.profileCaredData = data["profileCared"]
            }
        })
    };

    $scope.profileLeave = function (page = 1) {
        $rootScope.cubeLoading("加载中...");
        dataService.callOpenApi('profile.leave.get', {
            "page": page + "",
            "cube_id": $scope.profileId
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                if (data.content) {
                    data.content.forEach(function (item) {
                        item.image = item.image || null;
                    });
                    $scope.profileLeaveData = data.content || null;
                }
                $scope.current_page = page;
                $scope.pageCreateLeave(data);
                $scope.page_created = true;
            } else {
                $scope.profileLeaveData = null;
            }
        })
    };

    $scope.pageCreateLeave = function (data) {
        $("#PageCountleave").val(data.length);
        $("#PageSizeleave").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.rocketTop();
                    $scope.profileLeave(num);
                }
            }, "leave")
        }
    };

    $scope.toLeave = function () {
        $scope.leaveDialog();
        $scope.leaveEditorCreate();
    };

    $scope.leaveDialog = function () {
        $rootScope.coco({
            title: "留言",
            el: "#leave-block",
            width: "600px",
            height: "650px",
            destroy: true,
            hooks: {
                closed() {
                    $scope.leaveEditor.txt.clear();
                    $scope.leaveEditor.destroy();
                    $scope.leaveEditor = null;
                }
            },
        }).onClose(function (ok, cc, done) {
            if (ok) {
                let text = $scope.leaveEditor.txt.text()
                if (!$scope.loginStatusCheck()) {
                    $rootScope.cubeWarning('error', '请先登录');
                    return null
                }
                if (text === '') {
                    $rootScope.cubeWarning('warning', '内容不能为空');
                    return null
                }
                if (text.length > 200) {
                    $rootScope.cubeWarning('warning', '字数：' + text.length + "（ 大于200）");
                    return null
                }
                dataService.callOpenApi('profile.leave.set', {
                    cubeId: $scope.profileId,
                    leaveId: $rootScope.userId,
                    text: text,
                }, 'private').then(function (data) {
                    if (data.success) {
                        $rootScope.cubeWarning('success', '留言成功');
                        done()
                        $scope.profileLeave();
                    } else {
                        $rootScope.cubeWarning('error', data.msg || '留言出错');
                    }
                })
            } else {
                done()
            }
        });
    };

    $scope.leaveEditorCreate = function () {
        $scope.leaveEditor = new E('#leave-toolbar', "#leave-text");
        $scope.leaveEditor.config.menus = [
            'emoticon'
        ];
        $scope.leaveEditor.config.showFullScreen = false;
        $scope.leaveEditor.config.placeholder = '请填写留言（字数不超200）';
        $scope.leaveEditor.config.menuTooltipPosition = 'up';
        $scope.leaveEditor.config.showMenuTooltips = false;
        $scope.leaveEditor.config.height = 33;
        $scope.leaveEditor.create();
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
        "select": false,
        "func": $scope.profileCollectGet,
        "eachFunc": $scope.blog
    }, {
        "key": "cared",
        "name": "关注我的",
        "select": false,
        "func": $scope.profileCared,
    }, {
        "key": "care",
        "name": "我关注的",
        "select": false,
        "func": $scope.profileCare,
    }, {
        "key": "leave",
        "name": "留言板",
        "select": false,
        "func": $scope.profileLeave,
    }]

}])