httpsoup
========

Most useless distributed environment :-).

Introduction
------------

Alan Kay speeking at OOPSLA '98 encouraged the idea that URLs can be pointers to objects, and HTTP can be used as method call semantic. After listening to it I wanted to try implementing something simple on top of recently popular technologies - JavaScipt and Node.js. The results are not secure, fast, or even remotely sane, but it was quite interesting to write and RMI in not so much lines of code :-).

Example
-------

To run the server:

    $ node server.js

And the client:

    $ node client.js

The client is really simple:

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

Copyright (c) 2009 rkj. See LICENSE for details.
