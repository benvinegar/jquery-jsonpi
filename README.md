jquery-jsonpi
=============

jQuery plugin that enables the 'jsonpi' dataType parameter for $.ajax.


What the hell is JSONPI
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

Requirements
------------

The requesting page must have the same document.domain declaration in its ```<head>```.

Caveats
---------

* Can cause "click" sound effect in older browsers (IE)
* Can cause address bar loading animation in some browsers

Authors
-------

Ben Vinegar ([@bentlegen](http://twitter.com/bentlegen))