js:
let d = [];
function get_result(url){
    let result = {};
    let html = request(url);
    let jo = JSON.parse(html);
    if(jo['code'] === 0){
        let videos = [];
        let vodList = jo.result?jo.result.list:jo.data.list;
        vodList.forEach(function (vod){
            let aid = (vod['season_id']+'').trim();
            let title = vod['title'].trim();
            let img = vod['cover'].trim();
            let remark = vod['new_ep']['index_show'];
            videos.push({
                "vod_id": aid,
                "vod_name": title,
                "vod_pic": img,
                "vod_remarks": remark
            });
        });
        result['list'] = videos;
        result['page'] = 1;
        result['pagecount'] = 1;
        result['limit'] = 90;
        result['total'] = 999999;
    }
    return result;
}
function get_rank(tid,pg){
    return get_result('https://api.bilibili.com/pgc/web/rank/list?season_type='+tid+'&pagesize=20&page='+pg+'&day=3')
}

function get_rank2(tid,pg){
    return get_result('https://api.bilibili.com/pgc/season/rank/web/list?season_type='+tid+'&pagesize=20&page='+pg+'&day=3')
}

function get_zhui(pg,mode){
    let url = 'https://api.bilibili.com/x/space/bangumi/follow/list?type='+mode+'&follow_status=0&pn='+pg+'&ps=10&vmid='+getItem('userid','');
    return get_result(url)
}

function get_all(tid, pg, order, season_status){
    let url = 'https://api.bilibili.com/pgc/season/index/result?order='+order+'&pagesize=20&type=1&season_type='+tid+'&page='+pg+'&season_status='+season_status;
    return get_result(url)
}

function get_timeline(tid,pg){
    let result = {};
    let url = 'https://api.bilibili.com/pgc/web/timeline/v2?season_type='+tid+'&day_before=2&day_after=4';
    let html = request(url);
    let jo = JSON.parse(html);
    if(jo['code'] === 0){
        let videos1 = [];
        let vodList = jo.result.latest;
        vodList.forEach(function (vod){
            let aid = (vod['season_id']+'').trim();
            let title = vod['title'].trim();
            let img = vod['cover'].trim();
            let remark = vod['pub_index'] + '　' + vod['follows'].replace('系列', '');
            videos.push({
                "vod_id": aid,
                "vod_name": title,
                "vod_pic": img,
                "vod_remarks": remark
            });
        });
        let videos2 = [];
        for(let i=0;i<7;i++){
            let vodList = jo['result']['timeline'][i]['episodes'];
            vodList.forEach(function (vod){
                if((vod['published']+'') === "0"){
                    let aid = (vod['season_id']+'').trim();
                    let title = vod['title'].trim();
                    let img = vod['cover'].trim();
                    let date = vod['pub_ts'];
                    let remark = date + "   " + vod['pub_index'];
                    videos2.push({
                            "vod_id": aid,
                            "vod_name": title,
                            "vod_pic": img,
                            "vod_remarks": remark
                    });
                }
            });

        }
        result['list'] = videos2.concat(videos1);
        result['page'] = 1;
        result['pagecount'] = 1;
        result['limit'] = 90;
        result['total'] = 999999;
    }
    return result;
}

function cate_filter(d, cookie) {
    if (MY_CATE === "1") {
        return get_rank(MY_CATE,MY_PAGE)
    }else if(['2','3','4','5','7'].includes(MY_CATE)){
        return get_rank2(MY_CATE,MY_PAGE)
    }else if(MY_CATE==='全部'){
        let tid = MY_FL.tid||'1' ;
        let order = MY_FL.order||'2';
        let season_status = MY_FL.season_status||'-1';
        return get_all(tid, MY_PAGE, order, season_status)
    }else if(MY_CATE==='追番'){
        return get_zhui(MY_PAGE, 1)
    }else if(MY_CATE==='追剧'){
        return get_zhui(MY_PAGE, 2)
    }else if(MY_CATE==='时间表'){
        let tid = MY_FL.tid||'1' ;
        return get_timeline(tid,MY_PAGE)
    }else{
        return {}
    }
}
VODS = cate_filter().list;
// print(VODS);