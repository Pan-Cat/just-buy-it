/*
https://spreadsheets.google.com/feeds/worksheets/{SHEET-ID}/public/basic?alt=json       get grid ids
https://spreadsheets.google.com/feeds/worksheets/1OYdT891rY4eH1RCj918OuZyvuJHEo_Ofr3eKA55E13c/public/basic?alt=json


https://spreadsheets.google.com/feeds/list/{SHEET-ID}/{GRID-ID}/public/values?alt=json  get whole sheet data
https://spreadsheets.google.com/feeds/cells/1OYdT891rY4eH1RCj918OuZyvuJHEo_Ofr3eKA55E13c/od6/public/basic?alt=json


https://spreadsheets.google.com/feeds/cells/{SHEET-ID}/{GRID-ID}/public/values          get all cell data
alt=json                                                                                return json
alt=json-in-script&callback={CALLBACK}                                                  return data to callback function
 */

const SHEET_ID = '1OYdT891rY4eH1RCj918OuZyvuJHEo_Ofr3eKA55E13c';
const GRID_ID = 'od6';
const IMGUR_ID = '448c9fc02d25574';

const DATA_URL = 'https://spreadsheets.google.com/feeds/cells/' + SHEET_ID + '/' + GRID_ID + '/public/values?alt=json-in-script&callback=dataParser';

const CANVAS = document.getElementById('canvas');

let IMGUR_URL = '';
let IMAGE_BG = null;
let WIDTH = 0;
let HEIGHT = 0;
let WORDS = [];

function dataParser(data) {
    for(let index in data.feed.entry) {
        WORDS.push(data.feed.entry[index].content["$t"]);
    }
    WORDS.sort(function() { return 0.5 - Math.random() });

    document.fonts.ready.then(function () {
        initCanvas();
    });
}

function resizeCanvasToDisplaySize(canvas) {
   // look up the size the canvas is being displayed
   WIDTH = canvas.clientWidth;
   HEIGHT = canvas.clientHeight;

   // If it's resolution does not match change it
   if (canvas.width !== WIDTH || canvas.height !== HEIGHT) {
     canvas.width = WIDTH;
     canvas.height = HEIGHT;
     return true;
   }

   return false;
}

function getFontSize() {
    return (WIDTH * 94 / 100 / 10);
}

function drawText() {
    let ctx = CANVAS.getContext('2d');
    let fontSize = getFontSize();
    ctx.font = fontSize + 'px "Noto Sans TC"';
    ctx.fillStyle = '#eee';
    let measureText = ctx.measureText('測試文字');
    let lineHeight = measureText.width/4;
    let lines = WORDS[0].split('\n');
    if (!Array.isArray(lines)) {
        lines = [WORDS[0]];
    }

    for (let i = 0; i<lines.length; i++) {
        measureText = ctx.measureText(lines[i]);
        ctx.fillText(lines[i],
            (WIDTH - measureText.width) / 2,
            (HEIGHT - lines.length * lineHeight) / 2 + lineHeight * i + lineHeight/2);
    }
}

function drawBG() {
    let ctx = CANVAS.getContext('2d');

    ctx.drawImage(IMAGE_BG, 0, 0, WIDTH, HEIGHT);
    StackBlur.canvasRGB(CANVAS, 0, 0, WIDTH, HEIGHT, 4);

    var grd = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grd.addColorStop(0,'rgba(0, 0, 0, 0.2)');
    grd.addColorStop(1,'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function initCanvas() {
    let ctx = CANVAS.getContext('2d');
    resizeCanvasToDisplaySize(ctx.canvas);
    if (IMAGE_BG) {
        drawBG();
        drawText();
        return;
    }

    IMAGE_BG = new Image();
    IMAGE_BG.onload = function() {
        drawBG();
        drawText();
    };
    IMAGE_BG.crossOrigin = 'Anonymous';
    IMAGE_BG.src = 'https://source.unsplash.com/' + WIDTH + 'x' + HEIGHT;
}

function shareToFacebook() {

    // var form = new FormData();
    // form.append("image", $("#canvas")[0].toDataURL('image/jpeg'));

    // var settings = {
    //   "async": true,
    //   "crossDomain": true,
    //   "url": "https://api.imgur.com/3/image",
    //   "method": "POST",
    //   "headers": {
    //     "authorization": "Client-ID " + IMGUR_ID
    //   },
    //   "processData": false,
    //   "contentType": false,
    //   "mimeType": "multipart/form-data",
    //   "data": form
    // }

    // window.open('http://www.facebook.com/sharer.php?s=100&p[title]='+encodeURIComponent(WORDS[0]) + '&p[summary]=' + encodeURIComponent(WORDS[0]) + '&p[url]=' + encodeURIComponent('https://just-buy.it') + '&p[images][0]=' + encodeURIComponent('https://p2.bahamut.com.tw/B/ACG/c/07/0000084307.PNG'));

    // $.ajax(settings).done(function (response) {
    //     window.open("http://www.facebook.com/dialog/feed?app_id=266143446762054&link="+img_uploaded+"&picture="+img_uploaded+"&name=PlurkBingo&caption=噗浪賓果&description=快來玩噗浪賓果 "+$('#share_url').val()+"&redirect_uri=http://bingo.hsatac.net");
    // });
}

function uploadToImgur(callback) {
    var form = new FormData();
    form.append("image", $("#canvas")[0].toDataURL('image/jpeg').split(',')[1]);

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.imgur.com/3/image",
      "method": "POST",
      "headers": {
        "authorization": "Client-ID " + IMGUR_ID
      },
      "processData": false,
      "contentType": false,
      "mimeType": "multipart/form-data",
      "data": form,
      "dataType": "json",
    }

    $.ajax(settings).done(function (response) {
        if(response.success) {
            IMGUR_URL = response.data.link;
            callback();
        }

    });
}

function shareToTwitter() {

    if (IMGUR_URL) {
        return window.open("https://twitter.com/home/?status="+encodeURIComponent(IMGUR_URL + "「" + WORDS[0] + "」 #justbuyit"));
    }

    uploadToImgur(function() {
        window.open("https://twitter.com/home/?status="+encodeURIComponent(IMGUR_URL + "「" + WORDS[0] + "」 https://just-buy.it #justbuyit"));
    });
}

$(document).ready(function() {
    let s = document.createElement( 'script' )
    s.setAttribute( 'src', DATA_URL )
    document.body.appendChild( s );

    $(window).resize(function() {
        let ctx = CANVAS.getContext('2d');
        resizeCanvasToDisplaySize(ctx.canvas);
        drawBG();
        drawText();
    });

    $('#js-share-to-facebook').click(function() {
        shareToFacebook();
    });

    $('#js-share-to-twitter').click(function() {
        shareToTwitter();
    });
});