import app from "../base"
import Swal from 'sweetalert2/src/sweetalert2.js'
import "../component/page/jquery-1.7.2.min"
import "../component/page/jqPaginator.min"
import "../component/page/myPage.css"
import "../component/page/bootstrap.min.css"
import "../styles/common.color.scss"
import "../../resources/icon/iconfont.css"
import "../styles/common.scss"
import "../styles/common.alert.scss"
import "../styles/common.coco.scss"
import "./stomp"
import coco from 'coco-modal'

app.controller("PublicController", ["$rootScope", "$scope", "$state", '$q', '$location', 'dataService', function ($rootScope, $scope, $state, $q, $location, dataService) {
    $scope.init = function () {
        $scope.initParams();
        $state.go("home")
    };

    $scope.initParams = function () {
        $rootScope.swal = Swal;
        $rootScope.userId = null;
        $rootScope.login = false;
        $scope.wait = false;
        $rootScope.coco = coco;
        // $rootScope.fileServer = "http://101.43.7.161:3001"
        // $rootScope.fileServer = "http://43.155.100.23:3001"
        $rootScope.fileServer = "https://www.cube.fan:3001"
        $rootScope.typeLibrary = {
            python: "Python",
            go: "Go",
            java: "Java",
            javaScript: "JavaScript",
            "c++": "C++",
            c: "C",
            redis: "Redis",
            rabbitmq: "Rabbitmq",
            docker: "Docker",
            kubernetes: "kubernetes",
            microServices: "微服务",
            mysql: "Mysql",
            live: "生活"
        };
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

    $rootScope.loadpage = function (f, index = "", currentPage = 1) {
        let myPageCount = parseInt($("#PageCount" + index).val());
        let myPageSize = parseInt($("#PageSize" + index).val());
        let countindex = myPageCount % myPageSize > 0 ? (myPageCount / myPageSize) + 1 : (myPageCount / myPageSize);
        $("#countindex" + index).val(countindex);
        $.jqPaginator('#pagination' + index, {
            totalPages: parseInt($("#countindex" + index).val()),
            visiblePages: parseInt($("#visiblePages" + index).val()),
            currentPage: currentPage,
            first: '<li class="first"><a href="javascript:;">首页</a></li>',
            prev: '<li class="prev"><a href="javascript:;"><i class="arrow arrow2"></i>上一页</a></li>',
            next: '<li class="next"><a href="javascript:;">下一页<i class="arrow arrow3"></i></a></li>',
            last: '<li class="last"><a href="javascript:;">末页</a></li>',
            page: '<li class="page"><a href="javascript:;">{{page}}</a></li>',
            onPageChange: f
        });
    };

    $rootScope.PhoneMessage = {
        "LimitExceeded.PhoneNumberOneHourLimit": "该手机号1小时内下发短信条数超过上限",
        "LimitExceeded.PhoneNumberDailyLimit": "该手机号日下发短信条数超过设定的上限",
        "LimitExceeded.PhoneNumberThirtySecondLimit": "该手机号30秒内下发短信条数超过设定的上限"
    }

}])