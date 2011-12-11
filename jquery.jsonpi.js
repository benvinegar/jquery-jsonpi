/**
 * jquery.jsonpi.js
 *
 * JSONPI "ajax" transport implementation for jQuery.
 *
 * http://github.com/benvinegar/jquery-jsonpi
 */

(function($) {
    $.ajaxTransport('jsonpi', function(opts, originalOptions, jqXHR) {
        var jsonpCallback = opts.jsonpCallback = 
                jQuery.isFunction(opts.jsonpCallback) ? opts.jsonpCallback() : opts.jsonpCallback,
            previous = window[jsonpCallback],
            replace = "$1" + jsonpCallback + "$2",
            url = opts.url;


        if (opts.type == 'GET')
            opts.params[opts.jsonp] = jsonpCallback;
        else
            url += (/\?/.test( url ) ? "&" : "?") + opts.jsonp + "=" + jsonpCallback;

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

                iframe = $('<iframe>')
                    .attr('name', name)
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
                form.appendTo('body').submit();
            },
            abort: function() {
                // TODO
            }
       };
    });
})(jQuery);