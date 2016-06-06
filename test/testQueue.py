from __future__ import unicode_literals
from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import initDatabase, emptyDatabase
from .helper import error_message, success_message
from unittest import TestCase


class TestQueue(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except Exception:
            pass
        emptyDatabase()
