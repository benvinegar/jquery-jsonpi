<?php

/*  Dumb example: respond playload sent in request, supporting various transport (jsonpi, jsonp, xhr) */

// Get first "basedomain" with DNS resolution (avoid to maintain a Second level ccTLDs list)
// Please set your DNS for basedomain !
function basedomain ( $domain = null ) {
	$domain = strtolower( is_null( $domain ) ? $_SERVER[ 'SERVER_NAME' ] : (string) $domain );
	$parts  = array_reverse( explode( '.', $domain ) );
	$base   = array_shift( $parts );
	// try basedomain iteratively
	foreach ( $parts as $part ) {
		// when basedomain resolves, it's done (test first for local)
		if ( $base != gethostbyname( $base ) )
			return $base;
		$base = $part . '.' . $base;
	}
	return false;
}

// Encode array as XML
function xml_encode ( $data, $rootNodeName = 'data', $xml = null ) {
	if ( ini_get( 'zend.ze1_compatibility_mode' ) ) // turn off compatibility mode else simple xml throws shit.
		ini_set ( 'zend.ze1_compatibility_mode', 0 );
	if ( ! $xml )
		$xml = simplexml_load_string( '<?xml version="1.0" encoding="utf-8"?><' . $rootNodeName . '/>' );
	foreach( $data as $key => $value ) {
		$key = is_numeric( $key ) ? 'node' . $key : preg_replace( '/\W/i', '', $key );
		is_array( $value ) ?
			xml_encode( $value, $rootNodeName, $xml->addChild( $key ) ) :
			$xml->addChild( $key, htmlentities( $value ) );
	}
	return "'" . str_replace( PHP_EOL, '', $xml->asXML() ) . "'";
}

foreach( (array) $_FILES as $key => $file )
	$_REQUEST[ $key ] = $file[ 'name' ];

// Jsonpi Transport
if ( isset( $_GET[ 'X-Requested-With' ] ) && $_GET[ 'X-Requested-With' ] == 'Iframe' ) :
	if ( ! isset ( $_GET[ 'callback' ] ) || ! isset( $_SERVER[ 'HTTP_REFERER' ] ) ) {
		header( 'HTTP/1.0 400 Bad Request', true, 400 );
		exit;
	}
	$callback = $_GET[ 'callback' ];
	unset( $_REQUEST[ 'callback' ], $_REQUEST[ 'X-Requested-With' ] );
	$basedomain = basedomain();
	header( 'Content-type: text/html' );
?>
<script type="text/javascript">
<?php if ( $basedomain ) echo 'document.domain = "', $basedomain, '";',PHP_EOL; ?>
window.parent.<?php echo $callback; ?>( 200, 'ok', <?php echo json_encode( $_REQUEST ); ?> );
//window.parent.<?php echo $callback; ?>( 200, 'ok', <?php echo xml_encode( $_REQUEST ); ?>, 'xml' ); // response in other format than json is possible...
</script>
<?php
// Jsonp Transport
elseif ( isset( $_REQUEST[ 'callback' ] ) ) :
	$callback = $_GET[ 'callback' ];
	unset( $_REQUEST[ 'callback' ], $_REQUEST[ '_' ] );
	header( 'Content-type: application/javascript' );
	echo $callback, '(', json_encode( $_REQUEST ), ');';
// Json Transport
else :
	// Basic cors support, doors are wide open
	if ( isset( $_SERVER[ 'HTTP_ORIGIN' ] ) ) {
		header( 'Access-Control-Allow-Origin: ' . $_SERVER[ 'HTTP_ORIGIN' ] );
		header( 'Access-Control-Allow-Credentials: true' );
	}
	header( 'Content-type: application/json' );
	echo json_encode( $_REQUEST );
endif;