from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    )

from zope.sqlalchemy import ZopeTransactionExtension

from datetime import datetime

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()


class Timer(Base):
    __tablename__ = 'timers'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    title = Column(String(150))
    description = Column(Text)
    enddate = Column(DateTime(timezone=True))
    created = Column(DateTime(timezone=True))
    updated = Column(DateTime(timezone=True))
    user_id = Column(Integer)
    is_approved = Column(Boolean)
    is_public = Column(Boolean)
    view_count = Column(Integer)

    def __init__(self, title, enddate, user, name=None, description=''):
        self.name = name
        self.title = title
        self.description = description
        self.enddate = enddate
        self.created = self.updated = datetime.now().isoformat()
        self.user_id = user['id']
        self.is_approved = True
        self.is_public = True
        self.view_count = 0

    def get_public_attributes(self):
        return {'id': self.id,
                'title': self.title,
                'name': self.name,
                'h': '00',
                'm': '00',
                's': '00',
                'enddate': str(self.enddate)}

    def get_metadata(self):
        return {'title': self.title,
                'keywords': self.title,
                'description': self.description}