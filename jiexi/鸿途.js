let jxUrl = 'https://h5.freejson.xyz/player/analysis.php?v=';
fetch_params.headers.Referer = jxUrl;
try {
    // realUrl = null;
    let html = request(jxUrl+vipUrl);
    log(html);
    //realUrl = jsp.pjfh(html,'$..url');
    realUrl=html.match(/var urls = "(.*?)"/)[1];
    log('解析到真实播放地址:'+realUrl);
}catch (e) {
    log('解析发生错误:'+e.message);
    realUrl = vipUrl;
}