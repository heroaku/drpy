var rule={
    title:'ddys',
    host:'https://ddys.tv',
    // homeUrl:'/',
    url:'/fyclass/page/fypage/',
    searchUrl:'/?s=**&post_type=post',
    searchable:2,//是否启用全局搜索,
    quickSearch:0,//是否启用快速搜索,
    filterable:0,//是否启用分类筛选,
    headers:{//网站的请求头,完整支持所有的,常带ua和cookies
        'User-Agent':'MOBILE_UA',
        // "Cookie": "searchneed=ok"
    },
    // class_name:'电影&剧集&动画',
    // class_url:'movie&airing&anime',
    class_parse:'#primary-menu li.menu-item;a&&Text;a&&href;\.tv/(.*)',
    cate_exclude:'站长|^其他$|关于|^电影$|^剧集$|^类型$',
    play_parse:true,
    lazy:'',
    limit:6,
    //推荐:'.indexShowBox;ul&&li;a&&title;img&&data-src;.s1&&Text;a&&href',
    double:true, // 推荐内容是否双层定位
    一级:'.post-box-list&&article;a:eq(-1)&&Text;.post-box-image&&style;a:eq(0)&&Text;a:eq(-1)&&href',
    二级:{"title":".post-title&&Text;.cat-links&&Text","img":".doulist-item&&img&&data-cfsrc","desc":".published&&Text","content":".abstract&&Text","tabs":"js:TABS=['道长在线','道长在线2']","lists":"js:log(TABS);LISTS=[['第1集$http://1.mp4','第2集$http://2.mp4'],['第3集$http://1.mp4','第4集$http://2.mp4']]"},
    搜索:'#main&&article;.post-title&&Text;;.published&&Text;a&&href',
    推荐:'*'
}