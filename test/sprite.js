/**
 * Created by king-king on 2017/2/5.
 */

var sprite = require( '../index' ).sprite;

sprite( {
	cssSrc : 'css/base1/base.css' , // important
	hash : true
} , function ( err ) {
	err && console.log( err );
} );