#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : vqq.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/10/24

import requests
import re

time_out = 2
cookie = """
    pgv_pvid=5805499462; iip=0; RK=yQaYRyNLbG; ptcz=2a0d041daba2e1e3872184cd999e01bf90678c0e492c5900527c802251d224ad; tvfe_boss_uuid=53b5e88a3ebeba2c; ts_uid=8123938908; tvfe_search_uid=225c6955-d257-4d4a-97d0-cc327ffea211; txv_boss_uuid=95755769-e482-3a22-3e9f-6f8d842da1a7; pgv_pvi=1381712896; logTrackKey=613d40c3fea04aafb45fc9642dd67b99; video_platform=2; main_login=qq; vqq_vuserid=1260982452; vqq_openid=406CA2296D6A3B970597D6CF1605B6B7; vqq_appid=101483052; qq_nick=feng; pgv_info=ssid=s1368217315; pac_uid=1_434857005; vversion_name=8.2.95; video_guid=3419ca23530808d22bb278e881e46647; video_omgid=3419ca23530808d22bb278e881e46647; _qpsvr_localtk=0.710205836458567; compared_guid=bc772040638cf0da; vqq_access_token=88AEE1A8BC32318537BC7D81586E44A4; o_cookie=434857005; qv_als=vzJJwNyUEiCeDF1UA11662524934RoBNzA==; video_bucketid=4; fqm_pvqid=0a2a19f9-b09d-48d2-835a-cee916bdb63f; fqm_sessionid=a2c625f7-98e9-4d69-adb4-ad82846832bc; uin=o0434857005; skey=@rZMv3mYSR; tab_experiment_str=8752038#9047927#8752037#9040406#9099387; bucket_id=9231009; last_refresh_time=1666604352564; last_refresh_vuserid=1260982452; ts_refer=m.v.qq.com/; qq_head=http://thirdqq.qlogo.cn/g?b=sdk&k=llMfAicCbslpBk4funDukzg&s=100&t=318; vqq_vusession=sj85gfjn1ZL5jGI_RW5lLA.N; ptag=m_v_qq_com|channel; tab_experiment_data=exp_id=9099387&status=1; ts_last=v.qq.com/x/cover/m441e3rjq9kwpsc.html

    """.strip()

headers = {
        # "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36¬",
        "User-Agent": "qqlive",
        "cookie": cookie,
}
def get_vid(vipUrl):
    vid = None
    if vipUrl.find('v.qq.com/x/cover/') > -1:
        _type = vipUrl.split("v.qq.com/x/cover/")[1].split(".html")[0]
        if _type.find('/') > -1:
            vid = _type.split("/")[1]
        else:
            r = requests.get(vipUrl, headers=headers)
            html = r.text
            vid = html.split('<link rel="canonical" href="https://v.qq.com/x/cover/')[1].split('/')[1].split('.')[0]
    else:
        if re.search('/page/.*\.html', vipUrl):
            vid = vipUrl.split("/page/")[1].split(".html")[0]
        else:
            if vipUrl.find('&vid=') > -1:
                vid = vipUrl.split("&vid=")[1].split("&")[0]

    print(f'vid:{vid}')
    return vid

def vqq_jx_rx(url):
    # 1080P画质
    vid = get_vid(url)
    api = f"https://vv.video.qq.com/getinfo?defn=fhd&platform=10801&otype=ojson&sdtfrom=v4138&appVer=7&vid={vid}&newnettype=1&fhdswitch=1&show1080p=1&dtype=3&sphls=2"
    print(api)
    r = requests.get(api, headers=headers, timeout=time_out)
    ret = r.json()
    try:
        urls = ret["vl"]["vi"][0]['ul']['ui']
        # url = urls[-1]['url']
        url = urls[0]['url']
        realUrl = url
        print(realUrl)
    except:
        print(ret)

def vqq_jx(url):
    # 720P 画质
    vid = get_vid(url)
    api = f'https://vv.video.qq.com/getinfo?encver=2&defn=shd&platform=10801&otype=ojson&sdtfrom=v4138&appVer=7&dtype=3&vid={vid}&newnettype=1'
    print(api)
    r = requests.get(api,headers=headers,timeout=time_out)
    ret = r.json()
    try:
        urls = ret["vl"]["vi"][0]['ul']['ui']
        print(urls)
        url = urls[-1]['url']
        pt = urls[-1]['hls']['pt']
        realUrl = url + pt
        print(realUrl)
    except:
        print(ret)

if __name__ == '__main__':
    # 斗罗大陆
    url = 'https://v.qq.com/x/cover/m441e3rjq9kwpsc/c00442r6ry6.html'
    # 复仇者联盟
    url = 'https://v.qq.com/x/cover/v2098lbuihuqs11/m00314jtw6k.html'
    vqq_jx(url)
    # vqq_jx_rx(url)