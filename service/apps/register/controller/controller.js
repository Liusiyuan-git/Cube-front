let app = require("../../app.js")
import "../style/style.scss"

app.controller("registerCtrl", ['$rootScope', '$scope', '$interval', 'dataService', '$timeout', '$state', function ($rootScope, $scope, $interval, dataService, $timeout, $state) {
    $scope.init = function () {
        $scope.initparams()
    };

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
            mode: "register"
        }, "user").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("info", $rootScope.PhoneMessage[JSON.parse(data.content).Response.SendStatusSet[0].Code] || "验证码已发送成功", 10000)
            } else {
                $rootScope.cubeWarning("error", "未知错误")
            }
        })
    };

    $scope.initparams = function () {
        $scope.send = false;
        $scope.eye = true;
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
    };

    $scope.eyeClick = function () {
        let input1 = document.getElementById("input-password1");
        let input2 = document.getElementById("input-password2");
        if (input1.type === 'password') {
            input1.type = 'text'
        } else {
            input1.type = 'password'
        }
        if (input2.type === 'password') {
            input2.type = 'text'
        } else {
            input2.type = 'password'
        }
        $scope.eye = !$scope.eye
    };

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
    };

    $scope.passwordInput = function (event) {
        $scope.password_input = event.target.value
        $scope.wrongMessage.password_empty.check = false
        if ($scope.password_repeat) {
            $scope.passwordCheck($scope.password_repeat)
        }
    };

    $scope.passwordRepeat = function (event) {
        $scope.password_repeat = event.target.value;
        $scope.passwordCheck($scope.password_repeat)
    };


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
    };

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
    };

    $scope.codeInput = function (event) {
        let code = event.target.value
        if (code) {
            $scope.wrongMessage.code.check = true
            $scope.params.code = code
        } else {
            $scope.wrongMessage.code.check = false
            $scope.params.code = null
        }
    };

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
                        dataService.callOpenApi("user.register", $scope.params, "register").then(function (data) {
                            $rootScope.swal.close()
                            $rootScope.cubeWarning(data.success ? 'success' : 'error', data.success ? '注册成功' : '注册失败')
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
    };

    $scope.paramsCheck = function () {
        let result = true
        Object.keys($scope.params).forEach(function (key) {
            if (!$scope.params[key]) {
                result = false
            }
        })
        return result
    };

    $scope.cubeLogin = function () {
        $state.go("login", {state: "login"});
    };
}])