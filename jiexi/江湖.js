// realUrl = 重定向('http://211.99.99.236:4567/jhjson/ceshi.php?url='+vipUrl);
let jxUrl = 'http://211.99.99.236:4567/jhjson/ceshi.php?url=';
fetch_params.headers.Referer = jxUrl;
try {
    // realUrl = null;
    let html = request(jxUrl+vipUrl);
    // log(html);
    realUrl = jsp.pjfh(html,'$..url');
    log('解析到真实播放地址:'+realUrl);
}catch (e) {
    log('解析发生错误:'+e.message);
    realUrl = vipUrl;
}