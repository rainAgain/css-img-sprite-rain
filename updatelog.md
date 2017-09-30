## 1.0.13
* you can get err log
* if background-size is before background,you can not sprite:
```css
  .image1 {
      background-size: 50px 50px;
      background: url("test/image/shop.png?__spriter") 0 0;
  }
```
sprite will fail,you should write:
```css
   .image1 {
       background: url("test/image/shop.png?__spriter") 0 0;
     background-size: 50px 50px;
  }
 ```