from __future__ import unicode_literals
from datetime import datetime
from unittest import TestCase

from . import CLIENT
from helper import initDatabase, emptyDatabase
from helper import USER1_USERNAME, USER1_PASSWORD


class TestUtils(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass
        emptyDatabase()

    def testDate(self):
        serverNow = datetime.strptime(CLIENT.getDate().date,
                                      '%Y-%m-%dT%H:%M:%S.%fZ')
        localNow = datetime.now()
        first = min(serverNow, localNow)
        last = max(serverNow, localNow)
        delta = last - first
        assert delta.days == 0 & delta.seconds < 1
