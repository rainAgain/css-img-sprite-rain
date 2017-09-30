![downloads](https://img.shields.io/npm/dm/css-img-sprite.svg)
![license](https://img.shields.io/npm/l/css-img-sprite.svg)
![version](https://img.shields.io/npm/v/css-img-sprite.svg)

[[English]](readme.md)

# 目录
1. [安装](#INSTALL)
1. [Gulp版](#Gulp_Version)
1. [CSS](#How_To_Write_CSS)
1. [JavaScript](#How_To_Write_JS)
1. [示例](#Example)

# <a name="Install">安装</a>
> npm install css-img-sprite

# <a name="Gulp_Version">Gulp版</a>
* Gulp : [gulp-css-img-sprite](https://github.com/king-king/gulp-css-img-sprite)

# <a name="How_To_Write_CSS">CSS</a>
在css中引用了两张未合并图片：
shop:
![shop](test/image/shop.png)
bag:
![shop](test/image/bag.png)

* 在url后附加 **?__sprite'**或**?__spriter**（防止拼错），告诉程序进行合并处理
```css
.image1 {
    margin: 10px;
    width: 100px;
    height: 30px;
    background: url("test/image/shop.png?__spriter") 0 0;
    border: 3px solid black;
}
.image2 {
    margin: 10px;
    width: 50px;
    background: url("test/image/bag.png?__spriter") 0 0;
    height: 50px;
    border: 3px solid black;
}
```
合并完成后会得到这样的图片：
![after](test/image/base_f4aff81c22_z.png)

同时会得到新的css文件内容：
```css
.image1 {
    margin: 10px;
    width: 100px;
    height: 30px;
    border: 3px solid black;
    background-repeat: no-repeat;
}
.image2 {
    margin: 10px;
    width: 50px;
    height: 50px;
    border: 3px solid black;
    background-repeat: no-repeat;
}
.image1 {
    background-position: -6px 0px
}
.image2 {
    background-position: 0px -47px
}
.image1, .image2 {
    background-image: url("test/image/base_f4aff81c22_z.png")
}
```
* 支持高度宽度同比例放大图片，放大倍数相同的图片会放到同一幅生成图里，如下面中shop和bag均放大了两倍，结果会放到同一张合成图中。
```css
.image1 {
    background: url("test/image/shop.png?__spriter") 0 0;
    background-size:88px auto;
}
.image2 {
    background: url("test/image/bag.png?__spriter") 0 0;
     background-size:100px auto;
}
```
* 如果图片放大比例不为1，且使用了repeat，则即便添加了'?__sprite'后缀也不会进行图片合成，如：
```css
.image {
    background: url("test/image/bag.png?__spriter") repeat-x 0 200px;
    background-size: 100px auto;
}
```
 
* 支持background-size中的auto写法，如：
```css
.image1 {
    background: url("test/image/bag.png?__sprite") 0 0;
    background-size: auto 50px;
}
/* or */
.image1 {
    background: url("test/image/bag.png?__sprite") 0 0;
    background-size: 50px 50px;
}
/* or */
.image1 {
    background: url("test/image/bag.png?__sprite") 0 0;
    background-size: auto auto;
}
```

> 重要：需要注意的是，模块对于没有进行合并的图片不会做任何处理。你需要自己保证未合并图片拷贝到指定目录以及未合并图片的url


# <a name="How_To_Write_JS">JavaScript</a>

* 接口：
    1. **raw ( content , spriteObj )**
    1. **sprite ( spriteObj , callback )**
    1. **spriteSync ( spriteObj )**
    
* 参数说明：
```javascript
/**
 *  arguments:
 *      content:{buffer} css源文件的内容
 *      spriteObj:{object}
 *          spriteObj.cssSrc:{string} 尽管你已经将css文件内容作为参数提供了，但该参数仍然是必不可少的，因为我们要知
 *                                    晓css文件的名称以及获取图片的路径
 *          [spriteObj.cssDesDir]:{string} 生成css文件的路径。需要以此路径来确认合并图片的url，默认是cssSrc
 *          [spriteObj.imgDesDir]:{string} 生成合并图的路径。需要以此路径来确认合并图片的url，默认是cssSrc
 *          [spriteObj.layout]:{string} "linear"(默认)|"matrix"，如果用了'matrix'，将采用bin-packing算法进行布局，
 *                                      保证图片面积尽可能小
 *          [spriteObj.hash]:{boolean} 为合并图添加hash标记，默认是不添加
 *          [spriteObj.errLog]:{boolean} 如果有错误则将错误写到.spritelog文件内
 *      callback:{function} callback(err) 异步回调
 *  return:
 *      content:{buffer} css新文件的内容
 *
 **/
```

> 需要注意的是raw是一个低级接口，不负责新css文件的写入，返回给你的是新css文件的buffer，你需要自己写入。

# <a name="Example">示例</a>

> 你可以在test文件夹中找到三种接口的用法