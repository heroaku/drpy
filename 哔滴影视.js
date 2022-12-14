var rule = {
    title: '哔滴影视',
    host: 'https://www.bdys01.com',
    url: '/s/all/fypage?type=fyclass',
    class_name: '全部&电影&电视剧',
    class_url: '&0&1',
    searchUrl: '',
    searchable: 0,//是否启用全局搜索,
    quickSearch: 0,//是否启用快速搜索,
    filterable: 0,//是否启用分类筛选,
    headers: {
        'User-Agent': 'MOBILE_UA',
    },
    play_parse: true,
    lazy: '',
    limit: 6,
    double: true, // 推荐内容是否双层定位
    推荐:'.row-cards;.card-link;*;img&&data-src;*;*',
    一级:'.row-cards&&.card-link;h3&&Text;img&&src;p&&Text;a&&href',
}
