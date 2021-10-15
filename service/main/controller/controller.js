let app = require("../app")
import "../style/style.scss"
import "jscroll"

app.controller("mainCtrl", ["$rootScope", "$scope", "$state", "$timeout", "dataService", function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $scope.rabbitConnection();
        $scope.user_menu_show = false;
        $rootScope.userId = "";
        if ($state.params.state) {
            $scope.select($state.params.state)
        }
    };

    $scope.rabbitConnection = function () {
        console.log('starting...');
        // Stomp.js boilerplate
        var ws = new WebSocket('ws://81.68.104.55:15674/ws');
        // Init Client
        var client = Stomp.over(ws);
        // SockJS does not support heart-beat: disable heart-beats
        // client will send heartbeats every xxxms
        client.heartbeat.outgoing = 5000;
        // client does not want to receive heartbeats
        client.heartbeat.incoming = 5000;
        // Declare on_connect
        var on_connect = function (x) {
            client.subscribe("/exchange/logs", function (d) {
                // update result
                var p = JSON.parse(d.body);
                console.log(p)
                // disconnect client
                // when close the brower, it will be closed automatically too
                client.disconnect(function() {
                    console.log("See you next time!");
                });
            });
        };
        // Declare on_error
        var on_error = function () {
            console.log('error');
        };
        // Conect to RabbitMQ
        client.connect('admin', '201020120402ssS~', on_connect, on_error, '/');
    };

    $scope.selectAndGo = function (state) {
        $scope.menu_list.forEach(function (item) {
            item.select = item.state === state
        })
        $state.go(state, {state: state})
    };

    $scope.select = function (state) {
        $scope.menu_list.forEach(function (item) {
            item.select = item.state === state
        })
    }

    $scope.userMenu = function (e) {
        let element = document.getElementById("user-menu")
        if (element) {
            element.style.display = "inline";
        }
        e.stopPropagation();
    };

    document.onclick = function (e) {
        let element = document.getElementById("user-menu")
        if (element) {
            element.style.display = "none";
        }
        e.stopPropagation();
    };

    $scope.exit = function () {
        dataService.callOpenApi("count.exit", {}, "login").then(function (data) {
            if (data.success) {
                $rootScope.cubeWarning("success", "已退出，请重新登录", "5000")
                $state.go("login")
            } else {
                $rootScope.cubeWarning("error", "未知错误", "5000")
            }
            localStorage.removeItem('setLoginStartTime')
            localStorage.removeItem('CubeId')
            localStorage.removeItem("userName")
            $rootScope.userId = ""
            $rootScope.userName = ""
            $rootScope.login = false;
        })
    };

    $scope.userLogin = function () {
        $state.go("login")
    };

    $scope.Home = function () {
        $state.go("home", {state: "home"})
    };

    $scope.profile = function () {
        localStorage.setItem("profileId", $rootScope.userId);
        window.open("http://127.0.0.1:3000/#!/main/community/profile?state=profile")
    };

    $rootScope.$on('$stateChangeSuccess', function () {
        $scope.select($state.params.state)
    });

    $scope.$on("mainMenu", function () {
        if ($state.params.state) {
            $scope.select($state.params.state)
        }
    })


    $scope.menu_list = [{
        id: 0,
        key: "home",
        name: "首页",
        state: "home",
        select: true
    }, {
        id: 1,
        key: "talking",
        name: "江湖",
        state: "talking",
        select: false
    }, {
        id: 2,
        key: "creation",
        name: "我要发表",
        state: "creation",
        select: false
    }, {
        id: 3,
        key: "about",
        name: "关于Cube",
        state: "about",
        select: false
    }];

    $scope.user_menu_list = [{
        id: 0,
        key: "profile",
        name: "我的主页",
        icon: "icon-user",
        func: $scope.profile
    }, {
        id: 1,
        key: "setting",
        name: "设置",
        icon: "icon-setting-fill"
    }, {
        id: 2,
        key: "exit",
        name: "退出",
        icon: "icon-poweroff",
        func: $scope.exit
    }]
}])