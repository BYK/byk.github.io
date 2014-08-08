#!/usr/bin/env python
# -*- coding: utf-8 -*- #

from hashlib import md5

SITENAME = u"Read at BYK's"
DISQUS_SITENAME = u'readatbyks'
SITEURL = u'http://byk.im'
SITE_SOURCE = u'https://github.com/BYK/byk.github.io'
SITE_TAGLINE = '''
A place where you probably will read things only about programming
'''
SITE_ICON = r'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/////wcHB/wcHB/8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP///////////29vb/8AAAD/AAAA/wAAAP9mZmb/eXl5/3l5ef95eXn/eXl5/3l5ef95eXn/eXl5/wAAAP8AAAD///////////9vb2//AAAA/wAAAP8AAAD///////////////////////////////////////////8AAAD/AAAA////////////b29v/wAAAP8AAAD/AAAA//////8AAAD/AAAA/wAAAP8bGxv/xsbG////////////AAAA/wAAAP///////////29vb/8AAAD/AAAA/wAAAP//////AAAA/76+vv//////s7Oz/wcHB////////////wAAAP8AAAD///////////9vb2//AAAA/wAAAP8AAAD//////wAAAP++vr7//////7Ozs/8XFxf///////////8AAAD/AAAA////////////b29v/wAAAP8AAAD/AAAA//////8AAAD/AAAA/wAAAP8/Pz//3t7e////////////AAAA/wAAAP///////////29vb/8AAAD/AAAA/wAAAP//////AAAA/76+vv/7+/v/XV1d/5GRkf///////////wAAAP8AAAD///////////9vb2//AAAA/wAAAP8AAAD//////wAAAP++vr7/+/v7/11dXf91dXX///////////8AAAD/AAAA////////////b29v/wAAAP8AAAD/AAAA//////8AAAD/AAAA/wAAAP8xMTH/2dnZ////////////AAAA/wAAAP///////////29vb/8AAAD/AAAA/wAAAP/c3Nz//////0FBQf/Ozs7/7e3t/yMjI////////////wAAAP8AAAD///////////9vb2//AAAA/wAAAP8AAAD/3Nzc//////87Ozv/BwcH/yMjI/8AAAD///////////8AAAD/AAAA////////////b29v/wAAAP8AAAD/AAAA/9zc3P//////Ozs7/wAAAP8AAAD/AAAA////////////AAAA/wAAAP///////////29vb/8AAAD/AAAA/wAAAP9mZmb/eXl5/xcXF/8AAAD/AAAA/wAAAP95eXn/eXl5/wAAAP8AAAD////////////BwcH/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/////////////////+bm5v+4uLj/uLi4/7i4uP+4uLj/uLi4/7i4uP+4uLj/uLi4/7i4uP+4uLj/uLi4/7i4uP//////AACcQQAAnEEAAJxBAACcQQAAnEEAAJxBAACcQQAAnEEAAJxBAACcQQAAnEEAAJxBAACcQQAAnEEAAJxBAACcQQ=='
GOOGLE_ANALYTICS = "UA-1202782-5"

THEME = 'neat'
TIMEZONE = 'Asia/Istanbul'

DEFAULT_PAGINATION = 3
PRINT = False

DEFAULT_LANG = 'en'
LOCALE = ('usa', 'en_US')
DEFAULT_CATEGORY = u'programming'

PATH = '../raw'
OUTPUT_PATH = '../'

AUTHOR = u'BYK'
AUTHOR_SHORTBIO = '''
Howdy! I'm a Software Engineer living in Turkey. I LOVE Legos and Python
whereas I write JavaScript for a living at
<a href="http://disqus.com">DISQUS</a>.
'''
AUTHOR_EMAIL = u'ben@byk.im'
AUTHOR_EMAIL_HASH = md5(AUTHOR_EMAIL).hexdigest()
TWITTER_USERNAME = u'madBYK'
GITHUB_USERNAME = u'BYK'
GITHUB_BADGE = True

