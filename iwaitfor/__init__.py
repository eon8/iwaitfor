from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from .models import (
    DBSession,
    Base,
    )

from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from .security import groupfinder

from .models import RootFactory, TimerFactory

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    authn_policy = AuthTktAuthenticationPolicy('sofuckinsecret', callback=groupfinder, hashalg='sha512')
    authz_policy = ACLAuthorizationPolicy()
    config = Configurator(settings=settings,
                          root_factory=RootFactory,
                          authentication_policy=authn_policy,
                          authorization_policy=authz_policy)
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_renderer('.html', 'pyramid.mako_templating.renderer_factory')
    config.add_route('add_timer_json', '/q/timer', factory=TimerFactory)
    config.add_route('edit_timer_json', '/q/timer/{timerid:\d+}', factory=TimerFactory, traverse='/{timerid}')
    config.add_route('login', '/q/login/{provider}')
    config.add_route('logout', '/q/logout')
    config.add_route('view_timer_by_id', '/id/{timerid:\d+}')
    config.add_route('view_timer_by_name', '/{timername:[\w-]*}')
    config.scan()
    return config.make_wsgi_app()