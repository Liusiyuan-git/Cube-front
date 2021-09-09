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
        $scope.profileBlogGet();
    };

    $scope.initParams = function () {
        $scope.inputimage = "";
        $scope.currentOption = $scope.options[0];
        $scope.profileId = localStorage.getItem("profileId");
    };

    $scope.loadingImg = function (eve) {

        //读取上传文件
        console.log("nnnnnn")
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
    }

    $scope.uploadImg = function () {
        document.querySelector('#imgReader').click()
        document.querySelector('#imgReader').addEventListener('change', function (eve) {
            let image = document.getElementById('user-image-dialog');
            image.style.display = "flex";
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
        })
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
                // $scope.rocket();
                $scope.profileData = data.content;
                // $scope.current_page = page;
                // $scope.pageCreate(data);
                // $scope.page_created = true;
            } else {
                $scope.content = null
            }
        })
    };

    $scope.optionsSelect = function (each) {
        $scope.options.forEach(function (item) {
            item.select = item.key === each.key
        })
        $scope.currentOption = each;
    };

    $scope.blog = function (id) {
        window.open("http://127.0.0.1:3000/#!/main/community/blog?id=" + id)
    };

    $scope.options = [{
        "key": "blog",
        "name": "文章",
        "select": true,
        "func": $scope.blog
    }, {
        "key": "talk",
        "name": "说说",
        "select": false
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