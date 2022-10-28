#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : layui.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/9/14

from flask import Blueprint,request,render_template,jsonify,make_response,redirect
from utils.web import getParmas,get_interval,layuiBack,verfy_token
from utils.cfg import cfg
from controllers.service import storage_service,rules_service
from utils.system import getHost
from utils.files import getCustonDict,custom_merge
from utils.encode import parseText
from js.rules import getRules,getPys
from operator import itemgetter, attrgetter
import functools

layui = Blueprint("layui", __name__)

@layui.route('/')
def hello():  # put application's code here
    return jsonify({'msg':'hello layui'})

@layui.route('/index')
def layui_index():  # put application's code here
    # return render_template('layui_index.html')
    if not verfy_token():
        return render_template('login.html')
    return render_template('layui_list.html')

@layui.route('/api/list')
def layui_rule_list():
    page = int(getParmas('page',1))
    limit = int(getParmas('limit',10))
    # print(f'page:{page},limit:{limit}')
    new_conf = cfg
    lsg = storage_service()
    store_conf_dict = lsg.getStoreConfDict()
    new_conf.update(store_conf_dict)
    host = getHost(2)
    customConfig = getCustonDict(host)
    jxs = []
    lsg = storage_service()
    use_py = lsg.getItem('USE_PY')
    pys = getPys() if use_py else []
    # print(pys)
    alists = []
    live_url = []
    local_rules = getRules('js')
    # print(local_rules)
    html = render_template('config.txt', pys=pys, rules=local_rules, host=host, mode=2, jxs=jxs, alists=alists,
                           alists_str='[]', live_url=live_url, config=new_conf)
    merged_config = custom_merge(parseText(html), customConfig)
    sites = merged_config['sites']
    rules = rules_service()
    rule_list = rules.query_all()
    rule_names = list(map(lambda x:x['name'],rule_list))
    # print(rule_list)
    print(rule_names)
    # print(sites)
    for i in range(len(sites)):
        sites[i]['id'] = i+1
        site_name = sites[i]['api'].split('rule=')[1].split('&')[0] if 'rule=' in sites[i]['api'] else sites[i]['key']
        # print(site_name)
        if site_name in rule_names:
            site_rule = rule_list[rule_names.index(site_name)]
            sites[i]['state'] = 1 if site_rule['state'] is None else site_rule['state']
            sites[i]['order'] = 0 if site_rule['order'] is None else site_rule['order']
            sites[i]['write_date'] = 0 if site_rule['write_date'] is None else site_rule['write_date'].timestamp()
        else:
            sites[i]['state'] = 1
            sites[i]['order'] = 0
            sites[i]['write_date'] = 0
        sites[i]['site_name'] = site_name

    def multisort(sites, specs):
        """
        https://zhuanlan.zhihu.com/p/109269549?utm_id=0
        多重排序,来自知乎的代码.明显只对了最后的元素进行排序.看完评论和实践发现不对
        :param sites:
        :param specs:
        :return:
        """
        for key, reverse in specs:
            # sites.sort(key=attrgetter(key), reverse=reverse)
            sites.sort(key=lambda x:x[key], reverse=reverse)
        return sites

    def comp(x, y):
        if x['order'] > y['order']:
            return 1
        elif x['order'] < y['order']:
            return - 1
        else:
            if x['write_date'] < y['write_date']:
                return 1
            elif x['write_date'] > y['write_date']:
                return -1
            else:
                return 0

    # multisort(sites, (('order', False), ('write_date', True)))
    # sites.sort(key=lambda x:x['order'],reverse=False)
    sites.sort(key=functools.cmp_to_key(comp),reverse=False)
    new_sites = sites[(page-1)*limit:page*limit]
    # print(new_sites)
    return layuiBack('获取成功',new_sites,count=len(sites))
