import "es6-promise/auto"

import angular from "angular"
import uiRouter from "angular-ui-router"
import ocLazyLoad from "oclazyload"
import ngFileUpload from "ng-file-upload"
import toolCommon from "../common/app"

window.app = angular.module("myApp", [uiRouter, ocLazyLoad, toolCommon, ngFileUpload]);
let module_json_loaders = require.context("./", true, /module\.json$/)
module_json_loaders.keys().forEach(function (_key){
    window.app.config(["$stateProvider", module_json_loaders(_key)]);
})


// angular.bootstrap(document, ["myApp"]);