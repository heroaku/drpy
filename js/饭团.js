var rule={
    title:'饭团',
    host:'https://fositv.com',
    // homeUrl:'/',
    url:'/vodtype/fyclass-fypage.html',
   searchUrl:'/vodsearch/-------------.html?wd=**',
    searchable:2,//是否启用全局搜索,
    quickSearch:0,//是否启用快速搜索,
    filterable:0,//是否启用分类筛选,
    headers:{//网站的请求头,完整支持所有的,常带ua和cookies
        'User-Agent':'MOBILE_UA',
        // "Cookie": "searchneed=ok"
    },
    class_parse:'.dropdown-box&&ul&&li;a&&Text;a&&href;.*/(.*?).html',
    play_parse:true,
    lazy:'',
    limit:6,
    推荐:'.myui-panel_bd;&&li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
    double:true, // 推荐内容是否双层定位
    一级:'.myui-vodlist&&li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
    二级:{"title":".text-fff&&Text","img":".lazyload&&data-original","desc":".col-pd.text-collapse&&p:eq(1)&&Text;             .col-pd.text-collapse&&p:eq(2)&&Text;     .col-pd.text-collapse&&p:eq(0)&&Text","content":".sketch&&Text","tabs":".nav&&li","lists":".myui-content__list:eq(#id) li"},
搜索:'.myui-panel_bd&&ul&&li;h4&&Text;lazyload&&data-original;a&&href',
}