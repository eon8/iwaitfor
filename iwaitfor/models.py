from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    relationship,
    )

from zope.sqlalchemy import ZopeTransactionExtension

from datetime import datetime

from pyramid.security import (
    Everyone,
    Authenticated,
    Allow,
    Deny,
    ALL_PERMISSIONS
    )

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()


class RootFactory(object):
    __acl__ = [(Allow, Everyone, 'view'),
               (Allow, 'group:admin', ALL_PERMISSIONS)]

    def __init__(self, request):
        pass


class TimerFactory(object):
    __acl__ = [(Allow, Authenticated, 'add')]

    def __init__(self, request):
        self.request = request

    def __getitem__(self, item):
        # TODO maybe there is a get_by_id method
        return DBSession.query(Timer).filter(Timer.id == item).first()
# TODO check for 404 if there is no timer ^

class Timer(Base):
    @property
    def __acl__(self):
        return [
            (Allow, 'userid:' + str(self.user_id), 'edit'),
            (Allow, 'userid:' + str(self.user_id), 'delete'),
            (Allow, 'group:editor', 'edit'),
            (Allow, 'group:editor', 'delete'),
        ]

    __tablename__ = 'timers'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    title = Column(String(150))
    description = Column(Text)
    enddate = Column(DateTime(timezone=True))
    created = Column(DateTime(timezone=True))
    updated = Column(DateTime(timezone=True))
    user_id = Column(Integer, ForeignKey('users.id'))
    is_approved = Column(Boolean)
    is_public = Column(Boolean)
    view_count = Column(Integer)

    def __init__(self, title, enddate, user, name=None, description=''):
        self.name = name
        self.title = title
        self.description = description
        self.enddate = enddate
        self.created = self.updated = datetime.now().isoformat()
        self.user_id = user.id
        self.is_approved = True
        self.is_public = True
        self.view_count = 0

    def get_public_attributes(self):
        return {'id': self.id,
                'name': self.name,
                'title': self.title,
                'description': self.description,
                'enddate': str(self.enddate)}

    def get_metadata(self):
        return {'title': self.title,
                'keywords': self.title,
                'description': self.description}


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    login = Column(String(50), unique=True)
    name = Column(String(250))
    timers = relationship(Timer, backref="user")

    def __init__(self, login, name=''):
        self.login = login
        self.name = name

    def check_password(self, passwd):
        return self.password == passwd