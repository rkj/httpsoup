var sys = require("sys");
var http = require('http');

var server = function() {
  var storage = {};
  function get() {
    var obj = storage[this.url];
    var props = [];
    for (var key in obj) { props.push(key); }
    return [200, props];
  };
  function post(body) {
    var a = body.split(/\s*,\s*/);
    var obj = storage[this.url];
    if (obj == null) {
      return [404, null];
    }
    var prop = obj[a[0]];
    if (typeof(prop) == "function") {
      var args = eval('[' + a.slice(1) + ']');
      return [200, prop.apply(obj, args)];
    } else {
      return [200, prop];
    }
  };
  function put(body) {
    process.compile("var tmp = " + body, null);
    storage[this.url] = tmp;
    return [200, null];
  }
  function deleteMethod() {
    delete storage[this.url];
    return [200, null];
  };
  return {
    "GET": get,
    "DELETE": deleteMethod,
    "POST": post,
    "PUT": put,
    "unknown": function(body) {
      return [400, "WTF is " + this.method];
    }
  };
}();

http.createServer(function (req, res) {
  req.setBodyEncoding('utf8');
  var body = [];
  req.addListener("body", function(chunk) {
    body.push(chunk);
  });
  req.addListener("complete", function() {
    var method = server[req.method] || server.unknown;
    body = body.join("");
    var ret = method.call(req, body);
    res.sendHeader(ret[0], {'Content-Type': 'text/plain'});
    if (ret[1] != null) {
      res.sendBody(ret[1].toString(), "utf8");
    }
    res.finish();
  });
}).listen(8000);
sys.puts('Server running at http://127.0.0.1:8000/');
