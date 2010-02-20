var sys = require('sys');
var HTTPObject = require('./httpobject');

var obj = function() {
  function mult(a, b) {
    return a * b;
  }
  
  return {
    a: 10,
    b: 20,
    c: mult(3, 4),
    mult: mult
  };
}();

var x_url = "http://localhost:8000/x";
var y_url = "http://localhost:8000/y";
HTTPObject.push(x_url, "{a: 3,b: function(c) {return c + this.a;}}");
HTTPObject.push(y_url, obj);

var x = HTTPObject.get(x_url);
sys.puts(x.a());
sys.puts(x.b(4));
var y = new HTTPObject.get(y_url);
sys.puts(y.a());
sys.puts(y.b());
sys.puts(y.c());
sys.puts(y.mult(1, 2));
sys.puts(y.mult(4, 2));
sys.puts(y.mult(2, 2));
