import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"

app.controller("talkingCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
        $scope.talkEditorInit()
        // $scope.contentDataGet()
    };

    $scope.menuSelect = function (key) {
        $scope.talkingMenu.forEach(function (item) {
            item.select = item.key === key
        })
    };

    $scope.talkEditorInit = function () {
        $scope.talkEditor = new E('#talk-toolbar', '#talk-text');
        $scope.talkEditor.config.height = 1200;
        $scope.talkEditor.config.menus = [
            'emoticon'
        ]
        $scope.talkEditor.create();
    };

    $scope.talkSend = function () {
        let text = $scope.talkEditor.txt.text()
        if (text === '') {
            $rootScope.cubeWarning('warning', '内容不能为空')
            return null
        }
        if (!$rootScope.userId) {
            $rootScope.cubeWarning('error', '请先登录')
            return null
        }
        dataService.callOpenApi('send.talk', {
            cubeid: $rootScope.userId,
            text: text
        }, 'private').then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning('success', '发布成功')
            } else {
                $rootScope.cubeWarning('error', data.msg || '发布出错')
            }

        })
    };

    $scope.talkingMenu = [{
        key: "new",
        name: "动态",
        select: true
    }, {
        key: "care",
        name: "关注",
        select: false
    }, {
        key: "talk",
        name: "树洞",
        select: false
    }]
}])