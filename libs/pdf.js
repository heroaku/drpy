const DOM_CHECK_ATTR = /(url|src|href|-original|-src|-play|-url)$/;
const SELECT_REGEX = /:eq|:lt|:gt|#/g;
const SELECT_REGEX_A = /:eq|:lt|:gt/g;
const parseTags = {
    jq:{
        pdfh(html, parse, base_url) {
            if (!parse || !parse.trim()) {
                return ''
            }
            let eleFind = typeof html === 'object';
            let option = undefined;
            if (eleFind && parse.startsWith('body&&')) {
                parse = parse.substr(6);
                if (parse.indexOf('&&') < 0) {
                    option = parse.trim();
                    parse = '*=*';
                }
            }
            if (parse.indexOf('&&') > -1) {
                let sp = parse.split('&&');
                option = sp[sp.length - 1];
                sp.splice(sp.length - 1);
                if (sp.length > 1) {
                    for (let i in sp) {
                        //Javascript自定义Array.prototype干扰for-in循环
                        if(sp.hasOwnProperty(i)){
                            if (!SELECT_REGEX.test(sp[i])) {
                                sp[i] = sp[i] + ':eq(0)';
                            }
                        }
                    }
                } else {
                    if (!SELECT_REGEX.test(sp[0])) {
                        sp[0] = sp[0] + ':eq(0)';
                    }
                }
                parse = sp.join(' ');
            }
            let result = '';
            const $ = eleFind ? html.rr : cheerio.load(html);
            let ret = eleFind ? ((parse === '*=*' || $(html.ele).is(parse)) ? html.ele : $(html.ele).find(parse)) : $(parse);
            if (option) {
                if (option === 'Text') {
                    result = $(ret).text();
                }
                else if (option === 'Html') {
                    result = $(ret).html();
                }
                else {
                    result = $(ret).attr(option);
                    if(/style/.test(option.toLowerCase())&&/url\(/.test(result)){
                        try {
                            result =  result.match(/url\((.*?)\)/)[1];
                        }catch (e) {}
                    }
                }
                if (result && base_url && DOM_CHECK_ATTR.test(option)) {
                    if (/http/.test(result)) {
                        result = result.substr(result.indexOf('http'));
                    } else {
                        result = urljoin(base_url, result)
                    }
                }
            } else {
                result = $(ret).toString();
            }
            return result;
        },
        pdfa(html, parse) {
            if (!parse || !parse.trim()) {
                print('!parse');
                return [];
            }
            let eleFind = typeof html === 'object';
            // print('parse前:'+parse);
            if (parse.indexOf('&&') > -1) {
                let sp = parse.split('&&');
                for (let i in sp) {
                    if(sp.hasOwnProperty(i)){
                        if (!SELECT_REGEX_A.test(sp[i]) && i < sp.length - 1) {
                            if(sp[i]!=='body'){
                                // sp[i] = sp[i] + ':eq(0)';
                                sp[i] = sp[i] + ':first';
                            }
                        }
                    }
                }
                parse = sp.join(' ');
            }
            // print('parse后:'+parse);
            const $ = eleFind ? html.rr : cheerio.load(html);
            let ret = eleFind ? ($(html.ele).is(parse) ? html.ele : $(html.ele).find(parse)) : $(parse);
            let result = [];
            // print('outerHTML:');
            // print($(ret[0]).prop("outerHTML"));
            if (ret) {
                ret.each(function (idx, ele) {
                    result.push({ rr: $, ele: ele });
                    // result.push({ rr: $, ele: $(ele).prop("outerHTML")}); // 性能贼差
                });
            }
            return result;
        },
        pd(html,parse,uri){
            return parseTags.jq.pdfh(html, parse, MY_URL);
        },
    },
};