from __future__ import unicode_literals
from . import CLIENT
from . import ROOT_USERNAME, ROOT_PASSWORD
from . import ADMIN_USERNAME, ADMIN_PASSWORD
from . import error_message, success_message
from unittest import TestCase


class TestQueue(TestCase):

    def setUp(self):
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
        pass

    def tearDown(self):
        try:
            CLIENT.logout()
        except Exception:
            pass

