import formencode
from formencode import validators

from .models import (
    DBSession,
    Timer
    )


class UniqueTimerName(formencode.FancyValidator):
    def _convert_to_python(self, value, state):
        ### state may be a timer
        if (state is None or state.name != value) and DBSession.query(Timer).filter(Timer.name == value).first():
            raise formencode.Invalid(
                'That name already exists',
                value, state)
        return value


class TimerValidator(formencode.Schema):
    title = validators.String(not_empty=True, strip=True)
    name = formencode.Pipe(validators.PlainText(if_empty=None, strip=True),
                          UniqueTimerName())
    description = validators.String()
    enddate = formencode.Pipe(validators.Regex(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$'))
    is_public = validators.Bool()