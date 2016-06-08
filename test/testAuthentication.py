from __future__ import unicode_literals
from . import CLIENT
from .helper import initDatabase, emptyDatabase
from .helper import success_message
from .helper import USER1_USERNAME, USER1_PASSWORD, USER1_DESCRIPTION
from unittest import TestCase

from camomile import CamomileUnauthorized

class TestAuthentication(TestCase):

    def setUp(self):
        initDatabase()

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass
        emptyDatabase()

    @success_message('Authentication succeeded.')
    def testLogin(self):
        return CLIENT.login(USER1_USERNAME, USER1_PASSWORD)

    def testLoginWrongPassword(self):
        with self.assertRaises(CamomileUnauthorized) as cm:
            CLIENT.login(USER1_USERNAME, USER1_PASSWORD[::-1])
        self.assertEqual(cm.exception.message, 'Authentication failed (check your username and password).')

    def testLoginWrongUsername(self):
        with self.assertRaises(CamomileUnauthorized) as cm:
            CLIENT.login(USER1_USERNAME[::-1], USER1_PASSWORD)
        self.assertEqual(cm.exception.message, 'Authentication failed (check your username and password).')

    def testMe(self):
        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        user = CLIENT.me()
        assert ((user.username == USER1_USERNAME) and
                (user.description == USER1_DESCRIPTION))

    @success_message('Logout succeeded.')
    def testLogout(self):
        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        return CLIENT.logout()
