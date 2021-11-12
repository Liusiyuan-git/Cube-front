let app = require("../../app")
import "../style/style.scss"


app.controller("aboutCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $timeout(function () {
            let frame = document.getElementById("container");
            frame.className = "container in";
        }, 300);
    };

    $scope.searchMenu = [{
        key: "about",
        name: "关于cube",
        func: function (){},
        select: true
    }]
}])