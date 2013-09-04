import os
from pyramid.paster import get_app
application = get_app(
    os.path.dirname(os.path.abspath(__file__)) + '/production.ini', 'main')
