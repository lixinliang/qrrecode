# qrrecode
> (<3kb) Create a transition animation when reload a new qrcode.

## Try it now

* http://preview.lixinliang.com/demo/qrrecode/

## Getting started
```
$ npm install qrrecode
```

## How to use
```js
var qrcode = QRCodeCanvas();

var options;

options = {
    type : 'smooth-fade',
    duration : 600,
    callback : function ( percentage ) {
        console.log(percentage);
    },
};

options = {
    type : 'smooth-blur',
    duration : 400,
    blur : 3,
    callback : function ( percentage ) {
        console.log(percentage);
    },
};

// QRRecode(
//   backgroundCanvas : HTMLCanvasElement,
//   foregroundCanvas : HTMLCanvasElement,
//   options : Object,
// )
QRRecode(canvas, qrcode, options);
```

---

## License

MIT
