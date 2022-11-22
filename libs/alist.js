// import _ from 'https://underscorejs.org/underscore-esm-min.js'
import { distance } from 'https://unpkg.com/fastest-levenshtein@1.0.16/esm/mod.js'
import {getFirstLetterList } from 'https://gitcode.net/qq_32394351/dr_py/-/raw/master/libs/pinyin_getFirstLetterList.js'

/**
 * alist js
 * 配置设置 {"key":"Alist","name":"Alist","type":3,"api":"http://xxx.com/alist.js","searchable":0,"quickSearch":0,"filterable":0,"ext":"http://xxx.com/alist.json"}
 * alist.json [{
				name:'名称',
				server:'地址',
				startPage:'/',		 //启动文件夹
				showAll: false ,	//是否显示全部文件，默认false只显示 视频和文件夹
				params:{ 			//对应文件夹参数 如设置对应文件夹的密码
					'/abc':{ password : '123' },
					'/abc/abc':{ password : '123' },
				}
		}]
 * 提示 想要加载文件夹里面全部视频到详情（看剧可以自动播放下一集支持历史记录）
 *		需要改软件才能支持，，建议长按文件夹时添加判断 tag == folder 时跳转 DetailActivity
 */
String.prototype.rstrip = function (chars) {
	let regex = new RegExp(chars + "$");
	return this.replace(regex, "");
};
var showMode = 'single';
var searchDriver = '';
var limit_search_show = 200;
var search_type = '';
/**
 * 打印日志
 * @param any 任意变量
 */
function print(any){
	any = any||'';
	if(typeof(any)=='object'&&Object.keys(any).length>0){
		try {
			any = JSON.stringify(any);
			console.log(any);
		}catch (e) {
			// console.log('print:'+e.message);
			console.log(typeof(any)+':'+any.length);
		}
	}else if(typeof(any)=='object'&&Object.keys(any).length<1){
		console.log('null object');
	}else{
		console.log(any);
	}
}

const http = function (url, options = {}) {
	if(options.method ==='POST' && options.data){
		options.body = JSON.stringify(options.data);
		options.headers = Object.assign({'content-type':'application/json'}, options.headers);
	}
    const res = req(url, options);
    res.json = () => res.content ? JSON.parse(res.content) : null;
    res.text = () => res.content;
    return res
};
["get", "post"].forEach(method => {
    http[method] = function (url, options = {}) {
        return http(url, Object.assign(options, {method: method.toUpperCase()}));
    }
});

const __drives = {};

function isMedia(file){
	return /\.(wmv|mpeg|mov|ram|swf|mp4|mp3|wma|avi|rm|rmvb|flv|mpg|mkv|m3u8)$/.test(file);
}

function get_drives_path(tid) {
	const index = tid.indexOf('$');
	const name = tid.substring(0, index);
	const path = tid.substring(index + 1);
	return { drives: get_drives(name), path };
}

function get_drives(name) {
	const { settings, api, server } = __drives[name];
	if (settings.v3 == null) { //获取 设置
		settings.v3 = false;
		const data = http.get(server + '/api/public/settings').json().data;
		if (Array.isArray(data)) {
			settings.title = data.find(x => x.key === 'title')?.value;
			settings.v3 = false;
			settings.version = data.find(x => x.key === 'version')?.value;
			settings.enableSearch = data.find(x => x.key === 'enable search')?.value === 'true';
		} else {
			settings.title = data.title;
			settings.v3 = true;
			settings.version = data.version;
			settings.enableSearch = false; //v3 没有找到 搜索配置
		}
		//不同版本 接口不一样
		api.path = settings.v3 ? '/api/fs/list' : '/api/public/path';
		api.file = settings.v3 ? '/api/fs/get' : '/api/public/path';
		api.search = settings.v3 ? '/api/public/search' : '/api/public/search';
	}
	return __drives[name]
}

function init(ext) {
	let alist_data = ext.split(';');
	let alist_data_url = alist_data[0];
	limit_search_show = alist_data.length>1?Number(alist_data[1])||limit_search_show:limit_search_show;
	search_type = alist_data.length>2?alist_data[2]:search_type;
	const data = http.get(alist_data_url).json();
	searchDriver = (data.find(x=>x.search)||{}).name||'';
	data.forEach(item => {
		let _path_param = [];
		if(item.params){
			_path_param = Object.keys(item.params);
			// 升序排列
			_path_param.sort((a,b)=>(a.length-b.length));
		}
		__drives[item.name] = {
			name: item.name,
			server: item.server.endsWith("/") ? item.server.rstrip("/") : item.server,
			startPage: item.startPage || '/', //首页
			showAll: item.showAll === true, //默认只显示 视频和文件夹，如果想显示全部 showAll 设置true
			search: !!item.search, //是否支持搜索,只有小丫的可以,多个可搜索只取最前面的一个
			params: item.params || {},
			_path_param: _path_param,
			settings: {},
			api: {},
			getParams(path) {
				const key = this._path_param.find(x => path.startsWith(x));
				return Object.assign({}, this.params[key], { path });
			},
			getPath(path) {
				const res = http.post(this.server + this.api.path, { data: this.getParams(path) }).json();
				return this.settings.v3 ? res.data.content : res.data.files
			},
			getFile(path) {
				let raw_url = this.server+'/d'+path;
				raw_url = encodeURI(raw_url);
				// print('raw_url:'+raw_url);
				return {raw_url:raw_url};

				// const res = http.post(this.server + this.api.file, { data: this.getParams(path) }).json();
				// const data = this.settings.v3 ? res.data : res.data.files[0];
				// if (!this.settings.v3) {
				// 	data.raw_url = data.url; //v2 的url和v3不一样
				// }
				// return data
			},
			isFolder(data) { return data.type === 1 },
			isVideo(data) { //判断是否是 视频文件
				return this.settings.v3 ? data.type === 2 : data.type === 3
			},
			is_subt(data) {
				if (data.type === 1) {
					return false;
				}
				const ext = /\.(srt|ass|scc|stl|ttml)$/;  // [".srt", ".ass", ".scc", ".stl", ".ttml"];
				// return ext.some(x => data.name.endsWith(x));
				return ext.test(data.name);
			},
			getPic(data) {
				let pic = this.settings.v3 ? data.thumb : data.thumbnail;
				return pic || (this.isFolder(data) ? "http://img1.3png.com/281e284a670865a71d91515866552b5f172b.png" : '');
			},
			getTime(data,isStandard) {
				isStandard = isStandard||false;
				try {
					let tTime = data.updated_at || data.time_str || data.modified || "";
					let date = '';
					if(tTime){
						tTime = tTime.split("T");
						date = tTime[0];
						if(isStandard){
							date = date.replace(/-/g,"/");
						}
						tTime = tTime[1].split(/Z|\./);
						date += " " + tTime[0];
					}
					return date;
				}catch (e) {
					// print(e.message);
					// print(data);
					return ''
				}
			},
	}
	}
	);
	print('init执行完毕');
}

function home(filter) {
	let classes = Object.keys(__drives).map(key => ({
		type_id: `${key}$${__drives[key].startPage}`,
		type_name: key,
		type_flag: '1',
	}));
	let filter_dict = {};
	let filters = [{'key': 'order', 'name': '排序', 'value': [{'n': '名称⬆️', 'v': 'vod_name_asc'}, {'n': '名称⬇️', 'v': 'vod_name_desc'},
			{'n': '时间⬆️', 'v': 'vod_time_asc'}, {'n': '时间⬇️', 'v': 'vod_time_desc'},
			{'n': '大小⬆️', 'v': 'vod_size_asc'}, {'n': '大小⬇️', 'v': 'vod_size_desc'}]},
			{'key': 'show', 'name': '播放展示', 'value': [{'n': '单集', 'v': 'single'},{'n': '全集', 'v': 'all'}]}
	];
	classes.forEach(it=>{
		filter_dict[it.type_id] = filters;
	});
	print("----home----");
	print(classes);
	return JSON.stringify({ 'class': classes,'filters': filter_dict});
}

function homeVod(params) {
	return JSON.stringify({ 'list': [] });
}

function category(tid, pg, filter, extend) {
	let { drives, path } = get_drives_path(tid);
	const id = tid.endsWith('/') ? tid : tid + '/';
	const list = drives.getPath(path);
	let subList = [];
	let vodFiles = [];
	let allList = [];
	list.forEach(item => {
		if (drives.is_subt(item)) {
			subList.push(item.name);
		}
		if (!drives.showAll && !drives.isFolder(item) && !drives.isVideo(item)) {
			return //只显示视频文件和文件夹
		}
		let vod_time = drives.getTime(item);
		let vod_size = get_size(item.size);
		let remark = vod_time.split(' ')[0].substr(3)+'\t'+vod_size;
		const vod = {
			'vod_id': id + item.name + (drives.isFolder(item) ? '/' : ''),
			'vod_name': item.name.replaceAll("$", "").replaceAll("#", ""),
			'vod_pic': drives.getPic(item),
			'vod_time':vod_time ,
			'vod_size':item.size ,
			'vod_tag': drives.isFolder(item) ? 'folder' : 'file',
			'vod_remarks': drives.isFolder(item) ? remark + ' 文件夹' : remark
		};
		if (drives.isVideo(item)) {
			vodFiles.push(vod);
		}
		allList.push(vod);
	});

	if (vodFiles.length === 1 && subList.length > 0) { //只有一个视频 一个或者多个字幕 取相似度最高的
		// let sub = subList.length === 1 ? subList[0] : _.chain(allList).sortBy(x => (x.includes('chs') ? 100 : 0) + levenshteinDistance(x, vodFiles[0].vod_name)).last().value();
		let sub; // 字幕文件名称
		if(subList.length === 1){
			sub = subList[0];
		}else {
			let subs = JSON.parse(JSON.stringify(subList));
			subs.sort((a,b)=>{
				// chs是简体中文字幕
				let a_similar = (a.includes('chs') ? 100 : 0) + levenshteinDistance(a, vodFiles[0].vod_name);
				let b_similar = (b.includes('chs') ? 100 : 0) + levenshteinDistance(b, vodFiles[0].vod_name);
				if(a_similar>b_similar) { // 按相似度正序排列
					return 1;
				}else{ //否则，位置不变
					return -1;
				}
			});
			sub = subs.slice(-1)[0];
		}
		vodFiles[0].vod_id += "@@@" + sub;
		// vodFiles[0].vod_remarks += " 有字幕";
		vodFiles[0].vod_remarks += "🏷️";
	} else {
		vodFiles.forEach(item => {
			const lh = 0;
			let sub;
			subList.forEach(s => {
				//编辑距离相似度
				const l = levenshteinDistance(s, item.vod_name);
				if (l > 60 && l > lh) {
					sub = s;
				}
			});
			if (sub) {
				item.vod_id += "@@@" + sub;
				// item.vod_remarks += " 有字幕";
				item.vod_remarks += "🏷️";
			}
		});
	}
	print("----category----,tid:"+tid);
	let fl = filter?extend:{};
	if(fl.order){
		// print(fl.order);
		let key = fl.order.split('_').slice(0,-1).join('_');
		let order = fl.order.split('_').slice(-1)[0];
		print(`排序key:${key},排序order:${order}`);
		if(key.includes('name')){
			allList = sortListByName(allList,key,order);
		}else if(key.includes('time')){
			allList = sortListByTime(allList,key,order);
		}else if(key.includes('size')){
			allList = sortListBySize(allList,key,order);
		}
	}else{
		allList = sortListByName(allList,'vod_name','asc');
	}
	if(fl.show){
		showMode = fl.show;
	}
	// print(allList);
	return JSON.stringify({
		'page': 1,
		'pagecount': 1,
		'limit': allList.length,
		'total': allList.length,
		'list': allList,
	});
}

function getAll(otid,tid,drives,path){
	try {
		const content = category(tid, null, false, null);
		const { list } = JSON.parse(content);
		let vod_play_url = [];
		list.forEach(x => {
			if (x.vod_tag === 'file'){
				vod_play_url.push(`${x.vod_name}$${x.vod_id.substring(x.vod_id.indexOf('$') + 1)}`);
			}
		});
		const pl = path.split("/");
		const vod_name = pl[pl.length - 2] || drives.name;
		let vod = {
			// vod_id: tid,
			vod_id: otid,
			vod_name: vod_name,
			type_name: "文件夹",
			vod_pic: "https://avatars.githubusercontent.com/u/97389433?s=120&v=4",
			vod_content: tid,
			vod_tag: 'folder',
			vod_play_from: drives.name,
			vod_play_url: vod_play_url.join('#'),
			vod_remarks: drives.settings.title,
		}
		print("----detail1----");
		print(vod);
		return JSON.stringify({ 'list': [vod] });
	}catch (e) {
		print(e.message);
		return JSON.stringify({ 'list': [{}] });
	}
}

function detail(tid) {
	let isSearch = tid.endsWith('#search#');
	let otid = tid;
	tid = tid.replace('#search#','');
	let isFile = isMedia(tid);
	let { drives, path } = get_drives_path(tid);
	if (path.endsWith("/")) { //长按文件夹可以 加载里面全部视频到详情
		return getAll(otid,tid,drives,path);
	} else {
		if(isSearch&&!isFile){
			return getAll(otid,tid,drives,path);
		}else if(showMode==='all'){
			let new_tid = tid.split('/').slice(0,-1).join('/')+'/';
			print(`全集模式 tid:${tid}=>tid:${new_tid}`);
			let { drives, path } = get_drives_path(new_tid);
			return getAll(otid,new_tid,drives,path);
		} else{
			let paths = path.split("@@@");
			let vod_name = paths[0].substring(paths[0].lastIndexOf("/") + 1);
			let vod = {
				vod_id: otid,
				vod_name: vod_name,
				type_name: "文件",
				vod_pic: "https://avatars.githubusercontent.com/u/97389433?s=120&v=4",
				vod_content: tid,
				vod_play_from: drives.name,
				vod_play_url: vod_name + "$" + path,
				vod_remarks: drives.settings.title,
			};
			print("----detail2----");
			print(vod);
			return JSON.stringify({
				'list': [vod]
			});
		}
	}
}

function play(flag, id, flags) {
	const drives = get_drives(flag);
	const urls = id.split("@@@"); // @@@ 分割前是 相对文件path,分割后是字幕文件
	let vod = {
		'parse': 0,
		'playUrl': '',
		'url': drives.getFile(urls[0]).raw_url
	};
	if (urls.length >= 2) {
		const path = urls[0].substring(0, urls[0].lastIndexOf('/') + 1);
		vod.subt = drives.getFile(path + urls[1]).raw_url;
	}
	print("----play----");
	print(vod);
	return JSON.stringify(vod);
}

function search(wd, quick) {
	print(__drives);
	print('可搜索的alist驱动:'+searchDriver);
	if(!searchDriver){
		return JSON.stringify({
			'list': []
		});
	}else{
		let driver = __drives[searchDriver];
		print(driver);
		let surl = driver.server + '/search?box='+wd+'&url=';
		if(search_type){
			surl+='&type='+search_type;
		}
		print('搜索链接:'+surl);
		let html = http.get(surl).text();
		let lists = [];
		try {
			lists = pdfa(html,'div&&ul&&a');
		}catch (e) {}
		print(`搜索结果数:${lists.length},搜索结果显示数量限制:${limit_search_show}`);
		let vods = [];
		let excludeReg = /\.(pdf|epub|mobi|txt|doc|lrc)$/; // 过滤后缀文件
		lists.forEach(it=>{
			let vhref = pdfh(it,'a&&href');
			if(vhref){
				vhref = unescape(vhref);
			}
			if(excludeReg.test(vhref)){
				return; //跳过本次循环
			}
			let vid = searchDriver+'$'+vhref+'#search#';
			vods.push({
				vod_name:pdfh(it,'a&&Text'),
				vod_id:vid,
				vod_pic:'http://img1.3png.com/281e284a670865a71d91515866552b5f172b.png',
				vod_remarks:searchDriver
			});
		});
		// 截取搜索结果
		vods = vods.slice(0,limit_search_show);
		print(vods);
		return JSON.stringify({
			'list': vods
		});
	}
}

function get_size(sz) {
	if (sz <= 0) {
		return "";
	}
	let filesize = "";
	if (sz > 1024 * 1024 * 1024 * 1024.0) {
		sz /= (1024 * 1024 * 1024 * 1024.0);
		filesize = "TB";
	} else if (sz > 1024 * 1024 * 1024.0) {
		sz /= (1024 * 1024 * 1024.0);
		filesize = "GB";
	} else if (sz > 1024 * 1024.0) {
		sz /= (1024 * 1024.0);
		filesize = "MB";
	} else if( sz > 1024.0){
		sz /= 1024.0;
		filesize = "KB";
	}else{
		filesize = "B";
	}
	// 转成字符串
	let sizeStr = sz.toFixed(2) + filesize,
	// 获取小数点处的索引
	index = sizeStr.indexOf("."),
	// 获取小数点后两位的值
	dou = sizeStr.substr(index + 1, 2);
	if (dou === "00") {
		return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
	}else{
		return sizeStr;
	}
}

// 相似度获取
function levenshteinDistance(str1, str2) {
    return 100 - 100 * distance(str1, str2) / Math.max(str1.length, str2.length);
}

// 首字母开头排序
const sortListByFirst = (vodList,key) => {
	key = key||'vod_name';
	// 名字以特殊符号开头的应用列表
	const symbol_list = [];
	// 名字以中文开头的应用列表
	const cn_list = [];
	// 名字以英文开头的应用列表
	const en_list = [];
	// 名字以数字开头的应用列表
	const num_list = [];

	vodList.forEach((vod) => {
		const { vod_name } = vod;
		//通过正则进行数据分类
		if (/[\u4e00-\u9fa5]/.test(vod_name[0])) {
			cn_list.push(vod);
		} else if (/[a-zA-Z]/.test(vod_name[0])) {
			en_list.push(vod);
		} else if (/[\d]/.test(vod_name[0])) {
			num_list.push(vod);
		} else {
			symbol_list.push(vod);
		}
	});
	//按照要求的方式进行数据排序重组
	const newList = [
		...cn_list.sort((a, b) => a.vod_name[0]?.localeCompare(b.vod_name[0])),
		...en_list.sort((a, b) => a.vod_name[0].localeCompare(b.vod_name[0])),//localeCompare可以不区分大小写的进行排序
		...num_list.sort((a, b) => a.vod_name[0] - b.vod_name[0]),
		...symbol_list.sort((a, b) => a.vod_name[0] - b.vod_name[0])
	];
	return newList
};

// 判断字符串是否全是中文
function isAllChinese(str) {
	return /^[\u4E00-\u9FA5]+$/.test(str);
}

// 判断字符是否为中文
function isChinese(char) {
	return /^[\u4E00-\u9FA5]$/.test(char);
}

// 完整名称排序
const sortListByName = (vodList,key,order) => {
	if(!key){
		return vodList
	}
	order = order||'asc'; // 默认正序
	let ASCarr = vodList.sort((a, b) => {
		a = a[key];
		b = b[key];
		// 数字排在字符串前面
		if (typeof a === 'number' && typeof b === 'string') {
			return -1;
		}

		if (typeof a === 'string' && typeof b === 'number') {
			return 1;
		}

		// 当存在非数字时
		if (isNaN(a) || isNaN(b)) {

			// 全汉字的排在非全汉字的后面
			if (isAllChinese(a) && !isAllChinese(b)) {
				return 1;
			}

			if (!isAllChinese(a) && isAllChinese(b)) {
				return -1;
			}

			// 存在非数字的数据时，都转为字符串进行比较
			a = a.toString();
			b = b.toString();

			let result = 0;

			// 依次比较两个字符串的各项字符
			for (let index = 0; index < ((a.length - b.length) ? b.length : a.length); index++) {

				// 汉字排在非汉字的后面
				if (!isChinese(a[index]) && isChinese(b[index])) {
					result = -1;
				}

				if (isChinese(a[index]) && !isChinese(b[index])) {
					result = 1;
				}

				// 若两个汉字进行比较，则比较他们的拼音首字母
				if (isChinese(a[index]) && isChinese(b[index])) {
					let pinyinA = getFirstLetterList(a[index]).toString();
					let pinyinB = getFirstLetterList(b[index]).toString();

					result = pinyinA.localeCompare(pinyinB, 'zh-Hans-CN', { sensitivity: 'accent' });
				}

				// 若已经比较出结果，则跳出循环，不再继续比较剩余字符
				if (result !== 0) {
					break
				}
			}

			// 只要有一个无法转换为数字——转换为字符串进行比较——先按字符排序，然后按照数字排序
			return result || a.toString().localeCompare(b.toString(), 'zh-Hans-CN', { sensitivity: 'accent' });
		} else {
			// 都能转换为数字——转换为数字进行比较——从小到大排序
			return Number(a) - Number(b);
		}
	});
	if(order==='desc'){
		ASCarr.reverse();
	}
	return ASCarr
};

const getTimeInt = (timeStr) => {
	return (new Date(timeStr)).getTime();
};

// 时间
const sortListByTime = (vodList,key,order) => {
	if (!key) {
		return vodList
	}
	let ASCarr = vodList.sort((a, b) => {
		a = a[key];
		b = b[key];
		return getTimeInt(a) - getTimeInt(b);
	});
	if(order==='desc'){
		ASCarr.reverse();
	}
	return ASCarr
};

// 大小
const sortListBySize = (vodList,key,order) => {
	if (!key) {
		return vodList
	}
	let ASCarr = vodList.sort((a, b) => {
		a = a[key];
		b = b[key];
		return (Number(a) || 0) - (Number(b) || 0);
	});
	if(order==='desc'){
		ASCarr.reverse();
	}
	return ASCarr
};

// 导出函数对象
export default {
	init: init,
	home: home,
	homeVod: homeVod,
	category: category,
	detail: detail,
	play: play,
	search: search
}