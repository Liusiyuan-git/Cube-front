import E from "wangeditor";

let app = require("../../app")
import "../style/style.scss"
import 'viewerjs/dist/viewer.css';
import Viewer from 'viewerjs';

app.controller("searchCtrl", ["$rootScope", "$scope", "$state", "$timeout", 'dataService', "$q", function ($rootScope, $scope, $state, $timeout, dataService, $q) {
    $scope.init = function () {
        $scope.initParams();
        $timeout(function () {
            let frame1 = document.getElementById("container");
            let frame2 = document.getElementById("search");
            frame1.className = "container in";
            frame2.className += " search-disappear in";
        }, 300);
    };

    $scope.searchListSelect = function (i){
        $scope.searchContent = i;
    };

    $scope.searchFocus = function (){
        $scope.searchList = JSON.parse(localStorage.getItem("search"));
        $scope.searchListShow = true;
    };

    $scope.searchBlur = function (){
        $timeout(function () {
            $scope.searchListShow = false;
        }, 80);
    };

    $scope.CubeSearch = function (content) {
        if(content === ''){
            $rootScope.cubeWarning("info","请输入搜索内容");
            return null;
        }
        let search = JSON.parse(localStorage.getItem("search"));
        if(!search){
            search = [];
            search.unshift(content)
        }else if(search.length < 10){
            if(search.indexOf(content) === -1){
                search.unshift(content);
            }
        }else{
            if(search.indexOf(content) === -1){
                search.pop();
                search.unshift(content);
            }
        }
        $scope.searchWord = true;
        localStorage.setItem("search", JSON.stringify(search));
    };

    $scope.initParams = function () {
        if ($state.params.search) {
            $scope.searchWord = $state.params.search;
            $scope.searchContent = $state.params.search;
        } else {
            $scope.searchWord = null;
        }
        $scope.searchListShow = false;
    };

    $scope.$on('$stateChangeStart', function (event, toState, toParams) {
        let frame = document.getElementById("search");
        frame.className += "container";
    });

    $scope.searchMenu = [{
        key: "blog",
        name: "文章",
        select: true
    }, {
        key: "talk",
        name: "说说",
        select: false
    }, {
        key: "user",
        name: "找人",
        select: false
    }]
}])