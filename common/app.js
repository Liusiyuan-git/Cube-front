const angular = require("angular")
const angularAnimate = require("angular-animate")
require("angular-file-upload")
require("moment").locale("zh-cn")
require("angular-moment")
const app = angular.module("tool.common",[angularAnimate, "angularFileUpload", "angularMoment"])
.constant("monet", require("moment"));
require("./common.js");
export default app.name;