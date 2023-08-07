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

const DATA_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json';

const CANVAS = document.getElementById('canvas');

let IMGUR_URL = '';
let IMAGE_BG = null;
let IMAGE_LOGO = null;
let WIDTH = 0;
let HEIGHT = 0;
let WORDS = [];
let LOADED = 0;

let FLAGS = {
    LOGO: false,
    AUTHOR: false
};

function dataParser(data) {

    if (document.readyState !== 'complete') {
        setTimeout(dataParser.bind(null, data), 100);
        return;
    }

    for (var index in data.table.rows) {
        WORDS.push(data.table.rows[index].c[0].v);
    }

    WORDS.sort(function() { return 0.5 - Math.random() });

    document.fonts.ready.then(function () {
        initCanvas();
    });

    document.fonts.onloadingdone = function (fontFaceSetEvent) {
        initCanvas();
    };
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
    let lineHeight = fontSize * 1.3;
    let lines = WORDS[0].split('\n');
    if (!Array.isArray(lines)) {
        lines = [WORDS[0]];
    }

    if (FLAGS.AUTHOR) {
        lines.push('- Albert Einstein');
    }

    if (location.href.indexOf('ldll') > -1) {
        lines.push('來都來了');
    }

    if (location.href.indexOf('peko') > -1) {
        lines.push('peko');
    }

    let baseY = (HEIGHT - lineHeight * lines.length ) / 2 + lineHeight / 1.3;
    if (FLAGS.AUTHOR) {
    // 補作者
        baseY = baseY + 50;
    }

    if (!FLAGS.AUTHOR) {
        for (let i = 0; i<lines.length; i++) {
            measureText = ctx.measureText(lines[i]);
            ctx.fillText(lines[i],
                (WIDTH - measureText.width) / 2,
                baseY + i * lineHeight
            );
        }

        return;
    }

    // 寫上面
    for (let i = 0; i<lines.length - 1; i++) {
        measureText = ctx.measureText(lines[i]);
        ctx.fillText(lines[i],
            (WIDTH - measureText.width) / 2,
            baseY + i * lineHeight
        );
    }

    // 寫作者
    let last = lines.length - 1;
    let author = lines[lines.length - 1];
    ctx.font = '48px "Noto Sans TC"';
    measureText = ctx.measureText(author);
    ctx.fillText(author,
        (WIDTH - measureText.width - 50),
        baseY + last * lineHeight
    );
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

function drawLogo() {

    if (!FLAGS.LOGO) {
        return;
    }

    let ctx = CANVAS.getContext('2d');
    // ctx.font = '36px "Noto Sans TC"';
    // ctx.fillStyle = '#eee';

    // ctx.fillText('just-buy.it',
    //     50 + 175 + 20,
    //     // window.innerHeight - 50
    //     50 + 38
    // );

    ctx.drawImage(IMAGE_LOGO, 50, 50, 175, 52);
}

function initCanvas() {
    let ctx = CANVAS.getContext('2d');
    resizeCanvasToDisplaySize(ctx.canvas);
    if (IMAGE_BG) {
        drawBG();
        drawText();
        drawLogo();
        return;
    }

    IMAGE_BG = new Image();
    IMAGE_BG.onload = function() {

        isFinishedLoaded();
    };
    IMAGE_BG.crossOrigin = 'Anonymous';
    // IMAGE_BG.src = 'https://source.unsplash.com/' + WIDTH + 'x' + HEIGHT;
    IMAGE_BG.src = 'https://source.unsplash.com/' + WIDTH + 'x' + HEIGHT + '/?random';

    if (!FLAGS.LOGO) {
        return;
    }

    IMAGE_LOGO = new Image();
    IMAGE_LOGO.onload = function() {
        isFinishedLoaded();
    }
    IMAGE_LOGO.crossOrigin = 'Anonymous';
    IMAGE_LOGO.src = 'https://pan.cat/assets/img/pancat-logo2.png';
}

function isFinishedLoaded() {
    LOADED++;

    let TARGET_LOADED_COUNT = 1;

    if (FLAGS.LOGO) {
        TARGET_LOADED_COUNT++;
    }

    if (LOADED <= TARGET_LOADED_COUNT) {
        return;
    }

    drawBG();
    drawText();
    drawLogo();

    $('#overlay').hide();
}

function uploadToImgur(callback) {

    $('#overlay').find('p').text('圖片上傳中');
    $('#overlay').show();

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
            $('#overlay').hide();
            callback();
        }

    });
}

function shareToSocialNetwork(site) {

    var shareUrl = 'https://twitter.com/home/?status=' + encodeURIComponent(IMGUR_URL + ' 「' + WORDS[0] + '」 https://just-buy.it #justbuyit');

    if (site == 'facebook') {
        shareUrl = 'https://www.facebook.com/sharer/sharer.php?u= ' + encodeURIComponent(IMGUR_URL) + '&picture=' + encodeURIComponent(IMGUR_URL) + '&title=' + encodeURIComponent(WORDS[0]) + '&quote=' + encodeURIComponent(WORDS[0] + ' https://just-buy.it');
    }

    if (IMGUR_URL) {
        return window.open(shareUrl);
    }

    uploadToImgur(function() {
        return window.open(shareUrl);
    });
}

(function(){
    var pa = document.createElement('script'); pa.type = 'text/javascript'; pa.charset = "utf-8"; pa.async = true;
    pa.src = DATA_URL;
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(pa, s);
})();

$(document).ready(function() {
    $(window).resize(function() {
        let ctx = CANVAS.getContext('2d');
        resizeCanvasToDisplaySize(ctx.canvas);
        drawBG();
        drawText();
        drawLogo();
    });

    $('.js-share-to-sns').click(function() {
        shareToSocialNetwork($(this).data('site'));
    });
});

google = {};
google.visualization = {};
google.visualization.Query = {};
google.visualization.Query.setResponse = dataParser;