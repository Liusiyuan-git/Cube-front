import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

app.controller("messageCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
    };

    $scope.menuSelect = function (key) {
        $scope.messageMenu.forEach(function (item) {
            if (item.key === key) {
                $scope.currentMessageMenu = item;
                item.func()
            }
            item.select = item.key === key
        })
    };

    $scope.userMessageGet = function (page = 1) {
        if (!$scope.loginStatusCheck()) {
            return null
        }
        dataService.callOpenApi('user.message.get', {
            id: $rootScope.userId,
            page: page
        }, 'private').then(function (data) {
            if (!data.success) {
                $rootScope.cubeWarning('error', data.msg || '未知錯誤')
            } else {
                $scope.userMessageData = data.content
                $scope.current_page = page;
                $scope.pageCreateMessage(data);
                $scope.page_created = true;
            }
        })
    };

    $scope.pageCreateMessage = function (data) {
        $("#PageCountmessage").val(data.length);
        $("#PageSizemessage").val(10);
        if (!$scope.page_created) {
            $rootScope.loadpage(function (num, type) {
                if (num !== $scope.current_page) {
                    $scope.profileTalkGet(num);
                }
            }, "message")
        }
    };

    $scope.messageMenu = [{
        key: "message",
        name: "消息",
        func: $scope.userMessageGet,
        select: true
    }, {
        key: "blog",
        name: "文章",
        select: false
    }, {
        key: "talk",
        name: "说说",
        select: false
    }]
}])