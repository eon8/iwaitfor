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
        new = Timer(title=request.json_body['title'],
                    name=request.json_body['name'] if request.json_body['name'] else None,
                    description=request.json_body['description'],
                    enddate=request.json_body['enddate'],
                    is_public=request.json_body['is_public'],
                    user=user)
        DBSession.add(new)
        DBSession.flush()
        attributes = {'id': new.id}

    else:
        raise HTTPBadRequest

    return attributes


@view_config(route_name='edit_timer_json', renderer='json', permission='edit')
def edit_timer_json(request):
    timer = request.context
    if request.method == 'PUT' and request.json_body['enddate']:
        # todo json_body raises exception
        timer.title = request.json_body['title']
        timer.name = request.json_body['name'] if request.json_body['name'] else None
        timer.description = request.json_body['description']
        timer.enddate = request.json_body['enddate']
        timer.is_public = request.json_body['is_public']
        timer.is_approved = timer.name and len(timer.name) > Timer.__name_limit__

    return {'id': timer.id}


def get_default_metadata():
    return {
        'title': 'Free OnLine Timer',
        'keywords': 'Free OnLine Timer',
        'description': 'Free OnLine Timer',
    }

# TODO to user model as static method
def get_default_attributes():
    return {
        'title': 'Free OnLine Timer',
        'description': 'new timer'
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