from __future__ import unicode_literals
from . import CLIENT, USER_USERNAME, USER_PASSWORD, USER_DESCRIPTION
from . import error_message, success_message
from unittest import TestCase


class TestAuthentication(TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass

    @success_message('Authentication succeeded.')
    def testLogin(self):
        return CLIENT.login(USER_USERNAME, USER_PASSWORD)

    @error_message('Authentication failed (check your username and password).')
    def testLoginWrongPassword(self):
        CLIENT.login(USER_USERNAME, USER_PASSWORD[::-1])

    @error_message('Authentication failed (check your username and password).')
    def testLoginWrongUsername(self):
        CLIENT.login(USER_USERNAME[::-1], USER_PASSWORD)

    def testMe(self):
        CLIENT.login(USER_USERNAME, USER_PASSWORD)
        user = CLIENT.me()
        assert ((user.username == USER_USERNAME) and
                (user.description == USER_DESCRIPTION))

    @success_message('Logout succeeded.')
    def testLogout(self):
        CLIENT.login(USER_USERNAME, USER_PASSWORD)
        return CLIENT.logout()
