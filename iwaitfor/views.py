from pyramid.httpexceptions import HTTPNotFound, HTTPFound, HTTPBadRequest
from pyramid.view import view_config, notfound_view_config, forbidden_view_config
import json, requests

from pyramid.security import (
    remember,
    forget,
    authenticated_userid,
    )

from .models import (
    DBSession,
    Timer,
    User
    )

from sqlalchemy import desc
from datetime import datetime

from .security import (
    USERS,
    )

import formencode
from .validators import (TimerValidator)


@view_config(route_name='view_timer_by_name', renderer='iwaitfor:static/index.html', permission='view')
def view_timer_by_name(request):
    attributes = Timer.get_default_attributes()
    metadata = Timer.get_default_metadata()

    if request.matchdict['timername']:
        timer = DBSession.query(Timer). \
            filter(Timer.name == request.matchdict['timername']). \
            filter(Timer.is_approved == True). \
            first()

        if timer is None:
            raise HTTPNotFound

        attributes = timer.get_public_attributes()
        metadata = timer.get_metadata()

    return {'attributes': json.dumps(attributes), 'metadata': metadata}


@view_config(route_name='view_timer_by_id', renderer='iwaitfor:static/index.html', permission='view')
def view_timer_by_id(request):
    timer = DBSession.query(Timer).filter(Timer.id == request.matchdict['timerid']).first()

    if timer is None:
        raise HTTPNotFound

    if timer.name and timer.is_approved:
        raise HTTPFound(location=request.route_url('view_timer_by_name', timername=timer.name))

    attributes = timer.get_public_attributes()
    metadata = timer.get_metadata()

    return {'attributes': json.dumps(attributes), 'metadata': metadata}


@view_config(route_name='add_timer_json', renderer='json', permission='add')
def add_timer_json(request):
    if request.method != 'POST':
        raise HTTPBadRequest

    try:
        data = (TimerValidator()).to_python(request.json_body)

    except ValueError:
        raise HTTPBadRequest

    except formencode.Invalid as e:
        request.response.status = 400
        result = e.unpack_errors()

    else:
        user = USERS(authenticated_userid(request))
        timer = Timer(user=user, **data)
        DBSession.add(timer)
        DBSession.flush()
        result = timer.get_public_attributes()

    return result


# TODO remove duplicate code
@view_config(route_name='edit_timer_json', renderer='json', permission='edit')
def edit_timer_json(request):
    if request.method != 'PUT':
        raise HTTPBadRequest

    try:
        timer = request.context
        body = request.json_body
        body.pop('id')
        data = TimerValidator().to_python(body, timer)

    except ValueError:
        raise HTTPBadRequest

    except formencode.Invalid as e:
        request.response.status = 400
        result = e.unpack_errors()

    else:
        timer.set(**data)
        result = timer.get_public_attributes()

    return result


@view_config(route_name='other_timers', renderer='json')
def other_timers(request):
    # TODO check for timezone in comparison
    popular = DBSession.query(Timer).filter(Timer.enddate > datetime.now()).filter(Timer.is_public == True).order_by(Timer.name).limit(10)
    soon = DBSession.query(Timer).filter(Timer.enddate > datetime.now()).filter(Timer.is_public == True).order_by(Timer.enddate).limit(10)
    news = DBSession.query(Timer).filter(Timer.enddate > datetime.now()).filter(Timer.is_public == True).order_by(desc(Timer.id)).limit(10)

    return {
        'popular': [timer.get_short_public_attributes() for timer in popular],
        'soon': [timer.get_short_public_attributes() for timer in soon],
        'news': [timer.get_short_public_attributes() for timer in news]
    }


@view_config(route_name='login', renderer='json')
def login(request):
    # import sys
    # sys.path.append('/home/dave/dev/pycharm-2.7.3/pycharm-debug-py3k.egg')
    # import pydevd
    # pydevd.settrace('localhost', port=7777, stdoutToServer=True, stderrToServer=True)

    if request.method == 'POST' and 'token' in request.params:
        # TODO более гибко для разных провайдеров
        if (request.matchdict['provider'] == 'google'):
            r = requests.get('https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=' + request.params['token'])
            if (r.status_code == 200):
                token_info = r.json()
                if token_info['audience'] == '818705857064.apps.googleusercontent.com':
                    user = USERS(token_info['email'])
                    if user is None:
                        user = User(login=token_info['email'], name=request.params['displayName'])
                        DBSession.add(user)
                    headers = remember(request, user.login)
                    request.response.headerlist.extend(headers)
                    successful = True
                    message = 'Success login'
                    user_name = user.name
                    timer_ids = [timer.id for timer in user.timers]
                else:
                    raise HTTPBadRequest
            else:
                raise HTTPBadRequest
        else:
            raise HTTPBadRequest
    else:
        raise HTTPBadRequest

    return dict(
        successful=successful,
        message=message,
        user_name=user_name,
        timer_ids=timer_ids
    )


@view_config(route_name='logout', renderer='json')
def logout(request):
    headers = forget(request)
    request.response.headerlist.extend(headers)
    return {}


    # def validate_page(title, body):
    #     errors = []
    #
    #     title = title.strip()
    #     if not title:
    #         errors.append('Title may not be empty')
    #     elif len(title) > 32:
    #         errors.append('Title may not be longer than 32 characters')
    #
    #     body = body.strip()
    #     if not body:
    #         errors.append('Body may not be empty')
    #
    #     return {
    #         'title': title,
    #         'body': body,
    #         'errors': errors,
    #     }


@notfound_view_config(renderer='404.mako')
def notfound_view(request):
    request.response.status = '404 Not Found'
    return {}


@forbidden_view_config(renderer='403.mako')
def forbidden_view(request):
    request.response.status = '403 Forbidden'
    return {}
