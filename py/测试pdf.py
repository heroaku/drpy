#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : 测试pdf.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/11/14

from utils.ua import MOBILE_UA
from utils.htmlParser import jsoup
import requests


def main():
    r = requests.get('http://m.ysxs8.vip',headers={
        'User-Agent':MOBILE_UA
    })
    r.encoding = 'gb18030'
    html = r.text
    # print(html)

    jsp = jsoup(r.url)
    lis = jsp.pdfa(html,'.list-ul:eq(-1)')
    print(len(lis),lis)
    print(lis[0])
    a = jsp.pdfh(lis[0],'a&&li&&img&&alt')
    print(a)
    a = jsp.pdfh(lis[0], 'a&&li&&img&&data-original')
    print(a)
    a = jsp.pdfh(lis[0], 'a:eq(1)&&li&&Html')
    print(a)
    a = jsp.pdfh(lis[0], 'a:eq(1) li img')
    print(a)
    a = jsp.pd(lis[0], 'a&&li&&img&&src')
    print(a)

def main1():
    url = 'https://www.lanhua.tv/voddetail/7420.html'
    r = requests.get(url, headers={
        'User-Agent': MOBILE_UA
    })
    # r.encoding = 'gb18030'
    html = r.text
    # print(html)

    jsp = jsoup(r.url)
    a = jsp.pdfh(html,'.content_min&&ul&&li:eq(2) a&&Text')
    print(a)
    a = jsp.pdfh(html, '.content_min&&ul&&li:eq(2)&&Text')
    print(a)

def main2():
    url = 'http://www.tvyb03.com/vod/detail/id/117659.html'
    r = requests.get(url, headers={
        'User-Agent': MOBILE_UA
    })
    html = r.text
    jsp = jsoup(r.url)
    a = jsp.pdfa(html, '.myui-panel__head h3')
    print(len(a))
    a = jsp.pdfa(html, '.myui-panel__head:eq(1) h3')
    print(len(a))
    a = jsp.pdfh(html,'h1&&Text')
    print(a)
    a = jsp.pdfh(html, 'h1')
    print(a)
    a = jsp.pdfa(html, 'h1')
    print(a)

if __name__ == '__main__':
    # main()
    # main1()
    main2()