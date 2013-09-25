from pyramid.httpexceptions import HTTPNotFound, HTTPFound, HTTPBadRequest
from pyramid.view import view_config
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

from .security import (
    USERS,
    )
#TODO edit 403 failed permission check message

@view_config(route_name='view_timer_by_name', renderer='iwaitfor:static/index.html', permission='view')
def view_timer_by_name(request):
    attributes = get_default_attributes()
    metadata = get_default_metadata()
    if request.matchdict['timername']:
        one = DBSession.query(Timer). \
            filter(Timer.name == request.matchdict['timername']). \
            filter(Timer.is_approved == True). \
            first()
        if one:
            attributes = one.get_public_attributes()
            metadata = one.get_metadata()
        else:
            raise HTTPNotFound

    return {'attributes': json.dumps(attributes), 'metadata': metadata}


@view_config(route_name='view_timer_by_id', renderer='iwaitfor:static/index.html', permission='view')
def view_timer_by_id(request):
    one = DBSession.query(Timer).filter(Timer.id == request.matchdict['timerid']).first()
    if one:
        # todo is is_approved a good name?
        if one.name and one.is_approved:
            raise HTTPFound(location=request.route_url('view_timer_by_name', timername=one.name))
        attributes = one.get_public_attributes()
        metadata = one.get_metadata()
    else:
        raise HTTPNotFound

    return {'attributes': json.dumps(attributes), 'metadata': metadata}


@view_config(route_name='add_timer_json', renderer='json', permission='add')
def add_timer_json(request):
    if request.method == 'POST':
        # todo json_body validation
        user = USERS(authenticated_userid(request))
        new = Timer(title=request.json_body['title'], enddate=request.json_body['enddate'], user=user)
        DBSession.add(new)
        DBSession.flush()
        attributes = new.get_public_attributes()
        # TODO after adding of a new timer make a redirect or use backbone client side router for new url

    else:
        raise HTTPBadRequest

    return attributes


@view_config(route_name='edit_timer_json', renderer='json', permission='edit')
def edit_timer_json(request):
    timer = request.context
    if request.method == 'PUT' and request.json_body['enddate']:
        # todo json_body raises exception
        timer.enddate = request.json_body['enddate']

    attributes = timer.get_public_attributes()

    return attributes


def get_default_metadata():
    return {
        'title': 'Free OnLine Timer',
        'keywords': 'Free OnLine Timer',
        'description': 'Free OnLine Timer',
    }


def get_default_attributes():
    return {
        'title': 'Free OnLine Timer',
        'h': '00',
        'm': '00',
        's': '00',
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
                    if not user:
                        user = User(login=token_info['email'])
                        DBSession.add(user)
                    headers = remember(request, user.login)
                    request.response.headerlist.extend(headers)
                    successful = True
                    message = 'Success login'
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
        message=message
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