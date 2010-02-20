var sys = require("sys");
var http = require('http');
var URL = require('url');
var events = require("events");

var formatObject = function(obj, indent, parents, parenthesis, entryFormatter) {
  var buffer = parenthesis[0];
  var values = [];
  var x;

  var localFormatter = function(value) {
    return formatter(value, indent + ' ', parents);
  };
  for (x in obj) {
    values.push(indent + ' ' + entryFormatter(x, localFormatter));
  }
  if (values.length > 0) {
    buffer += "\n" + values.join(",\n") + "\n" + indent;
  }
  buffer += parenthesis[1];
  return buffer;
};

var formatter = function(value, indent, parents) {
  switch(typeof(value)) {
    case 'string':    return JSON.stringify(value);
    case 'number':    return '' + value;
    case 'function':  return value.toString();
    case 'boolean':   return '' + value;
    case 'undefined': return 'undefined';
    case 'object':
      if (value == null) return 'null';
      if (parents.indexOf(value) >= 0) return '[Circular]';
      parents.push(value);

      if (value instanceof Array && Object.keys(value).length === value.length) {
        return formatObject(value, indent, parents, '[]', function(x, f) {
          return f(value[x]);
        });
      } else {
        return formatObject(value, indent, parents, '{}', function(x, f) {
          var child;
          if (value.__lookupGetter__(x)) {
            if (value.__lookupSetter__(x)) {
              child = "[Getter/Setter]";
            } else {
              child = "[Getter]";
            }
          } else {
            if (value.__lookupSetter__(x)) {
              child = "[Setter]";
            } else {
              child = f(value[x]);
            }
          }
          return f(x) + ': ' + child;
        });
      }
      return buffer;
    default:
      throw('inspect unimplemented for ' + typeof(value));
  }
};

function send(client, method, path, data) {
  var headers = {};
  if (data != null) { headers["Content-Length"] = data.length; }
  var request = client.request(method, path, headers);
  if (data != null) { request.sendBody(data, "utf8"); }
  var promise = new events.Promise();
  var returnValue = null;
  promise.addCallback(function(arg) {
    returnValue = arg;
  });
  request.finish(function(response) {
    response.setBodyEncoding("utf8");
    var body = [];
    response.addListener("body", function (chunk) {
      body.push(chunk);
    });
    response.addListener("complete", function() {
      var ret = body.join("");
      promise.emitSuccess(ret);
    });
  });
  promise.wait();
  return returnValue;
}

function propertyProxy(prop, client, url) {
  return function() {
    var args = [prop];
    for (var key in arguments) {
      args.push(arguments[key]);
    }
    args = args.join(",");
    return send(client, "POST", url, args);
  };
}

exports.get = function(_url) {
  var url = URL.parse(_url);
  var client = http.createClient(url.port, url.hostname);
  var obj = {};
  var result = send(client, "GET", url.pathname, null);
  var props = result.split(/\s*,\s*/);
  for (var key in props) {
    var prop = props[key];
    obj[prop] = propertyProxy(prop, client, url.pathname);
  }
  return obj;
};
exports.push = function(_url, data) {
  var url = URL.parse(_url);
  var client = http.createClient(url.port, url.hostname);
  if (typeof(data) == 'object') {
    data = formatter(data, '', []);
  }
  send(client, "PUT", url.pathname, data);
};
