let jxUrl = 'http://api.kunyu77.com/api.php/provide/parserUrl?url=';
fetch_params.headers.Referer = jxUrl;
fetch_params.headers['User-Agent'] = "Dalvik/2.1.0";
try {
    // realUrl = null;
    let html = request(jxUrl+vipUrl);
    log(html);
    realUrl = jsp.pjfh(html,'$..url');
    realUrl = 重定向(realUrl);
    log('解析到真实播放地址:'+realUrl);
}catch (e) {
    log('解析发生错误:'+e.message);
    realUrl = vipUrl;
}