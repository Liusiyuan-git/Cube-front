import app from "../base"
import Swal from 'sweetalert2/src/sweetalert2.js'
// import 'sweetalert2/src/sweetalert2.scss'
//import Swal from 'sweetalert2'
import "../styles/common.color.scss"
import "../../resources/icon/iconfont.css"
import "../styles/common.scss"
import "../styles/common.alert.scss"
import Cookies from 'js-cookie'

app.controller("PublicController", ["$rootScope", "$scope", "$state", '$q', 'dataService', function ($rootScope, $scope, $state, $q, dataService) {
    $scope.init = function () {
        $scope.initParams();
        $state.go("login")
    };

    $scope.initParams = function () {
        $rootScope.swal = Swal;
        $rootScope.userId = null;
        $rootScope.login = false;
        $scope.wait = false;
    };

    $rootScope.showWaiting = function () {
        $scope.wait = true
    };

    $rootScope.hideWaiting = function () {
        $scope.wait = false
    };

    $rootScope.loginStatusCheck = function () {
        let defer = $q.defer()
        dataService.callOpenApi("login.status", {}, "login").then(function (data) {
            defer.resolve(data)
        })
        return defer.promise;
    }

    $rootScope.cubeWarning = function (icon, text, timer = 2000) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: timer,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        return Toast.fire({
            icon: icon,
            title: text
        })
    };

    $rootScope.cubeLoading = function (text) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            willOpen: function () {
                Swal.showLoading()
            },
            didOpen: (toast) => {
                toast.style["flex-direction"] = "row-reverse"
                toast.style["justify-content"] = "flex-end"
                toast.children[1]["style"]["display"] = "none"
                toast.children[2]["style"]["flex"] = "unset"
                toast.children[2]["children"][3]["style"]["width"] = "2em"
                toast.children[2]["children"][3]["style"]["height"] = "2em"
                toast.children[2]["children"][3]["style"]["margin"] = "0 0.5em"
            }
        })
        return Toast.fire({
            icon: Swal.showLoading(),
            title: text
        })
    };

    $rootScope.confirm = function (icon, title, text, yes, no = "取消") {
        return Swal.fire({
            icon: icon,
            title: title,
            text: text,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: yes,
            denyButtonText: no,
        })
    };

}])