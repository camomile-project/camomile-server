from __future__ import unicode_literals
import string
import random
from unittest import TestCase


from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import ADMIN_USERNAME, ADMIN_PASSWORD
from .helper import USER1_USERNAME, USER1_PASSWORD
from .helper import initDatabase, emptyDatabase
from .helper import success_message

from camomile import CamomileForbidden, CamomileNotFound, CamomileBadRequest, CamomileInternalError


def createRandomUser(role='user'):

    username = ''.join(random.choice(string.ascii_lowercase)
                       for _ in range(random.randint(10, 15)))

    password = ''.join(random.choice(string.ascii_lowercase +
                                     string.ascii_uppercase +
                                     string.digits)
                       for _ in range(random.randint(20, 30)))

    description = ''.join(random.choice(string.ascii_lowercase +
                                        string.ascii_uppercase +
                                        string.digits + ' ')
                          for _ in range(random.randint(5, 15)))

    return {'username': username, 'password': password,
            'description': description, 'role': role}


class TestUserAsRoot(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass
        emptyDatabase()

    @success_message('Successfully deleted.')
    def testDeleteUser(self):
        randomUser = createRandomUser()
        user = CLIENT.createUser(randomUser['username'],
                                 randomUser['password'],
                                 description=randomUser['description'],
                                 role=randomUser['role'])
        return CLIENT.deleteUser(user._id)


class TestUserAsAdmin(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass
        emptyDatabase()

    def testCreateUser(self):
        randomUser = createRandomUser()
        user = CLIENT.createUser(randomUser['username'],
                                 randomUser['password'],
                                 description=randomUser['description'],
                                 role=randomUser['role'])
        CLIENT.login(randomUser['username'], randomUser['password'])
        self.assertDictEqual(CLIENT.me(), user)

    def testInvalidUsername(self):
        randomUser = createRandomUser()
        with self.assertRaises(CamomileBadRequest) as cm:
            CLIENT.createUser('white space',
                              randomUser['password'],
                              description=randomUser['description'],
                              role=randomUser['role'])
        self.assertEqual(cm.exception.message, 'Invalid username.')

    def testInvalidPassword(self):
        randomUser = createRandomUser()
        with self.assertRaises(CamomileBadRequest) as cm:
            CLIENT.createUser(randomUser['username'],
                              'short',
                              description=randomUser['description'],
                              role=randomUser['role'])
        self.assertEqual(cm.exception.message, 'Invalid password.')

    def testInvalidRole(self):
        randomUser = createRandomUser()
        with self.assertRaises(CamomileBadRequest) as cm:
            CLIENT.createUser(randomUser['username'],
                              randomUser['password'],
                              description=randomUser['description'],
                              role='god')
        self.assertEqual(cm.exception.message, 'Invalid role.')

    def testCreateUserExistingName(self):
        randomUser = createRandomUser()
        CLIENT.createUser(randomUser['username'],
                          randomUser['password'],
                          description=randomUser['description'],
                          role=randomUser['role'])
        with self.assertRaises(CamomileInternalError) as cm:
            CLIENT.createUser(randomUser['username'],
                              randomUser['password'],
                              description=randomUser['description'],
                              role=randomUser['role'])
        self.assertEqual(cm.exception.message, 'Invalid username (duplicate).')

    def testGetUsers(self):
        assert isinstance(CLIENT.getUsers(), list)

    def testGetUserByID(self):
        user = CLIENT.me()
        assert CLIENT.getUser(user._id).username == ADMIN_USERNAME

    def testGetUserByWrongID(self):
        user = CLIENT.me()
        with self.assertRaises(CamomileNotFound) as cm:
            CLIENT.getUser(user._id[::-1])
        self.assertEqual(cm.exception.message, 'User does not exist.')


class TestUserAsRegularUser(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except:
            pass
        emptyDatabase()

    def testCreateUser(self):
        randomUser = createRandomUser()
        with self.assertRaises(CamomileForbidden) as cm:
            CLIENT.createUser(randomUser['username'],
                              randomUser['password'],
                              description=randomUser['description'],
                              role=randomUser['role'])
        self.assertEqual(cm.exception.message, 'Access denied (admin only).')
