from pyramid.httpexceptions import HTTPNotFound, HTTPFound
from pyramid.view import view_config
import json

from .models import (
    DBSession,
    Timer,
    )


@view_config(route_name='view_timer_by_name', renderer='iwaitfor:static/index.html')
def view_timer_by_name(request):
    attributes = {}
    metadata = get_default_metadata()
    if request.matchdict['timername']:
        one = DBSession.query(Timer).filter(Timer.name == request.matchdict['timername']).first()
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


@view_config(route_name='get_timer_json', renderer='json')
def get_timer_json(request):
    one = DBSession.query(Timer).filter(Timer.id == request.matchdict['timerid']).first()
    if one:
        attributes = one.get_public_attributes()
    else:
        raise HTTPNotFound

    return attributes


def get_default_metadata():
    return {
        'title': 'Free OnLine Timer',
        'keywords': 'Free OnLine Timer',
        'description': 'Free OnLine Timer',
    }