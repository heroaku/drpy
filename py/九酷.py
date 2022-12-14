#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : 九酷.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/12/14

import requests
import time
import ujson

headers = {
    'x-requested-with':'XMLHttpRequest',
    'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    'Cookie':'ecPopup=1;crisp-client%2Fsession%2Fba128124-8ac1-44d1-8420-98420b4da478=session_8d89f90c-4b46-4895-86d8-03a74770b741'
}
s = requests.session()
s.get('https://jiuku.site/index.php/vod/type/id/1.html')
print(s.cookies)

fyclass = 1
fypage = 1
tm = int(time.time())
tm = ''
print(tm)
data = f'type={fyclass}&page={fypage}&time={tm}1670981084&key=52871810a25aa2ac4675e3c4dfd321c6'
data_dict = {}
for dt in data.split('&'):
    data_dict[dt.split('=')[0]] = dt.split('=')[1]
print(data_dict)
data_dict = ujson.dumps(data_dict)
r = s.post('https://jiuku.site/index.php/api/vod',data=data_dict,headers=headers)
print(r.text)