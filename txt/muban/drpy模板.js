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
    // headers: {
    //     'User-Agent': MOBILE_UA
    // },
    // play_parse:true,
    // lazy:'',
    class_parse: 'body&&.stui-header__menu .dropdown li:gt(0):lt(5);a&&Text;a&&href;.*/(.*?).html',
    一级: 'body&&.stui-vodlist li;a&&title;a&&data-original;.pic-text&&Text;a&&href',
    推荐:'ul.stui-vodlist.clearfix;li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
    二级:{"title":".stui-content__detail .title&&Text;.stui-content__detail p:eq(-2)&&Text","img":".stui-content__thumb .lazyload&&data-original","desc":".stui-content__detail p:eq(0)&&Text;.stui-content__detail p:eq(1)&&Text;.stui-content__detail p:eq(2)&&Text","content":".detail&&Text","tabs":".stui-vodlist__head h3","lists":".stui-content__playlist:eq(#id) li"},
    double:true, // 推荐内容是否双层定位
    //搜索:'ul.stui-vodlist__media:eq(0) li,ul.stui-vodlist:eq(0) li,#searchList li;a&&title;.lazyload&&data-original;.text-muted&&Text;a&&href;.text-muted:eq(-1)&&Text',
    搜索:'body&&ul.stui-vodlist__media:eq(0) li;a&&title;.lazyload&&data-original;.text-muted&&Text;a&&href;.text-muted:eq(-1)&&Text',
    // cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态',
    // tab_exclude: '猜你|喜欢|APP|下载|剧情',
}


/****上面才是pluto的drpy源,支持import外部模板来继承修改***/


/*** 以下是内置变量和解析方法 **/
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36';
const PC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36';
const UA = 'Mozilla/5.0';
const UC_UA = 'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36';
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1';
const RULE_CK = 'cookie_'+rule.title; // 源cookie
const CATE_EXCLUDE = '首页|留言|APP|下载|资讯|新闻|动态';
const TAB_EXCLUDE = '猜你|喜欢|APP|下载|剧情';

rule.cate_exclude = (rule.cate_exclude||'')+CATE_EXCLUDE;
rule.tab_exclude = (rule.tab_exclude||'')+TAB_EXCLUDE;

/*** 后台需要实现的java方法并注入到js中 ***/
function verifyCode(url){ // 验证码识别,暂未实现
    let cookie = '';
    return cookie
}

function setItem(key,value){
    /** 存在数据库配置表里, key字段对应值value,没有就新增,有就更新,调用此方法会清除内存缓存
     *
     */

}

function getItem(key,value){
    /** 获取数据库配置表对应的key字段的value，没有这个key就返回value默认传参.需要有缓存,第一次获取后会存在内存里
     *
     */

    return value
}

function clearItem(key){
    /** 删除数据库key对应的一条数据,并清除此key对应的内存缓存
     *
     */

}

function urljoin(fromPath, nowPath) {
    /** url拼接(暂未实现)
     *
     */
    return fromPath + nowPath
}


/*** js自封装的方法 ***/
function getHome(url){
    /** 获取链接的host
     * 带http协议的完整链接
     * @type {*|string[]}
     */
    let tmp = url.split('//');
    url = tmp[0] + '//' + tmp[1].split('/')[0];
    return url
}

function buildUrl(url,obj){
    /** get参数编译链接,类似python params字典自动拼接
     *
     * @type {{}}
     */
    obj = obj||{};
    if(url.indexOf('?')<0){
        url += '?'
    }
    let param_list = [];
    let keys = Object.keys(obj);
    keys.forEach(it=>{
        param_list.push(it+'='+obj[it])
    });
    let prs = param_list.join('&');
    if(keys.length > 0 && !url.endsWith('?')){
        url += '&'
    }
    url+=prs;
    return url
}

function request(url,obj){
    /** 海阔网页请求函数完整封装
     *
     */
    if(typeof(obj)==='undefined'||!obj||obj==={}){
        obj = {
            headers:{
                'User-Agent':MOBILE_UA,
                'Referer':getHome(url),
            }
        }
    }else{
        let headers = obj.headers||{};
        let keys = Object.keys(headers).map(it=>it.toLowerCase());
        if(!keys.includes('user-agent')){
            headers['User-Agent'] = MOBILE_UA;
        }if(!keys.includes('referer')){
            headers['referer'] = getHome(url);
        }
        obj.headers = headers;
    }
    if(obj.headers.body&&typeof (obj.headers.body)==='string'){
        let data = {};
        obj.headers.body.split('&').forEach(it=>{
            data[it.split('=')[0]] = it.split('=')[1]
        });
        obj.data = data;
        delete obj.headers.body
    }
    let res = req(url, obj);
    let html = res.content||'';
    return html
}

function checkHtml(html,url,obj){ //检查宝塔验证
    if(/\?btwaf=/.test(html)){
        let btwaf = html.match(/btwaf(.*?)"/)[1];
        url = url.split('#')[0]+'?btwaf'+btwaf;
        html = request(url,obj);
    }
    return html
}

function getCode(url,obj){
    /** 带一次宝塔验证的源码获取
     *
     * @type {string|DocumentFragment|string}
     */
    let html = request(url,obj);
    html = checkHtml(html,url,obj);
    return html
}

function getHtml(url){
    /** 源rule专用的请求方法,自动注入cookie
     *
     * @type {{}}
     */
    let obj = {};
    if(rule.headers){
        obj.headers = rule.headers;
    }
    let cookie = getItem(RULE_CK,'');
    if(cookie){
        if(obj.headers && ! Object.keys(obj.headers).map(it=>it.toLowerCase()).includes('cookie')){
            obj.headers['Cookie'] = cookie;
        }else if(!obj.headers){
            obj.headers = {Cookie:cookie};
        }
    }
    let html = getCode(url,obj);
    return html
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
                let html = getHtml(homeObj.MY_URL);
                if (html) {
                    let list = pdfa(html, p[0]);
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
                                console.log(e.message);
                            }
                        });
                    }
                }
            } catch (e) {
                console.log(e.message);
            }

        }
    }

    return JSON.stringify({
        'class': classes
    });

}

function homeVodParse(homeVodObj){
    let p = homeVodObj.推荐 ? homeVodObj.推荐.split(';') : [];
    if (!homeVodObj.double && p.length < 5) {
        return '{}'
    }else if (homeVodObj.double && p.length < 6) {
        return '{}'
    }
    let d = [];
    let html = getHtml(homeVodObj.homeUrl);
    try {
        if(homeVodObj.double){
            p[0] = p[0].trim().startsWith('json:')?p[0].replace('json:',''):p[0];
            let items = pdfa(html, p[0]);
            for(let item of items){
                let items2 = pdfa(item,p[1]);
                for(let item2 of items2){
                    try {
                        let title = pdfh(item2, p[2]);
                        let img = '';
                        try{
                            img = pd(item2, p[3])
                        }catch (e) {}
                        let desc = pdfh(item2, p[4]);
                        let links = [];
                        for(let p5 of p[5].split('+')){
                            let link = !homeVodObj.detailUrl?pd(item2, p5):pdfh(item2, p5);
                            links.push(link);
                        }
                        let vod = {
                            vod_name:title,
                            vod_pic:img,
                            vod_remarks:desc,
                            vod_id:links.join('$')
                        };
                        d.push(vod);
                    }catch (e) {
                        
                    }

                }


            }


        }
        else{
            p[0] = p[0].trim().startsWith('json:')?p[0].replace('json:',''):p[0];
            let items = pdfa(html, p[0]);
            for(let item of items){
                try {
                    let title = pdfh(item, p[1]);
                    let img = '';
                    try {
                        img = pd(item, p[2]);
                    }catch (e) {
                        
                    }
                    let desc = pdfh(item, p[3]);
                    let links = [];
                    for(let p5 of p4.split('+')){
                        let link = !homeVodObj.detailUrl?pd(item, p5):pdfh(item, p5);
                        links.push(link);
                    }
                    let vod = {
                        vod_name:title,
                        vod_pic:img,
                        vod_remarks:desc,
                        vod_id:links.join('$')
                    };
                    d.push(vod);

                }catch (e) {

                }

            }

        }

    }catch (e) {

    }
    return JSON.stringify({
        list:d
    })

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
        let html = getHtml(url);
        if (html) {
            let list = pdfa(html, p[0]);
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
        console.log(e.message);
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
        let html = getHtml(url);
        if (html) {
            if(/系统安全验证|输入验证码/.test(html)){
                let cookie = verifyCode(url);
                setItem('cookie_'+rule.title,cookie);
                obj.headers['Cookie'] = cookie;
                html = getCode(url,obj);
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

function detailParse(detailObj){
    let vod = {
        vod_id: "id",
        vod_name: "片名",
        vod_pic: "",
        type_name: "剧情",
        vod_year: "年份",
        vod_area: "地区",
        vod_remarks: "更新信息",
        vod_actor: "主演",
        vod_director: "导演",
        vod_content: "简介"
    };
    let p = detailObj.二级;
    let url = detailObj.url;
    let detailUrl = detailObj.detailUrl;
    let fyclass = detailObj.fyclass;
    let tab_exclude = detailObj.tab_exclude;
    let html = detailObj.html||'';
    if(p==='*'){
        vod.vod_play_from = '道长在线';
        vod.vod_remarks = detailUrl;
        vod.vod_actor = '没有二级,只有一级链接直接嗅探播放';
        vod.vod_content = url;
        vod.vod_play_url = '嗅探播放$' + url;
    }else if(p&&typeof(p)==='object'){
        if(!html){
            html = getHtml(url);
        }
        if(p.title){
            let p1 = p.title.split(';');
            vod.vod_name = pdfh(html, p1[0]).replaceAll('\n', ' ').trim();
            let type_name = p1.length > 1 ? pdfh(html, p1[1]).replaceAll('\n', ' ').trim():'';
            vod.type_name = type_name||vod.type_name;
        }
        if(p.desc){
            try{
                let p1 = p.desc.split(';');
                vod.vod_remarks =  pdfh(html, p1[0]).replaceAll('\n', ' ').trim();
                vod.vod_year = p1.length > 1 ? pdfh(html, p1[1]).replaceAll('\n', ' ').trim():'';
                vod.vod_area = p1.length > 2 ? pdfh(html, p1[2]).replaceAll('\n', ' ').trim():'';
                vod.vod_actor = p1.length > 3 ? pdfh(html, p1[3]).replaceAll('\n', ' ').trim():'';
                vod.vod_director = p1.length > 4 ? pdfh(html, p1[4]).replaceAll('\n', ' ').trim():'';
            }
            catch (e) {

            }
        }
        if(p.content){
            try{
                let p1 = p.content.split(';');
                vod.vod_content =  pdfh(html, p1[0]).replaceAll('\n', ' ').trim();
            }
            catch (e) {}
        }
        if(p.img){
            try{
                let p1 = p.img.split(';');
                vod.vod_pic =  pd(html, p1[0]);
            }
            catch (e) {}
        }

        let vod_play_from = '$$$';
        let playFrom = [];
        if(p.重定向&&p.重定向.startsWith('js:')){
            html = eval(p.重定向.replace('js:',''));
        }
        if(p.tabs){
            let vHeader = pdfa(html, p.tabs.split(';')[0]);
            for(let v in vHeader){
                let v_title = pdfh(v,'body&&Text');
                if(tab_exclude&& (new RegExp(tab_exclude)).test(v_title)){
                    continue
                }
                playFrom.push(v_title);
            }
        }else{
            playFrom = ['道长在线']
        }
        vod.vod_play_from = playFrom.join(vod_play_from);

        let vod_play_url = '$$$';
        let vod_tab_list = [];
        if(p.lists){
            for(let i=0;i<playFrom.length;i++){
                let tab_name = playFrom[i];
                let tab_ext =  p.tabs.split(';').length > 1 ? p.tabs.split(';')[1] : '';
                let p1 = p.lists.replaceAll('#idv', tab_name).replaceAll('#id', i);
                tab_ext = tab_ext.replaceAll('#idv', tab_name).replaceAll('#id', i);
                let vodList = pdfa(html, p1);
                let new_vod_list = [];
                let tabName = tab_ext?pdfh(html, tab_ext):tab_name;
                vodList.forEach(it=>{
                    new_vod_list.push(tabName+'$'+pd(it,'a&&href'));
                });
                let vlist = vodList.join('#');
                vod_tab_list.push(vlist);
            }
        }
        vod.vod_play_url = vod_tab_list.join(vod_play_url);
    }
    return JSON.stringify(vod)
}

function playParse(playObj){
    let common_play = {
        parse:0,
        url:playObj.url
    };
    let lazy_play;
    if(!rule.play_parse||!rule.lazy){
        lazy_play =  common_play;
    }else if(rule.play_parse&&rule.lazy&&typeof(rule.lazy)==='string'){
        try {
            eval(rule.lazy.replace('js:').trim());
            lazy_play = typeof(input) === 'object'?input:{
                parse:0,
                url:input
            };
        }catch (e) {
            lazy_play =  common_play;
        }
    }else{
        lazy_play =  common_play;
    }
    return JSON.stringify(lazy_play);
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
    let homeUrl = rule.host&&rule.homeUrl?urljoin(rule.host,rule.homeUrl):(rule.homeUrl||rule.host);
    let detailUrl = rule.host&&rule.detailUrl?urljoin(rule.host,rule.detailUrl):rule.detailUrl;
    let homeVodObj = {
        推荐:rule.推荐,
        double:rule.double,
        homeUrl:homeUrl,
        detailUrl:detailUrl
    };
    return homeVodParse(homeVodObj)
    // return "{}";
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

function detail(vod_url) {
    let fyclass = '';
    if(vod_url.indexOf('$')>-1){
        let tmp = vod_url.split('$');
        fyclass = tmp[0];
        vod_url = tmp[1];
    }
    let detailUrl = vod_url;
    let url;
    rule.homeUrl = urljoin(rule.host,rule.homeUrl||'');
    rule.detailUrl = urljoin(rule.host,rule.detailUrl||'');
    if(!detailUrl.startsWith('http')&&!detailUrl.includes('/')){
        url = rule.detailUrl.replaceAll('fyid', detailUrl).replaceAll('fyclass',fyclass);
    }else if(detailUrl.includes('/')){
        url = urljoin(rule.homeUrl,detailUrl);
    }else{
        url = detailUrl
    }
    let detailObj = {
        url:url,
        二级:rule.二级,
        detailUrl:detailUrl,
        fyclass:fyclass,
        tab_exclude:rule.tab_exclude,
    }
    return detailParse(detailObj)
}

function play(flag, id, flags) {
    let playObj = {
        url:id,
        flag:flag,
        flags:flags
    }
    return playParse(playObj);
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