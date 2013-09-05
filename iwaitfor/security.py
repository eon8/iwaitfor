from .models import(
    DBSession,
    User,
    )

def USERS(login):
    return DBSession.query(User).filter(User.login == login).first()

def groupfinder(login, request):
    user = USERS(login)
    return ['userid:%d' % user.id] if user else []