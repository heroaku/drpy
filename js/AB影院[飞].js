var rule = {
     title:'AB影院',
    host:'https://abu22.com/',
    url:'vodtype/fyclass-fypage.html',
    searchUrl:'/search.php;**',
    headers:{ 'User-Agent':'PC_UA',},
    class_name:'电影&剧集&综艺&动漫&伦理',
    class_url:'1&2&4&3&40',
    推荐:'.stui-vodlist__item;*;*;*;*',
    一级:'.stui-vodlist__item;a&&title;a&&data-original;.pic-text&&Text;a&&href',
   
    二级:{"title":"h3&&Text;.stui-content__detail p:eq(0)&&Text","img":".lazyload&&data-original","desc":";;;.stui-content__detail p:eq(1)&&Text;.stui-content__detail p:eq(2)&&Text","content":".stui-content__detail p:eq(5)&&Text","tabs":".stui-pannel__head.clearfix&&h3","lists":".stui-content__playlist.clearfix:eq(#id) a"},
   
    搜索:'js:let url=input.split(";")[0];let d=[];let body={searchword:input.split(";")[1]};body="searchword="+input.split(";")[1];fetch_params.body=body;let html=post(url,fetch_params);let pdfa=jsp.pdfa;let pdfh=jsp.pdfh;let pd=jsp.pd;let lists=pdfa(html,"ul.stui-vodlist__media&&li");lists.forEach(function(it){d.push({title:pdfh(it,".title&&Text"),url:pd(it,"a&&href"),desc:pdfh(html,".pic-text&&Text"),pic_url:pd(html,".lazyload&&data-original")})});setResult(d);',
}