import os
from pyramid.paster import get_app
application = get_app(
    os.path.dirname(os.path.abspath(__file__)) + '/production.ini', 'main')


# http://flask.pocoo.org/docs/deploying/uwsgi/
# http://bartek.im/blog/2012/07/08/simplicity-nginx-uwsgi-deployment.html
# http://uwsgi-docs.readthedocs.org/en/latest/WSGIquickstart.html   putting behind
# http://uwsgi-docs.readthedocs.org/en/latest/Upstart.html