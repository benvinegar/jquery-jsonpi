/**
 * jquery.jsonpi.js
 *
 * JSONPI "ajax" transport implementation for jQuery.
 *
 * http://github.com/benvinegar/jquery-jsonpi
 */

/*global jQuery*/
/*eslint-env browser*/
/*eslint quotes:0*/
(function($) {
    'use strict';
    $.ajaxTransport('jsonpi', function(opts) {
        var jsonpCallback = opts.jsonpCallback =
                jQuery.isFunction(opts.jsonpCallback) ? opts.jsonpCallback() : opts.jsonpCallback,
            previous = window[jsonpCallback],
            url = opts.url;


        if (opts.type === 'GET') {
            opts.params[opts.jsonp] = jsonpCallback;
        } else {
            url += (/\?/.test( url ) ? "&" : "?") + opts.jsonp + "=" + jsonpCallback;
        }

        return {
            send: function(_, completeCallback) {
                var name = 'jQuery_iframe_' + jQuery.now(),
                    iframe, form;

                // Install callback
                window[jsonpCallback] = function(data) {
                    // TODO: How to handle errors? Only 200 for now
                    completeCallback(200, 'success', {
                        'jsonpi': data
                    });

                    iframe.remove();
                    form.remove();

                    window[jsonpCallback] = previous;
                };

                iframe = $('<iframe name="' + name + '">') //ie7 bug fix
                    //.attr('name', name)
                    .appendTo('head');

                form = $('<form>')
                    .attr('method', opts.type) // GET or POST
                    .attr('action', url)
                    .attr('target', name);

                $.each(opts.params, function(k, v) {
                    $('<input>')
                        .attr('type', 'hidden')
                        .attr('name', k)
                        .attr('value', v)
                        .appendTo(form);
                });
                form.appendTo('body');
                form.submit();
            },
            abort: function() {
                // TODO
            }
       };
    });
})(jQuery);
