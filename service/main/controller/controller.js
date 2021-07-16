let app = require("../app")
import "../style/style.scss"

app.controller("mainCtrl", ["$rootScope", "$scope", "$state", "$timeout", "dataService", function ($rootScope, $scope, $state, $timeout, dataService) {
    $scope.init = function () {
        $scope.user_menu_show = false;
        $rootScope.userId = "";
        if ($state.params.state) {
            $scope.select($state.params.state)
        }
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
        })
    };

    $scope.userLogin = function () {
        $state.go("login")
    };

    $scope.Home = function () {
        $state.go("home", {state: "home"})
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
        key: "home_page",
        name: "首页",
        state: "home",
        select: true
    }, {
        id: 1,
        key: "talking",
        name: "随便说说",
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
        key: "characteristic",
        name: "站长私房菜",
        state: "characteristic",
        select: false
    }, {
        id: 4,
        key: "about",
        name: "关于Cube",
        state: "about",
        select: false
    }];

    $scope.user_menu_list = [{
        id: 0,
        key: "profile",
        name: "我的主页",
        icon: "icon-user"
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