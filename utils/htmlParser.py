#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# File  : htmlParser.py
# Author: DaShenHan&道长-----先苦后甜，任凭晚风拂柳颜------
# Date  : 2022/8/25

import ujson
from pyquery import PyQuery as pq
from urllib.parse import urljoin
import re
from jsonpath import jsonpath

PARSE_CACHE = True  # 解析缓存
NOADD_INDEX = ':eq|:lt|:gt|:first|:last|^body$|^#'  # 不自动加eq下标索引
URLJOIN_ATTR = '(url|src|href|-original|-src|-play|-url)$'  # 需要自动urljoin的属性


class jsoup:
    def __init__(self, MY_URL=''):
        self.MY_URL = MY_URL
        self.pdfh_html = ''
        self.pdfa_html = ''

        self.pdfh_doc = None
        self.pdfa_doc = None

    def test(self, text: str, string: str):
        """
        正则判断字符串包含，模仿js的 //.test()
        :param text:
        :param string:
        :return:
        """
        searchObj = re.search(rf'{text}', string, re.M | re.I)
        test_ret = True if searchObj else False
        return test_ret

    def pdfh(self, html, parse: str, add_url=False):
        if not all([html, parse]):
            return ''
        if PARSE_CACHE:
            if self.pdfh_html != html:
                self.pdfh_html = html
                self.pdfh_doc = pq(html)
            doc = self.pdfh_doc
        else:
            doc = pq(html)
        if parse == 'body&&Text' or parse == 'Text':
            text = doc.text()
            return text
        elif parse == 'body&&Html' or parse == 'Html':
            return doc.html()

        option = None
        if parse.find('&&') > -1:
            option = parse.split('&&')[-1]
            parse = '&&'.join(parse.split('&&')[:-1])
        parse = self.parseHikerToJq(parse, True)
        # print(f'pdfh:{parse},option:{option}')
        parses = parse.split(' ')
        ret = None
        for nparse in parses:
            ret = self.parseOneRule(doc, nparse, ret)
            # print(nparse,ret)

        if option:
            if option == 'Text':
                ret = ret.text()
            elif option == 'Html':
                ret = ret.html()
            else:
                ret = ret.attr(option) or ''
                if option.lower().find('style') > -1 and ret.find('url(') > -1:
                    try:
                        ret = re.search('url\((.*?)\)', ret, re.M | re.S).groups()[0]
                    except:
                        pass

                if ret and add_url:
                    need_add = re.search(URLJOIN_ATTR, option, re.M | re.I)
                    if need_add:
                        if 'http' in ret:
                            ret = ret[ret.find('http'):]
                        else:
                            ret = urljoin(self.MY_URL, ret)
        else:
            ret = ret.outerHtml()
        return ret

    def parseOneRule(self, doc, nparse, ret=None):
        """
        解析空格分割后的原生表达式中的一条记录,正确处理eq的索引，返回处理后的ret
        :param doc: pq(html) load 后的pq对象
        :param nparse: 当前单个解析表达式
        :param ret: pd对象结果
        :return:
        """
        if self.test(':eq', nparse):
            nparse_rule = nparse.split(':eq')[0]
            nparse_index = nparse.split(':eq')[1].split('(')[1].split(')')[0]
            try:
                nparse_index = int(nparse_index)
            except:
                nparse_index = 0
            # print(nparse_index)
            if not ret:
                ret = doc(nparse_rule).eq(nparse_index)
            else:
                ret = ret(nparse_rule).eq(nparse_index)
        else:
            if not ret:
                ret = doc(nparse)
            else:
                ret = ret(nparse)
        return ret

    def parseHikerToJq(self, parse, first=False):
        """
         海阔解析表达式转原生表达式,自动补eq,如果传了first就最后一个也取eq(0)
        :param parse:
        :param first:
        :return:
        """
        if parse.find('&&') > -1:
            parse = parse.split('&&')  # 带&&的重新拼接
            new_parses = []  # 构造新的解析表达式列表
            for i in range(len(parse)):
                ps = parse[i].split(' ')[-1]  # 如果分割&&后带空格就取最后一个元素
                if not self.test(NOADD_INDEX, ps):
                    if not first and i >= len(parse) - 1:  # 不传first且遇到最后一个,不用补eq(0)
                        new_parses.append(parse[i])
                    else:
                        new_parses.append(f'{parse[i]}:eq(0)')
                else:
                    new_parses.append(parse[i])
            parse = ' '.join(new_parses)
        else:
            ps = parse.split(' ')[-1]  # 如果带空格就取最后一个元素
            if not self.test(NOADD_INDEX, ps) and first:
                parse = f'{parse}:eq(0)'

        return parse

    def pdfa(self, html, parse: str):
        # 看官方文档才能解决这个问题!!!
        # https://pyquery.readthedocs.io/en/latest/api.html
        if not all([html, parse]):
            return []
        parse = self.parseHikerToJq(parse)
        print(f'pdfa:{parse}')
        if PARSE_CACHE:
            if self.pdfa_html != html:
                self.pdfa_html = html
                self.pdfa_doc = pq(html)
            doc = self.pdfa_doc
        else:
            doc = pq(html)

        parses = parse.split(' ')
        ret = None
        for nparse in parses:
            ret = self.parseOneRule(doc, nparse, ret)
            # print(len(ret),nparse)
        res = [item.outerHtml() for item in ret.items()]
        return res

    def pd(self, html, parse: str):
        return self.pdfh(html, parse, True)

    def pq(self, html: str):
        return pq(html)

    def pjfh(self, html, parse: str, add_url=False):
        if not all([html, parse]):
            return ''
        if isinstance(html, str):
            # print(html)
            try:
                html = ujson.loads(html)
                # html = eval(html)
            except:
                print('字符串转json失败')
                return ''
        if not parse.startswith('$.'):
            parse = f'$.{parse}'
        ret = ''
        for ps in parse.split('||'):
            ret = jsonpath(html, ps)
            if isinstance(ret, list):
                ret = str(ret[0]) if ret[0] else ''
            else:
                ret = str(ret) if ret else ''
            if add_url and ret:
                ret = urljoin(self.MY_URL, ret)
            if ret:
                break
        # print(ret)
        return ret

    def pj(self, html, parse: str):
        return self.pjfh(html, parse, True)

    def pjfa(self, html, parse: str):
        if not all([html, parse]):
            return []
        if isinstance(html, str):
            try:
                html = ujson.loads(html)
            except:
                return []
        if not parse.startswith('$.'):
            parse = f'$.{parse}'
        # print(html)
        # print(parse)
        ret = jsonpath(html, parse)
        # print(ret)
        # print(type(ret))
        # print(type(ret[0]))
        # print(len(ret))
        if isinstance(ret, list) and isinstance(ret[0], list) and len(ret) == 1:
            # print('自动解包')
            ret = ret[0]  # 自动解包
        return ret or []


if __name__ == '__main__':
    pass