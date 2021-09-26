let app = require("../../app.js")
import "../style/style.scss"

app.controller("loginCtrl", ['$rootScope', '$scope', '$state', '$timeout', '$interval', 'dataService', function ($rootScope, $scope, $state, $timeout, $interval, dataService) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame = document.getElementById("login-dialog");
            frame.className = "login-dialog in";
        }, 1000);
        $scope.count_save = true
        $scope.loginStatusCheck()
    };

    $scope.initParams = function () {
        $scope.count_save = true;
        $scope.phone_save = true;
        $scope.code_show = true;
        $scope.login = "count";
        $scope.box = ["count", "phone"]
        $rootScope.cubelocation = "login";
    };

    $scope.loginStatusCheck = function () {
        let starttime = parseInt(localStorage.getItem("setLoginStartTime"));
        let currenttime = (Date.parse(new Date())) / 1000;
        let second = Math.floor(currenttime - starttime);
        if (second <= 86400) {
            $rootScope.userId = localStorage.getItem("CubeId");
            $rootScope.userImage = "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + localStorage.getItem("userImage");
            $rootScope.login = true;
            $rootScope.cubeWarning('success', '登录成功', 3000).then(function () {
                $state.go("home", {state: 'home'});
            })
        } else {
            localStorage.removeItem('setLoginStartTime');
            localStorage.removeItem('CubeId');
            localStorage.removeItem('userImage');
            $rootScope.userId = "";
            $rootScope.userImage = "";
            $rootScope.login = false;
        }
    };

    $scope.change = function (index) {
        $scope.login = $scope.box[index]
    };

    $scope.countSave = function () {
        $scope.count_save = !$scope.count_save
    };

    $scope.phoneSave = function () {
        $scope.phone_save = !$scope.phone_save
    };

    $scope.Register = function () {
        $state.go("register");
    };

    $scope.phoneOnchange = function ($event) {
        console.log($event)
    };

    $scope.Count = function (event) {
        $scope.loginCount = event.target.value;
    };

    $scope.passWord = function (event) {
        $scope.loginPassword = event.target.value;
    };

    $scope.telephone = function (event) {
        $scope.loginPhone = event.target.value;
    };

    $scope.Code = function (event) {
        $scope.loginCode = event.target.value;
    };

    $scope.visitorMod = function () {
        $state.go("home", {state: 'home'});
    };

    $scope.getCode = function () {
        if (!$scope.loginPhone) {
            $rootScope.cubeWarning('error', '请输入手机号')
            return null;
        }
        $scope.code_show = false;
        $scope.codeTime = 120;
        $interval(function () {
            $scope.codeTime--;
            if ($scope.codeTime === 0) {
                $scope.code_show = true;
            }
        }, 1000, 120);
        dataService.callOpenApi("verification.code", {
            phone: $scope.loginPhone
        }, "register")
    };

    $scope.Login = function () {
        let params = null
        if ($scope.login === 'count') {
            if (!$scope.loginCount || !$scope.loginPassword) {
                $rootScope.cubeWarning('error', !$scope.loginCount ? '请输入账号名' : '请输入密码')
                return null
            }
            params = {
                count: $scope.loginCount,
                password: $scope.loginPassword,
                mode: 'count'
            }
        }
        if ($scope.login === 'phone') {
            if (!$scope.loginPhone || !$scope.loginCode) {
                $rootScope.cubeWarning('error', !$scope.loginPhone ? '请输入手机号' : '请输入验证码')
                return null
            }
            params = {
                phone: $scope.loginPhone,
                code: $scope.loginCode,
                mode: 'phone'
            }
        }
        $rootScope.swal.fire({
            title: '登录',
            text: '登陆中，请稍后',
            iconHtml: '<div class="iconfont icon-user" style="font-size: 40px"></div>',
            iconColor: '#3fc3ee',
            didOpen: () => {
                $rootScope.swal.showLoading()
                dataService.callOpenApi("user.login", params, "login").then(function (data) {
                    $rootScope.swal.close()
                    if (!data.success) {
                        $rootScope.cubeWarning('error', data.msg || "未知错误")
                    } else {
                        $rootScope.userId = data['cubeId'];
                        $rootScope.userImage = "http://47.119.151.14:3001/user/image/" + $rootScope.userId + "/" + data["image"];
                        $rootScope.login = true;
                        $scope.setLoginStartTime(data)
                        $rootScope.cubeWarning('success', "登录成功", 3000).then(function () {
                            $state.go("home", {state: 'home'});
                        })
                    }
                })
            }
        })
    };

    $scope.setLoginStartTime = function (data) {
        let date = (Date.parse(new Date())) / 1000
        localStorage.setItem("setLoginStartTime", date);
        localStorage.setItem("CubeId", data['cubeId']);
        localStorage.setItem("userName", data['userName']);
        localStorage.setItem("userImage", data['image']);
    };

    $scope.passwordForget = function () {
        let phone;
        let passWord;
        let passRepeat;
        let code;
        $rootScope.swal.fire({
            title: '密码修改',
            confirmButtonText: '修改',
            denyButtonText: "验证码获取",
            showDenyButton: true,
            showCancelButton: true,
            allowOutsideClick: false,
            footer: '<b></b>',
            iconHtml: '<div class="iconfont icon-lock" style="font-size: 30px"></div>',
            iconColor: '#3fc3ee',
            html:
                '1、输入手机号 2、修改与确认密码 3、输入验证码' +
                '<input id="swal-input1" class="swal2-input" placeholder="请输入手机号">' +
                '<input id="swal-input2" class="swal2-input" placeholder="请输入新密码">' +
                '<input id="swal-input3" class="swal2-input" placeholder="请确认新密码">' +
                '<input id="swal-input4" class="swal2-input" placeholder="请输入验证码">',
            didOpen: function () {
                phone = document.getElementById('swal-input1');
                passWord = document.getElementById('swal-input2');
                passRepeat = document.getElementById('swal-input3');
                code = document.getElementById('swal-input4');
            },
            preConfirm: function () {
                if (!phone.value) {
                    $rootScope.swal.showValidationMessage(
                        "手机号不能为空"
                    )
                    return false
                }
                if (!passWord.value) {
                    $rootScope.swal.showValidationMessage(
                        "密码不能为空"
                    )
                    return false
                }
                if (!passRepeat.value) {
                    $rootScope.swal.showValidationMessage(
                        "请再次确认新密码"
                    )
                    return false
                }
                if (!code.value) {
                    $rootScope.swal.showValidationMessage(
                        "请输入验证码"
                    )
                    return false
                }
                if (passWord.value !== passRepeat.value) {
                    $rootScope.swal.showValidationMessage(
                        "两次密码输入不一致"
                    )
                    return false
                }
                return dataService.callOpenApi("password.change", {
                    "phone": phone.value,
                    "password": passWord.value,
                    "code": code.value
                }, "user").then(function (data) {
                    if (!data.success) {
                        $rootScope.swal.showValidationMessage(
                            data.msg
                        )
                    } else {
                        $scope.swal.fire({
                            icon: 'success',
                            title: '密码修改成功',
                            text: '请重新登录',
                            showConfirmButton: false,
                            showCancelButton: false,
                            timer: 2000
                        });
                    }
                })
            },
            preDeny: function () {
                if ($scope.time !== undefined && $scope.time !== 0) {
                    $rootScope.swal.showValidationMessage(
                        "请120秒后再试"
                    )
                    return false
                }
                if (!phone.value) {
                    $rootScope.swal.showValidationMessage(
                        "手机号不能为空"
                    )
                    return false
                }
                $scope.time = 120;
                const content = $rootScope.swal.getFooter();
                if (content) {
                    const b = content.querySelector('b')
                    b.textContent = '验证码已发送，剩余时间：120 秒'
                    if (b) {
                        $interval(function () {
                            $scope.time--;
                            b.textContent = '验证码已发送，剩余时间：' + $scope.time + ' 秒'
                            if ($scope.time === 0) {
                                b.textContent = ''
                            }
                        }, 1000, 120);
                    }
                }
                dataService.callOpenApi("verification.code", {
                    phone: phone.value,
                }, "user")
                return false
            },
        })
    }
}])