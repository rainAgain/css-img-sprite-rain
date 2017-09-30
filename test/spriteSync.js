/**
 * Created by king-king on 2017/2/5.
 */

var sprite = require( '../index' ).spriteSync;

sprite( {
	cssSrc : 'css/base1/base.css' , // important
	cssDesDir : 'out' ,
	imgDesDir : 'out' ,
	hash : true
} , function ( err ) {
	err && console.log( err );
} );