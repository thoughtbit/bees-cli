"use strict";

var _users = require("./services/users");

(0, _users.query)().then(function (data) {
  console.log("data: ", data);
});

//# sourceMappingURL=index-compiled.js.map