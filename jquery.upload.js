/**
 * jquery.upload.js
 * Allow to pass DOM elements as data to Ajax.
 * https://github.com/adriengibrat/jquery-jsonpi
 * require jQuery 1.6 +
 */
( function ( $, undefined ) {
	// Check & save FormData & xhr2 upload support
	$.support.formdata  = $.isFunction( window.FormData );
	$.support.xhrupload = $.support.ajax && 'upload' in $.ajaxSettings.xhr();
	// Check if object is instance of list of possible constructors (space separated)
	$.instanceOf = function ( object, constructors, context ) {
		var instance = false;
		// window is default context
		context = context || window;
		$.each( constructors.split( ' ' ), function ( i, constructor ) {
			// Constructor doesn't exist in context, skip
			if ( ! $.isFunction( context[ constructor ] ) )
				return;
			// Instance of object found, stop iterating
			if ( object instanceof context[ constructor ] )
				return ! ( instance = constructor );
		} );
		// Return name of constructor or false
		return instance;
	};
	// Automatic transport selection & upload settings
	$.ajaxPrefilter( '+', function( options, origOptions, jqXHR ) {
//console.log(options);
		// Don't mess with user choice
		if ( origOptions.dataType )
			return;
		// We can't use xhr
		if ( options.crossDomain && ! $.support.cors )
			return options.type.toUpperCase() == 'POST' ? 'jsonpi' : 'jsonp';
		// Check if data is or contains DOM elements to upload
		//if ( no upload )
		//	return;
		// Force POST to upload
		options.type = 'POST';
		// No upload support, fallback to iframe transport
		if ( ! $.support.formdata || ! $.support.xhrupload )
			return 'jsonpi';
		if ( ! origOptions.data )
			return;
		// Prepare data to upload
		$.extend( options, {
			data          : ( function () {
				// Already FormData, Blob, File or ArrayBuffer, skip
				if ( $.instanceOf( origOptions.data, 'FormData Blob File ArrayBuffer'  ) )
					return origOptions.data;
				// If form element or jquery selection containing form, convert (first form) to FormData
				if ( $.nodeName( origOptions.data, 'form' ) || origOptions.data instanceof $ && origOptions.data.is( 'form' ) )
					return new FormData( $( origOptions.data ).get( 0 ) );
				// Iterate data to populate FormData: files & inputs are added like with form submission,
				// other dom elements are discarded, everything else is converted to string.
				var data = new FormData();
				$.each( origOptions.data, function ( key, item ) {
					if ( item && ( item.nodeName || item instanceof $ ) )
						return $( item ).each( function () {
							var element = $( this )
								, name  = element.attr( 'name' );
							if ( ! name || element.is( ':radio,:checkbox' ) && ! element.is( ':checked' ) )
								return;
							element.is( ':file' ) ?
								$.each( this.files, function () {
									data.append( name, this );
								} ) :
								data.append( name, element.val() );
						} );
					data.append( key, item );
				} );
				return data;
			} ) ()
			//, cache       : false
			, processData : false
			, contentType : false
		} );
	} );
} )( jQuery) ;