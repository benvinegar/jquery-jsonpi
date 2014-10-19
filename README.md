jquery-jsonpi
=============

jQuery plugin that enables the 'jsonpi' dataType parameter for $.ajax.


What the hell is JSONPI?
-----------------------

A pattern for making AJAX-like requests across subdomains. Since browsers block XmlHttpRequest across 
subdomains (because they have different Origins), JSONPI is a workaround that uses iframes, forms, and 
```document.domain``` to achieve the same effect. Unlike JSONP, JSONPI permits the use of HTTP POSTs. 
See Usage for more information.

Usage / How it works
--------------------

To initiate a JSONPI request:

```javascript
$.ajax({
    url: 'http://api.example.com/widgets/create.jsonpi',
    type: 'POST',
    dataType: 'jsonpi',
    params: { 'name': "Cogley's Cogs" }
});
```

This will have the effect of generating the following form and iframe DOM elements:

```html
<iframe style="display:none" name="jQuery_iframe_1234567890">

<form action="http://api.example.com/widgets/create.jsonpi?callback=jQuery_1234567890"
    method="POST" target="jQuery_iframe_1234567890">
    <input type="hidden" name="name" value="Cogley's Cogs"/>
</form>
```

Notice that the form element targets the iframe. The form will be submitted, and the response
loaded inside the iframe.

The server should identify that a JSONPI is being requested, and generate the following response, 
which is loaded inside the iframe:

```html
<!DOCTYPE html>
<html>
    <head>
        <script>document.domain = 'example.com';</script>
    </head>
    <body>
        <script>
            window.parent.jQuery_1234567890({ 'id': '1337' });
        </script>
    </body>
</html>
```
If the parent document has the same ```document.domain```, the iframe can execute the stored callback on the parent's window object.


### Requirements


The requesting page must have the same document.domain declaration in its ```<head>```.

### Caveats

* Can cause "click" sound effect in older browsers (IE)
* Can cause address bar loading animation in some browsers
* This will create an iframe per-request; [they're not cheap](http://www.stevesouders.com/blog/2009/06/03/using-iframes-sparingly/)


Demo
----

This repository includes a NodeJS server that demonstrates jquery-jsonpi in action.

```
$ cd jquery-jsonpi
$ npm install
$ node server
```

Then visit [http://localhost:3000](http://localhost:3000) and open your browser's developer tools to see what's going on.

Should you actually use this?
-----------------------------

*Probably not*. Almost everyone is better off using [CORS](http://www.html5rocks.com/en/tutorials/cors/), or if browser support is a concern, the [XDomain](https://github.com/jpillora/xdomain) library.

The "JSONPI" pattern was devised during an age when CORS was just a twinkle in spec implementers eyes. Today, it's not much more than a "gee whiz neato" project that can teach you some fun things about `document.domain` and iframes.

Authors
-------

Ben Vinegar ([@bentlegen](http://twitter.com/bentlegen))