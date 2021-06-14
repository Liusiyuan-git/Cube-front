let app = require("../../app")
import E from 'wangeditor'
import "../style/style.scss"

window.app.controller("creationCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', 'Upload',
    function ($rootScope, $scope, $state, $timeout, dataService, Upload) {
        $scope.init = function () {
            $scope.cover = null
            $scope.sendResult = null;
            $scope.dataSaveConfirm = null;
            $scope.reader = new FileReader();
            $scope.editorInit();
            $scope.scroll()
        };

        $scope.editorInit = function () {
            $scope.editor = new E('#editor-toolbar', '#editor-text');
            $scope.editor.config.height = 1200;
            $scope.editor.config.uploadImgMaxSize = 2 * 1024 * 1024;
            $scope.editor.config.uploadImgShowBase64 = true
            $scope.editor.config.showLinkImg = false;
            $scope.editor.create()
            $scope.editorDataSet()
        };

        $scope.editorDataSet = function () {
            let cover = localStorage.getItem('cube-cover');
            let data = localStorage.getItem('cube-content');
            let title = localStorage.getItem('cube-title');
            if (cover) {
                $scope.cover = cover
            }
            if (data) {
                $scope.editor.txt.setJSON(JSON.parse(data))
            }
            if (title) {
                $scope.title = title
            }
        };

        $scope.upload = function (file) {
            if (file) {
                $scope.reader.readAsDataURL(file)
                $scope.reader.onload = function (e) {
                    $scope.cover = e.target.result
                    $scope.$apply()
                    localStorage.setItem('cube-cover', e.target.result);
                }
            }
        };

        $scope.delete = function () {
            $scope.cover = null
            localStorage.removeItem('cube-cover');
        };

        $scope.save = function () {
            let content = $scope.editor.txt.getJSON()
            localStorage.setItem('cube-content', JSON.stringify(content));
            localStorage.setItem('cube-title', $scope.title);
            $rootScope.cubeWarning('success', '草稿保存成功')
        };

        $scope.clear = function () {
            $rootScope.confirm('是否清除全部内容？', '确定').then(function (result) {
                if (result.isConfirmed) {
                    $scope.allClear()
                    $rootScope.cubeWarning('success', '内容已全部清除')
                    $scope.$apply()
                }
            })
        };

        $scope.allClear = function () {
            $scope.title = null;
            $scope.editor.txt.clear();
            localStorage.removeItem('cube-content');
            localStorage.removeItem('cube-title');
            $scope.delete()
        }
        $scope.scroll = function () {
            let body = document.getElementById("cube-body")
            let option = document.getElementById("right-area")
            let rocket = document.getElementById("rocket")
            body.onscroll = function () {
                let scrollT = document.documentElement.scrollTop;
                rocket.style.display = "flex"
                if (70 - scrollT >= 0) {
                    option.style.top = (70 - scrollT) + "px";
                    rocket.style.display = "none"
                } else {
                    option.style.top = "5px"
                }
            };
        };

        $scope.rocket = function () {
            document.documentElement.scrollIntoView({block: 'start', behavior: 'smooth'})
        };

        $scope.send = function () {
            let text = $scope.editor.txt.text()
            if (!$scope.title) {
                $rootScope.cubeWarning('warning', '请填写标题')
                return null
            }
            if ($scope.title.length > 50) {
                $rootScope.cubeWarning('warning', '标题长度不超过50')
                return null
            }
            if (text === ' ') {
                $rootScope.cubeWarning('warning', '内容不能为空')
                return null
            }
            if (!$rootScope.userId) {
                $rootScope.cubeWarning('error', '请先登录')
                return null
            }
            let content = $scope.editor.txt.getJSON()
            let params = {
                cubeid: $rootScope.userId,
                images:JSON.stringify($scope.imageBox(content)),
                cover: $scope.cover,
                title: $scope.title,
                content: JSON.stringify(content),
                text: text.replace(/&nbsp;/g, "")
            }
            $rootScope.swal.fire({
                title: '发布',
                text: '发布中，请稍后',
                iconHtml: '<div class="iconfont icon-send" style="font-size: 40px;transform: rotate(-90deg);"></div>',
                iconColor: '#3fc3ee',
                didOpen: () => {
                    $rootScope.swal.showLoading()
                    dataService.callOpenApi("send.blog", params, "community").then(function (data) {
                        $scope.sendResult = data.success
                        $rootScope.swal.close()
                        if (!data.success) {
                            $rootScope.cubeWarning('error', data.msg)
                        } else {
                            $rootScope.cubeWarning('success', "发布成功", 3000).then(function () {
                                // $state.go("home", {state: 'home'});
                                // $scope.allClear();
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
                item["children"].forEach(function (_item) {
                    if (_item["tag"] && _item["tag"] === 'img') {
                        _item["attrs"].forEach(function (_attr) {
                            if (_attr["name"] === 'src') {
                                _box.push(_attr["value"])
                                _attr["value"] = ""
                            }
                            if (_attr["name"] === 'alt') {
                                _attr["value"] = ""
                            }
                        })
                    }
                })
                box.push(_box)
            })
            return box
        }

        $scope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (!$scope.sendResult) {
                if (!$scope.dataSaveConfirm) {
                    event.preventDefault();
                    $rootScope.confirm('是否保存草稿？', '保存').then(function (result) {
                        $scope.dataSaveConfirm = true;
                        if (result.isConfirmed) {
                            $scope.save()
                        }
                        $state.go(toState, toParams);
                    })
                }
            }
        })

    }])