from pyramid.httpexceptions import HTTPNotFound, HTTPFound, HTTPBadRequest
from pyramid.view import view_config
import json

from pyramid.security import (
    remember,
    forget,
    authenticated_userid,
    )

from .models import (
    DBSession,
    Timer,
    )

from .security import (
    USERS,
    )


@view_config(route_name='view_timer_by_name', renderer='iwaitfor:static/index.html')
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


@view_config(route_name='view_timer_by_id', renderer='iwaitfor:static/index.html')
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


@view_config(route_name='edit_timer_json', renderer='json')
def edit_timer_json(request):
    #todo refactor
    if request.matchdict['timerid']:

        one = DBSession.query(Timer).filter(Timer.id == request.matchdict['timerid']).first()
        if one:
            # todo add auth for put
            if request.method == 'PUT' and request.json_body['enddate']:
                # todo json_body raises exception
                one.enddate = request.json_body['enddate']

            attributes = one.get_public_attributes()
        else:
            raise HTTPNotFound

    elif request.method == 'POST':
        # todo json_body validation
        new = Timer(title=request.json_body['title'], enddate=request.json_body['enddate'], user={'id': 1})
        DBSession.add(new)
        DBSession.flush()
        attributes = new.get_public_attributes()

    else:
        raise HTTPBadRequest

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
    if request.method == 'POST' and 'login' in request.params:
        login = request.params['login']
        #password = request.params['password']
        user = USERS(login)
        if user:
            headers = remember(request, login)
            request.response.headerlist.extend(headers)
            successful = True
            message = 'Success login'
        else:
            successful = False
            message = 'Failed login'
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
