let app = require("../../app.js")
import "../style/style.scss"

app.controller("registerCtrl", ['$rootScope', '$scope', '$interval', 'dataService', '$timeout', '$state', function ($rootScope, $scope, $interval, dataService, $timeout, $state) {
    $scope.init = function () {
        $scope.initparams()
    }

    $scope.verification = function () {
        $scope.send = true;
        $scope.time = 120;
        $interval(function () {
            $scope.time--;
            if ($scope.time === 0) {
                $scope.send = false
            }
        }, 1000, 120);
        dataService.callOpenApi("verification.code", {
            phone: $scope.params.phone,
        }, "user")
    }

    $scope.initparams = function () {
        $scope.send = false;
        $scope.params = {
            email: null,
            password: null,
            phone: null,
            code: null
        }
        $scope.wrongMessage = {
            email: {check: true, msg: "请输入正确的邮箱地址"},
            password_empty: {check: false, msg: "密码不能为空"},
            password_wrong: {check: false, msg: "两次输入密码不一致"},
            phone: {check: true, msg: "请输入正确的手机号"},
            code: {check: true, msg: "验证码不能为空"}
        }
    }

    $scope.emailCount = function (event) {
        let re = /^([a-zA-Z0-9]+[-_\.]?)+@[a-zA-Z0-9]+\.[a-z]+$/;
        let email = event.target.value
        if (re.test(email)) {
            $scope.params.email = email;
            $scope.wrongMessage.email.check = true
        } else {
            $scope.params.email = null;
            $scope.wrongMessage.email.check = false
        }
    }

    $scope.passwordInput = function (event) {
        $scope.password_input = event.target.value
        $scope.wrongMessage.password_empty.check = false
        if ($scope.password_repeat) {
            $scope.passwordCheck($scope.password_repeat)
        }
    }

    $scope.passwordRepeat = function (event) {
        $scope.password_repeat = event.target.value;
        $scope.passwordCheck($scope.password_repeat)
    }


    $scope.passwordCheck = function (value) {
        if (!$scope.password_input) {
            $scope.wrongMessage.password_empty.check = true
            return null
        }
        if ($scope.password_input !== value) {
            $scope.wrongMessage.password_wrong.check = true
            $scope.params.password = null
        } else {
            $scope.wrongMessage.password_wrong.check = false
            $scope.params.password = value
        }
    }

    $scope.phoneNumber = function (event) {
        let number = event.target.value;
        let reg = /^1[0-9]{10}$/;
        if (reg.test(number)) {
            $scope.params.phone = number;
            $scope.wrongMessage.phone.check = true
        } else {
            $scope.params.phone = null;
            $scope.wrongMessage.phone.check = false
        }
    }

    $scope.codeInput = function (event) {
        let code = event.target.value
        if (code) {
            $scope.wrongMessage.code.check = true
            $scope.params.code = code
        } else {
            $scope.wrongMessage.code.check = false
            $scope.params.code = null
        }
    }

    $scope.register = function () {
        if ($scope.paramsCheck()) {
            $rootScope.swal.fire(
                {
                    icon: "info",
                    title: "数据提交中...",
                    showConfirmButton: false,
                    showCancelButton: false,
                    onBeforeOpen: () => {
                        $rootScope.swal.showLoading();
                        dataService.callOpenApi("user.register", $scope.params,"register").then(function (data) {
                            $rootScope.swal.close()
                            $scope.swal.fire({
                                icon: data.success ? 'success' : 'error',
                                title: data.success ? '注册成功' : '注册失败',
                                text: data.success ? '正在跳转...' : data.msg,
                                showConfirmButton: false,
                                showCancelButton: false,
                                timer: 2000
                            });
                            if (data.success) {
                                $timeout(function () {
                                    $state.go("login")
                                }, 2000)
                            }
                        })
                    }
                }
            )
        } else {
            $rootScope.swal.fire({
                icon: 'error',
                title: '错误',
                text: '表单信息错误，请仔细检查!',
                showConfirmButton: false,
                showCancelButton: false,
                timer: 2000
            })
        }
    }

    $scope.paramsCheck = function () {
        let result = true
        Object.keys($scope.params).forEach(function (key) {
            if (!$scope.params[key]) {
                result = false
            }
        })
        return result
    };
}])