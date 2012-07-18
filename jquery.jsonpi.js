/**
 * jquery.jsonpi.js
 * JSONPI 'ajax' transport implementation for jQuery.
 * https://github.com/adriengibrat/jquery-jsonpi
 * require jQuery 1.5 +
 */
( function ( $, undefined ) {
	// Location & domain utilities
	// Extract url parts i.e. protocol, user, password, domain, port, path, query & hash (use current location if no url given)
	$.location = $.extend( function ( url ) {
		if ( ! url )
			url = $.location.href;
		if ( $.location._cache[ url ] )
			return $.location._cache[ url ];
		 var parts = /^(?:([\w\+\.\-]+):)?(?:\/\/(?:([^:@]+)(?::([^@]+))?@)?([^\/?&#:]*)(?::(\d+))?)?(\/[^?&#]*)?((?:\?|&)[^#]*)?(#.*)?$/.exec( url.toLowerCase() ) || [] ;
		 if ( ! parts[ 1 ] )
			parts[ 1 ] = $.location().protocol;
		 return $.location._cache[ url ] = {
			protocol   : parts[ 1 ]
			, user     : parts[ 2 ]
			, password : parts[ 3 ]
			, domain   : parts[ 4 ]
			, port     : parseInt( parts[ 5 ], 10 ) || $.location.ports[ parts[ 1 ] ]
			, path     : parts[ 6 ]
			, query    : parts[ 7 ]
			, hash     : parts[ 8 ]
		 };
	}
	, {
		// Cache urls parts
		_cache        : {}
		// Store document location
		, href        : ( function () {
			// IE may throw an exception when accessing field from window.location if document.domain has been set
			try {
				return window.location.href;
			} catch( e ) {
				var link = document.createElement( 'a' );
				link.href = '';
				return link.href;
			}
		} )()
		// Store domain full host name, subdomain, basedomain & tld (+ regular expression to check domain against basedomain)
		, domain      : ( function () {
			var domain;
			// IE may throw an exception when accessing field from window.location if document.domain has been set
			try {
				domain = window.location.hostname;
			} catch( e ) {
				var link = document.createElement( 'a' );
				link.href = '';
				domain = link.hostname;
			}
			// Use the browser security to find basedomain without tld list: cookies can't be set on tlds!
			var levels   = domain.split( '.' ).reverse()
				, base   = levels.shift()
				, cookie = $.expando + '_basedomain=1'
				, re;
			// Try to set cookie iterativly
			$.each( levels, function ( i, level ) {
				base             = level + '.' + base;
				document.cookie += cookie + ';domain=' + base + ';';
				// Cookie is set, we're done: remove it and stop iterating
				if( ~ document.cookie.indexOf( cookie ) )
					return ! ( document.cookie += cookie + ';domain=' + base + ';expires=Thu, 01 Jan 1970 00:00:01 GMT;' );
			} );
			// Build RegExp to check / replace base domain
			re = new RegExp( '^(.+\\.)?' + base.split( '.' ).join( '\\.' ) + '$' );
			return {
				host   : domain
				, sub  : domain.replace( re, '$1' ) || null
				, base : base
				, tld  : base.split( '.' ).slice( 1 ).join( '.' ) || null
				, re : re
			};
		} )()
		// Store default protocols ports
		, ports       : {
			'http'    : 80
			, 'https' : 443
			, 'ssh'   : 22
			, 'ftp'   : 21
			, 'ftps'  : 99
		}
		// Is given url crossdomain with current location
		, crossdomain : function ( url ) {
			var location = $.location();
			url = $.location( url );
			return !! (
				url.protocol != location.protocol ||
				url.domain   != location.domain ||
				url.port     != location.port
			);
		}
		// Do given url share same basedomain with current location
		, basedomain  : function ( url ) {
			return $.location.domain.re.test( $.location( url ).domain );
		}
	} );
	// Fix forms enctype / encoding getter & setter in IE for jQuery < 1.7
	if ( $.support.enctype === undefined )
		if ( ! ( $.support.enctype = !! document.createElement( 'form' ).enctype ) )
			$.propFix.enctype = 'encoding';
	// Define jsonpi transport
	$.ajaxTransport( 'jsonpi', function ( options, origOptions, jqXHR ) {
			// Resolve jsonp callback name
		var jsonpCallback = $.isFunction( options.jsonpCallback ) ? options.jsonpCallback() : options.jsonpCallback
			// Backup original callback (when stored in window global scope)
			, initCallback  = window[ jsonpCallback ]
			// Set iframe & form
			, iframe, form;
		return {
			send    : function ( _, completeCallback ) {
				// Set base domain as document domain
				document.domain = $.location.domain.base;
				// Install callback
				window[ jsonpCallback ] = function ( status, statusText, data, type ) {
					var responses = { jsonpi : data };
					/*// Accept other data types than json ... jsonpi, is no more the best name...
					if ( type in $.ajaxSettings.accepts ) {
						responses = { text : data }
						options.dataTypes = [ 'text', type ];
						jqXHR.overrideMimeType( $.ajaxSettings.accepts[ type ].split( ',' )[ 0 ] );
					}
					//*/
					completeCallback( status, statusText, responses );
				};
					// Get unique name
				var name  = $.expando + '_jsonpi_' + $.now()
					// Insert callback && add X-Requested-With in url for server side processing
					, re  = /(\=)\?(&|$)|\?\?/
					, url = ( re.test( options.url ) ?
						options.url.replace( re, '$1' + jsonpCallback + '$2' ) :
						options.url + ( /\?/.test( options.url ) ? '&' : '?' ) + options.jsonp + '=' + jsonpCallback )
					 + '&X-Requested-With=Iframe';
				// Setup iframe
				iframe = $( '<iframe>', {
						name  : name
						, src : 'javascript:false;'
					} )
					.appendTo( 'head' )
					// Clean up when complete
					.bind( 'load abort', function ( event ) {
return;
						// Uninstall callback
						initCallback ?
							window[ jsonpCallback ] = initCallback :
							delete window[ jsonpCallback ];
						// Remove & dereference form
						form && form.remove() && delete form;
						// "setTimeout" avoid canceled state in Chrome Network debugger (easier to debug)
						iframe && setTimeout( function () { iframe.unbind().attr( 'src', 'javascript:false;' ).remove() && delete iframe; }, 10 );
						if ( event.type == 'load' ) // If not resolved now, the callback wasn't called.
							! jqXHR.isResolved() && completeCallback( 0, 'no response' );
					} );
				// Don't need a form if it's a simple GET
				if ( options.type.toUpperCase() == 'GET' )
					return iframe.attr( 'src', url );
				// Setup form
				form = $( '<form>', {
						method   : options.type
						, action : url
						, target : name
						, style  : 'display:none;'
					} )
					.appendTo( 'body' );
//console.log( options.data );
//@todo: - send files!!!
// origOptions.data is form
				// Fill form with user data
				$.each( origOptions.data, function ( name, value ) {
					if ( value && ( value.nodeName || value instanceof $ ) )
						$( value ).filter( '[name]' )
						.clone().appendTo( form ).is( ':file' ) &&
						form.attr( 'enctype', 'multipart/form-data' );
					else
						$( '<input>' )
							.attr( {
								type	: 'hidden'
								, name  : name
								, value : value
							} )
							.appendTo( form );
				} );
				// Submit
				form.submit();
			}
			, abort : function () {
				iframe && iframe.trigger( 'abort' );
			}
		};
	} );
} )( jQuery) ;