// import ch from './cheerio.min.js';
// import 模板 from 'https://gitcode.net/qq_32394351/dr_py/-/raw/master/js/模板.js'
// var rule =Object.assign(模板.首图2,{
// host: 'https://www.zbkk.net',
// });
var rule = {
    title: '真不卡',
    host: 'https://www.zbkk.net',
    url: '/vodshow/fyclass--------fypage---.html',
    searchUrl:'/vodsearch/**----------fypage---.html',
    // searchUrl:'/vodsearch.html?wd=**&pg=fypage',
    headers: {
        // 'User-Agent': MOBILE_UA
    },
    class_parse: 'body&&.stui-header__menu .dropdown li:gt(0):lt(5);a&&Text;a&&href;.*/(.*?).html',
    一级: 'body&&.stui-vodlist li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
    //搜索:'ul.stui-vodlist__media:eq(0) li,ul.stui-vodlist:eq(0) li,#searchList li;a&&title;.lazyload&&data-original;.text-muted&&Text;a&&href;.text-muted:eq(-1)&&Text',
    搜索:'body&&ul.stui-vodlist__media:eq(0) li;a&&title;.lazyload&&data-original;.text-muted&&Text;a&&href;.text-muted:eq(-1)&&Text',
    cate_exclude: '猜你|喜欢|APP|首页',
}

// 以下是内置变量和解析方法
var MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; Mi 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Mobile Safari/537.36';
var UA = 'Mozilla/5.0';
var total_cnt = 3;
var api = 'http://dm.mudery.com:10000';
if(!rule.headers){
    rule.headers = {}
}
if(!(rule.headers['User-Agent']||rule.headers['user-agent'])){
    rule.headers['User-Agent'] = UA
}
function urljoin(a, b) {//url拼接，暂未实现
    return a + b
}
function checkHtml(html,url){ //检查宝塔验证
    if(/\?btwaf=/.test(html)){
        let btwaf = html.match(/btwaf(.*?)"/)[1];
        url = url.split('#')[0]+'?btwaf'+btwaf;
        let res = req(url,{
            headers: rule.rule.headers
        });
        html = res.content || '';
    }
    return html
}
function verifyCode(url){ // 验证码识别,暂未实现
    let cookie = '';
    return cookie
}

function homeParse(homeObj) {//首页分类解析，筛选暂未实现
    let classes = [];
    if (homeObj.class_name && homeObj.class_url) {
        let names = homeObj.class_name.split('&');
        let urls = homeObj.class_url.split('&');
        let cnt = Math.min(names.length, urls.length);
        for (let i = 0; i < cnt; i++) {
            classes.push({
                'type_id': urls[i],
                'type_name': names[i]
            });
        }
    }

    if (homeObj.class_parse) {
        let p = homeObj.class_parse.split(';');
        if (p.length >= 4) {
            try {
                let res = req(homeObj.MY_URL, {
                    headers: rule.rule.headers
                });
                if (res.content) {
                    let list = pdfa(res.content, p[0]);

                    if (list && list.length > 0) {

                        list.forEach(it => {
                            try {
                                let name = pdfh(it, p[1]);
                                if (homeObj.cate_exclude && (new RegExp(homeObj.cate_exclude).test(name))) {
                                    return;
                                }
                                let url = pdfh(it, p[2]);
                                if (p[3]) {
                                    let exp = new RegExp(p[3]);
                                    url = url.match(exp)[1];
                                }

                                classes.push({
                                    'type_id': url,
                                    'type_name': name
                                });
                            } catch (e) {
                                console.log(e);
                            }

                        });
                    }

                }

            } catch (e) {
                console.log(e);
            }

        }

    }

    return JSON.stringify({
        'class': classes
    });

}

function categoryParse(cateObj) {//一级分类页数据解析
    let p = cateObj.一级 ? cateObj.一级.split(';') : [];
    if (p.length < 5) {
        return '{}'
    }
    let d = [];
    let url = cateObj.url.replaceAll('fyclass', cateObj.tid).replaceAll('fypage', cateObj.pg);
    console.log(url);
    try {
        let res = req(url, {
            headers: rule.rule.headers
        });
        if (res.content) {
            let list = pdfa(res.content, p[0]);
            list.forEach(it => {
                d.push({
                    'vod_id': pd(it, p[4]),
                    'vod_name': pdfh(it, p[1]),
                    'vod_pic': pd(it, p[2]),
                    'vod_remarks': pdfh(it, p[3]),
                });
            });
            return JSON.stringify({
                'page': parseInt(cateObj.pg),
                'pagecount': 999,
                'limit': 20,
                'total': 999,
                'list': d,
            });
        }
    } catch (e) {
        console.log(e);
    }
    return '{}'
}

function searchParse(searchObj) {//搜索列表数据解析
    let p = searchObj.搜索 ? searchObj.搜索.split(';') : [];
    if (p.length < 5) {
        return '{}'
    }
    let d = [];
    let url = searchObj.searchUrl.replaceAll('**', searchObj.wd).replaceAll('fypage', searchObj.pg);
    console.log(url);
    try {
        let res = req(url, {
            headers: rule.headers
        });

        if (res.content) {
            let html = checkHtml(res.content,url);
            // const $ = ch.load(res.content);
            // console.log($('div').length);
            if(/系统安全验证|输入验证码/.test(html)){
                let cookie = verifyCode(url);
                setItem('cookie_'+rule.title,cookie);
                res = req(url, {
                        headers: rule.headers
                });
                html = res.content;
            }
            if(!html.includes(searchObj.wd)){
                console.log('搜索结果源码未包含关键字,疑似搜索失败,正为您打印结果源码');
                console.log(html);
            }
            let list = pdfa(html, p[0]);
            list.forEach(it => {
                let ob = {
                    'vod_id': pd(it, p[4]),
                    'vod_name': pdfh(it, p[1]),
                    'vod_pic': pd(it, p[2]),
                    'vod_remarks': pdfh(it, p[3]),
                };
                if (p.length > 5 && p[5]) {
                    ob.vod_content = pdfh(it, p[5]);
                }
                d.push(ob);
            });
            return JSON.stringify({
                'page': parseInt(searchObj.pg),
                'pagecount': 10,
                'limit': 20,
                'total': 100,
                'list': d,
            });
        }
    } catch (e) {
    }
    return '{}'
}

// 以上是内置变量和解析方法

function init(ext) {
    console.log("init");
}

function home(filter) {
    console.log("home");
    let homeObj = {
        MY_URL: rule.host,
        class_name: rule.class_name || '',
        class_url: rule.class_url || '',
        class_parse: rule.class_parse || '',
        cate_exclude: rule.cate_exclude,
    };
    return homeParse(homeObj);
}

function homeVod(params) {
    return "{}";
}

function category(tid, pg, filter, extend) {
    let cateObj = {
        url: urljoin(rule.host, rule.url),
        一级: rule.一级,
        tid: tid,
        pg: pg,
        filter: filter,
        extend: extend
    };
    return categoryParse(cateObj)
}

function detail(id) {
    return "{}";
}

function play(flag, id, flags) {
    return "{}";
}

function search(wd, quick) {
    let searchObj = {
        searchUrl: urljoin(rule.host, rule.searchUrl),
        搜索: rule.搜索,
        wd: wd,
        //pg: pg,
        pg: 1,
        quick: quick,
    };
    return searchParse(searchObj)
}

export default {
    init: init,
    home: home,
    homeVod: homeVod,
    category: category,
    detail: detail,
    play: play,
    search: search
}