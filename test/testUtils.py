from __future__ import unicode_literals
from . import CLIENT, USER_USERNAME, USER_PASSWORD
from datetime import datetime
from unittest import TestCase


class TestUtils(TestCase):

    def setUp(self):
        CLIENT.login(USER_USERNAME, USER_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass

    def testDate(self):
        serverNow = datetime.strptime(CLIENT.getDate().date,
                                      '%Y-%m-%dT%H:%M:%S.%fZ')
        localNow = datetime.now()
        first = min(serverNow, localNow)
        last = max(serverNow, localNow)
        delta = last - first
        assert delta.days == 0 & delta.seconds < 1
