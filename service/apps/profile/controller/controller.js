let app = require("../../app")
import "../style/style.scss"
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

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
        $scope.introduceEdit()
    };


    $scope.introduceEdit = function () {
        let btn = document.body.querySelector("#introduce-edit");
        let introduce = document.body.querySelector("#introduce");
        btn.addEventListener("click", function () {
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
        });
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
        dataService.callOpenApi("user.profile.get", {"cubeid": $rootScope.userId}, "private").then(function (data) {
            if (data.success) {
                $scope.userImage = "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + data.profile.image;
                $scope.userName = data.profile.name;
                $scope.userProfile = data.profile
            }
        })
    };

    $scope.uploadImg = function () {
        document.querySelector('#imgReader').click();
        document.querySelector('#imgReader').addEventListener('change', function (eve) {
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
                        preview: [document.querySelector('.previewBox'),
                            document.querySelector('.previewBoxRound')],
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

    $scope.cutBtnConfirm = function () {
        $scope.cropper.getCroppedCanvas({
            maxWidth: 4096,
            maxHeight: 4096,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'medium',
        }).toBlob((blob) => {
            $scope.getUserImgBase64(blob);
            $scope.imageDialogClose();
        })
    };

    $scope.sendUserImage = function (image) {
        if (!$rootScope.userId) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi('send.user.image', {
            image: image,
            cubeid: $rootScope.userId,
            mode: "private"
        }, 'private').then(function (data) {

        })
    };

    $scope.getUserImgBase64 = function (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            $scope.userImage = e.target.result;
            $scope.$apply();
            $scope.sendUserImage(e.target.result)
        }
    };

    $scope.profileBlogGet = function (page = 1) {
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
                            let cover = ["http://47.119.151.14:3001/blog", item["cube_id"], time, item.cover].join("/")
                            item.cover = cover
                        }
                    })
                }
                $scope.rocket();
                $scope.profileBlogData = data.content;
                $scope.current_page = page;
                $scope.pageCreate(data);
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
        }, "common").then(function (data) {
            $rootScope.swal.close()
            if (data.success && data.length) {
                // if (data.content) {
                //     data.content.forEach(function (item) {
                //         let time = item.date.split(" ")[0].split("-").join("")
                //         item.author = item.name
                //         if (item.cover) {
                //             let cover = ["http://47.119.151.14:3001/blog", item["cube_id"], time, item.cover].join("/")
                //             item.cover = cover
                //         }
                //     })
                // }
                // // $scope.rocket();
                // $scope.profileData = data.content;
                // $scope.current_page = page;
                // $scope.pageCreate(data);
                // $scope.page_created = true;
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
                    $scope.profileBlogGet(num)
                }
            })
        }
    };


    $scope.optionsSelect = function (each) {
        $scope.options.forEach(function (item) {
            item.select = item.key === each.key
        })
        $scope.currentOption = each;
        each.func()
    };


    $scope.blog = function (id) {
        window.open("http://127.0.0.1:3000/#!/main/community/blog?id=" + id)
    };

    $scope.options = [{
        "key": "blog",
        "name": "文章",
        "select": true,
        "func": $scope.profileBlogGet
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