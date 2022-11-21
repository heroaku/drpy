#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : env.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/11/21

from utils.cfg import cfg
from controllers.service import storage_service

def get_env():
    new_conf = cfg
    lsg = storage_service()
    store_conf_dict = lsg.getStoreConfDict()
    new_conf.update(store_conf_dict)
    # print(new_conf)
    env = {
        'ali_token': new_conf.ALI_TOKEN,
        'js_proxy':new_conf.JS_PROXY,
        'fl':'{{fl}}' # 防止被依赖代理
    }
    return env