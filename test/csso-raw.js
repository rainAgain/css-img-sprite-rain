/**
 * Created by acer on 2017/2/8.
 */

var gulp = require( "gulp" );
var csso = require( "gulp-csso" );
var sprite = require( "../index" ).sprite;


// gulp.src( "private/vender.css" , { base : "css" } )
// 	.pipe( csso() )
// 	.pipe( gulp.dest( "out/vender-css" ) );

sprite({
    cssSrc: 'private/vender.css',
    cssDesDir: 'out',
    imgDesDir: 'out'
}, function () {
    console.log("end");
});
