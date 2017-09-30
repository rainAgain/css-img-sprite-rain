/**
 * Created by king-king on 2017/2/5.
 */

var sprite = require( "./lib/css-img-sprite" );
var fs = require( "fs" );
var path = require( "path" );
/**
 *  arguments:
 *      content:{buffer} css file content
 *      spriteObj:{object}
 *          spriteObj.cssSrc:{string} although you give content,we still need file name,so,give us cssSrc
 *          [spriteObj.cssDesDir]:{string} css output dir ,default:cssSrc.we do not write new css file for
 *                                                      you,you need do it yourself.we need it because we need to
 *                                                      change css background-image:url()
 *          [spriteObj.imgDesDir]:{string} image output dir,default:cssSrc
 *          [spriteObj.layout]:{string} "linear"(default)|"matrix".matrix will use bin-packing
 *          [spriteObj.hash]:{boolean} add hash flag on sprite image
 *  return:
 *      content:{buffer} new css file content
 *
 **/

module.exports.raw = sprite;

var curWorkingDir = process.cwd();
// Asynchronous-异步版
module.exports.sprite = function ( spriteObj , callback ) {
	fs.readFile( spriteObj.cssSrc , function ( err , buffer ) {
		if ( err ) {
			callback( err );
		} else {
			var content = sprite( buffer , spriteObj ) ,
				cssRealOut = spriteObj.cssDesDir ?
					path.join( curWorkingDir , spriteObj.cssDesDir ) :
					path.join( curWorkingDir , path.dirname( spriteObj.cssSrc ) ) ,
				baseName = path.basename( spriteObj.cssSrc );
			fs.writeFile( path.join( cssRealOut , baseName ) , content , function ( err ) {
				if ( err ) {
					callback( err );
				} else {
					callback( null );
				}
			} );
		}
	} );
};

// Synchronous
module.exports.spriteSync = function ( spriteObj ) {
	var buffer = fs.readFileSync( spriteObj.cssSrc ) ,
		content = sprite( buffer , spriteObj ) ,
		cssRealOut = spriteObj.cssDesDir ?
			path.join( curWorkingDir , spriteObj.cssDesDir ) :
			path.join( curWorkingDir , path.dirname( spriteObj.cssSrc ) ) ,
		baseName = path.basename( spriteObj.cssSrc );
	fs.writeFileSync( path.join( cssRealOut , baseName ) , content );
};