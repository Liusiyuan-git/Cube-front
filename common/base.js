const angular = require("angular");
const app = angular.module("tool.common");
window.moment = require("moment");
const moduleJsonLoaders = require.context("./", true, /moudle\.json$/);
moduleJsonLoaders.keys().forEach((key) => {
    app.config(["$stateProvider", moduleJsonLoaders(key)])
});
app.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
}])

app.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true)
}])
export default app;