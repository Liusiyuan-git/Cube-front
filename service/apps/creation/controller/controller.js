import E from 'wangeditor'
import "../style/style.scss"
import hljs from 'highlight.js'
import 'highlight.js/styles/monokai-sublime.css'

window.app.controller("creationCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', 'Upload', '$q',
    function ($rootScope, $scope, $state, $timeout, dataService, Upload, $q) {
        $scope.init = function () {
            $timeout(function () {
                let frame = document.getElementById("container");
                frame.className = "container in";
            }, 300);
            $scope.blogTitle = {};
            $scope.cover = null
            $scope.sendResult = null;
            $scope.stateJumpConfirm = null;
            $scope.currentMark = $scope.mark[0];
            $scope.currentMarkChild = $scope.currentMark.child[0]
            $scope.reader = new FileReader();
            $scope.editorInit();
            $scope.scroll()
        };

        $scope.editorInit = function () {
            $scope.editor = new E('#editor-toolbar', '#editor-text');
            $scope.editor.config.zIndex = 2000;
            $scope.editor.config.height = 1200;
            $scope.editor.highlight = hljs;
            $scope.editor.config.uploadImgMaxSize = 2 * 1024 * 1024;
            $scope.editor.config.excludeMenus = [
                'video',
                'undo',
                'redo',
            ];
            $scope.editor.config.customUploadImg = function (resultFiles, insertImgFn) {
                if (!$scope.loginStatusCheck()) {
                    $rootScope.cubeWarning('info', '请先登录');
                    return null
                }
                $scope.reader.readAsDataURL(resultFiles[0])
                $scope.reader.onload = function (e) {
                    $rootScope.cubeLoading("图片加载中...")
                    dataService.callOpenApi("draft.image.upload", {
                        cube_id: $rootScope.userId,
                        mode: "content",
                        image: e.target.result
                    }, "private").then(function (data) {
                        $rootScope.swal.close();
                        if (data.success) {
                            insertImgFn([$rootScope.fileServer + "/draft", $rootScope.userId, data["filename"]].join("/"))
                        } else {
                            $rootScope.cubeWarning('error', data.message || "图片上传失败")
                        }
                    })
                }
            }
            // $scope.editor.config.uploadImgShowBase64 = true
            $scope.editor.config.showLinkImg = false;
            $scope.editor.create()
        };

        $scope.sendMenu = function (e) {
            let element = document.getElementById("send-menu")
            if (element) {
                element.style.display = "inline";
            }
            e.stopPropagation();
            document.onclick = function (e) {
                let element = document.getElementById("send-menu")
                if (element) {
                    element.style.display = "none";
                }
                e.stopPropagation();
            };
        };

        $scope.editorDataSet = function () {
            $rootScope.cubeLoading("加载中...")
            dataService.callOpenApi("get.draft", {cubeid: $rootScope.userId}, "private").then(function (data) {
                $rootScope.swal.close();
                if (data.success) {
                    if (data.content) {
                        let draft = data.content[0];
                        let content = draft.content;
                        $scope.editor.txt.html(content);
                        if (draft.cover) {
                            $scope.cover = [$rootScope.fileServer + "/draft", draft["cube_id"], draft.cover].join("/");
                        }
                        $scope.blogTitle.text = draft.title;
                    }
                } else {
                    $rootScope.cubeWarning('error', data.msg || "草稿获取失败");
                }
            })
        };


        $scope.upload = function (file) {
            if (!$scope.loginStatusCheck()) {
                $rootScope.cubeWarning('info', '请先登录');
                return null
            }
            if (file) {
                $scope.reader.readAsDataURL(file)
                $scope.reader.onload = function (e) {
                    $rootScope.cubeLoading("图片加载中...")
                    dataService.callOpenApi("draft.image.upload", {
                        cube_id: $rootScope.userId,
                        mode: "cover",
                        image: e.target.result
                    }, "private").then(function (data) {
                        $rootScope.swal.close();
                        if (data.success) {
                            $scope.cover = [$rootScope.fileServer + "/draft", $rootScope.userId, data["filename"]].join("/");
                        } else {
                            $rootScope.cubeWarning('error', data.message || "图片上传失败")
                        }
                    })
                }
            }
        };

        $scope.delete = function (confirm = true) {
            if (!$scope.loginStatusCheck()) {
                $rootScope.cubeWarning('info', '请先登录');
                return null
            }
            if (!confirm) {
                $scope.deleteFunc();
                return null;
            }
            $rootScope.coco({
                title: "删除",
                el: "#cover-delete",
                okText: "确认",
                buttonColor: '#0077ff',
            }).onClose(function (ok, cc, done) {
                if (ok) {
                    $scope.deleteFunc();
                    done();
                } else {
                    done();
                }
            });
        };

        $scope.deleteFunc = function () {
            if ($scope.cover) {
                dataService.callOpenApi("draft.image.delete", {
                    "cube_id": $rootScope.userId,
                    "filename": $scope.cover.split("/").pop()
                }, "private")
            }
            $scope.cover = null;
        }

        $scope.save = function (mode) {
            let defer = $q.defer()
            let text = $scope.editor.txt.text()
            if (text === '' && !$scope.blogTitle.text && !$scope.cover) {
                $rootScope.cubeWarning('warning', '内容不能为空')
                if (mode === "state_jump") {
                    defer.reject(false)
                    return defer.promise;
                } else {
                    return null
                }
            }
            if (!$scope.loginStatusCheck()) {
                $rootScope.cubeWarning('error', '请先登录')
                if (mode === "state_jump") {
                    defer.reject(false)
                    return defer.promise;
                } else {
                    return null
                }
            }
            let content = $scope.editor.txt.getJSON()
            let html = $scope.editor.txt.html();
            let params = {
                cubeid: $rootScope.userId,
                images: JSON.stringify($scope.imageBox(content)),
                cover: $scope.cover ? $scope.cover.split("/").pop() : "",
                title: $scope.blogTitle.text,
                content: html,
            }
            $rootScope.swal.fire({
                title: '保存',
                text: '草稿保存中，请稍后',
                iconHtml: '<div class="iconfont icon-save" style="font-size: 40px"></div>',
                iconColor: '#3fc3ee',
                didOpen: () => {
                    $rootScope.swal.showLoading()
                    dataService.callOpenApi("send.draft", params, "private").then(function (data) {
                        $rootScope.swal.close()
                        if (!data.success) {
                            $rootScope.cubeWarning('error', data.msg || "保存失败")
                            defer.reject(false)
                        } else {
                            $rootScope.cubeWarning('success', "保存成功", 3000)
                            defer.resolve(true)
                        }
                    })
                }
            })
            return defer.promise;
        };

        $scope.clear = function () {
            let text = $scope.editor.txt.text()
            if (text === '' && !$scope.blogTitle.text && !$scope.cover) {
                $rootScope.cubeWarning('warning', '内容不能为空')
                return null
            }
            if (!$scope.loginStatusCheck()) {
                $rootScope.cubeWarning('error', '请先登录')
                return null
            }
            $rootScope.confirm('warning', '一鍵清除', '是否清除全部内容？', '确定').then(function (result) {
                if (result.isConfirmed) {
                    dataService.callOpenApi("remove.draft", {"cubeid": $rootScope.userId}, "private").then(function (data) {
                        $rootScope.swal.close();
                        if (!data.success) {
                            $rootScope.cubeWarning('error', data.msg || "清除失败")
                        } else {
                            $scope.allClear();
                            $rootScope.cubeWarning('success', '内容已全部清除', 3000)
                        }
                    })
                }
            })
        };

        $scope.allClear = function () {
            $scope.blogTitle.text = null;
            $scope.editor.txt.clear();
            $scope.delete(false)
        }

        $scope.scroll = function () {
            let body = document.getElementById("cube-body")
            let rocket = document.getElementById("rocket")
            body.onscroll = function () {
                let scrollT = document.documentElement.scrollTop;
                rocket.style.display = "flex"
                if (70 - scrollT >= 0) {
                    rocket.style.display = "none"
                }
            };
        };

        $scope.rocket = function () {
            document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
        };

        $scope.send = function () {
            let text = $scope.editor.txt.text()
            if (text.length > 249) {
                text = text.replace(/&nbsp;/g, "").slice(0, 249) + "...";
            }
            if (!$scope.blogTitle.text) {
                $rootScope.cubeWarning('warning', '请填写标题')
                return null
            }
            if ($scope.blogTitle.text.length > 20) {
                $rootScope.cubeWarning('warning', '标题长度不超过20')
                return null
            }
            if (text === '') {
                $rootScope.cubeWarning('warning', '内容不能为空')
                return null
            }
            if (!$scope.loginStatusCheck()) {
                $rootScope.cubeWarning('error', '请先登录')
                return null
            }
            let content = $scope.editor.txt.getJSON()
            let params = {
                cubeid: $rootScope.userId,
                images: JSON.stringify($scope.imageBox(content)),
                cover: $scope.cover ? $scope.cover.split("/").pop() : "",
                title: $scope.blogTitle.text,
                content: JSON.stringify(content),
                text: text,
                label: $scope.currentMark["key"],
                labeltype: $scope.currentMarkChild["key"]
            }
            $rootScope.swal.fire({
                title: '发布',
                text: '发布中，请稍后',
                iconHtml: '<div class="iconfont icon-send" style="font-size: 40px;transform: rotate(-90deg);"></div>',
                iconColor: '#3fc3ee',
                didOpen: () => {
                    $rootScope.swal.showLoading()
                    dataService.callOpenApi("send.blog", params, "private").then(function (data) {
                        $scope.dataSendConfirm = data.success
                        $rootScope.swal.close()
                        if (!data.success) {
                            $rootScope.cubeWarning('error', data.msg || "未知错误")
                        } else {
                            $rootScope.cubeWarning('success', "发布成功", 3000).then(function () {
                                $state.go("home", {state: 'home'});
                            })
                        }
                    })
                }
            })
        };

        $scope.imageBox = function (content) {
            let box = []
            content.forEach(function (item) {
                let _box = []
                if (item["children"]) {
                    item["children"].forEach(function (_item) {
                        if (_item["tag"] && _item["tag"] === 'img') {
                            _item["attrs"].forEach(function (_attr) {
                                if (_attr["name"] === 'src') {
                                    _box.push(_attr["value"].split("/").pop())
                                    _attr["value"] = ""
                                }
                                if (_attr["name"] === 'alt') {
                                    _attr["value"] = ""
                                }
                            })
                        }
                    })
                }
                box.push(_box)
            })
            return box
        }

        $scope.imageSet = function (content, images, cubeid) {
            let defer = $q.defer()
            if (images[0] !== "") {
                content.forEach(function (item) {
                    if (item["children"]) {
                        item["children"].forEach(function (_item) {
                            if (_item["tag"] && _item["tag"] === 'img') {
                                let image = [$rootScope.fileServer + "/draft", cubeid, images.shift()].join("/")
                                _item["attrs"].forEach(function (_attr) {
                                    if (_attr["name"] === 'src') {
                                        _attr["value"] = image
                                    }
                                })
                                if (images.length === 0) {
                                    defer.resolve()
                                }
                            }
                        })
                    }
                })
            } else {
                defer.resolve()
            }
            return defer.promise;
        }

        $scope.image2Base64 = function (img, type) {
            let canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            return canvas.toDataURL("image/" + type);
        }

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            if ($rootScope.userId && !$scope.stateJumpConfirm) {
                if (!$scope.dataSendConfirm) {
                    event.preventDefault();
                    $rootScope.confirm('warning', '是否保存草稿？', '已保存的可忽略', '保存').then(function (result) {
                        if (result.isConfirmed) {
                            $scope.save("state_jump").then(function (result) {
                                if (result) {
                                    $scope.stateJumpConfirm = true;
                                    $state.go(toState, toParams);
                                } else {
                                    $scope.$emit("mainMenu")
                                }
                            }, function () {
                                $scope.$emit("mainMenu")
                            })
                        } else {
                            $scope.stateJumpConfirm = true;
                            $state.go(toState, toParams);
                        }
                    })
                }
            }
        });

        $scope.markSelect = function (i, event) {
            $scope.currentMark = i
            $scope.currentMarkChild = i.child[0]
            $scope.mark.forEach(function (item) {
                if (item.key === i.key) {
                    item.select = true
                    item.child.forEach(function (_item) {
                        _item.select = _item.key === i.child[0].key
                    })
                } else {
                    item.select = false
                }
            })
            event.stopPropagation();
        };

        $scope.markChildSelect = function (i, event) {
            $scope.currentMarkChild = i;
            $scope.currentMark.child.forEach(function (item) {
                item.select = item.key === i.key
            })
            event.stopPropagation();
        };

        $scope.mark = [{
            "key": "language",
            "name": "语言",
            "child": [{
                "key": "python",
                "name": "Python",
                "select": true,
            }, {
                "key": "go",
                "name": "Go",
                "select": false
            }, {
                "key": "java",
                "name": "Java",
                "select": false
            }, {
                "key": "javaScript",
                "name": "JavaScript",
                "select": false
            }, {
                "key": "c++",
                "name": "C++",
                "select": false
            }, {
                "key": "c",
                "name": "C",
                "select": false
            }],
            "select": true
        }, {
            "key": "middleware",
            "name": "中间件",
            "select": false,
            "child": [{
                "key": "redis",
                "name": "Redis",
                "select": true
            }, {
                "key": "rabbitmq",
                "name": "Rabbitmq",
                "select": false
            }]
        }, {
            "key": "virtualization",
            "name": "云原生",
            "select": false,
            "child": [{
                "key": "docker",
                "name": "Docker",
                "select": true
            }, {
                "key": "kubernetes",
                "name": "kubernetes",
                "select": false
            }, {
                "key": "microServices",
                "name": "微服务",
                "select": false
            }]
        }, {
            "key": "database",
            "name": "数据库",
            "select": false,
            "child": [{
                "key": "mysql",
                "name": "Mysql",
                "select": true
            }]
        }, {
            "key": "basics",
            "name": "计算机基础",
            "select": false,
            "child": [{
                "key": "network",
                "name": "网络",
                "select": false
            }, {
                "key": "dataStructure",
                "name": "数据结构和算法",
                "select": false
            }, {
                "key": "operatingSystem",
                "name": "操作系统",
                "select": false
            }, {
                "key": "computerComposition",
                "name": "计算机组成原理",
                "select": false
            }]
        }, {
            "key": "other",
            "name": "其他",
            "select": false,
            "child": [{
                "key": "live",
                "name": "生活",
                "select": true
            }]
        }]
    }])