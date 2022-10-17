var rule={
    title:'麦豆',
    host:'https://www.dandanzan10.top',
    // homeUrl:'/',
    url:'/fyclass/index_fypage.html[/fyclass/index.html]',          
    //searchUrl:'/search/**/',
    searchable:2,//是否启用全局搜索,
    quickSearch:0,//是否启用快速搜索,
    filterable:0,//是否启用分类筛选,
    headers:{//网站的请求头,完整支持所有的,常带ua和cookies
        'User-Agent':'MOBILE_UA',
        // "Cookie": "searchneed=ok"
    },
    class_name:'电视剧&电影&综艺&动漫',
    class_url:'dianshiju&dianying&zongyi&dongman',

   推荐:'div.lists-content;li;h2&&Text;.thumb&&src;.note&&Text;a&&href',  
 
   一级:'.lists-content:eq(1)&&ul&&li;img&&alt;.thumb&&src;.note&&Text;a&&href',

    double:true, // 推荐内容是否双层定位

   二级:{"title":"h1&&Text;.col-xs-2.text-overflow:eq(0)&&Text","img":".vod-detail-thumb&&img&&src","desc":";;.text-overflow.hidden-xs:eq(3)&&Text;.col-md-1.text-overflow:eq(1)&&Text;.col-xs-2.hidden-xs:eq(0)&&Text","content":".txt-hidden.pointer&&Text","tabs":".details-play-nav li a","lists":".play-div-oa:eq(#id) li"},
   搜索:'ul.img-list.clearfix&&li;a&&title;.lazyload&&data-original;.pic-text&&Text;a&&href',
}