from __future__ import unicode_literals
from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import ADMIN_USERNAME, ADMIN_PASSWORD
from .helper import initDatabase, emptyDatabase
from .helper import success_message
from unittest import TestCase
from camomile import CamomileForbidden


class TestAsRoot(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except Exception:
            pass
        emptyDatabase()

    @success_message('Successfully deleted.')
    def testDeleteUser(self):
        user = CLIENT.createUser('whatever', 'whatever', returns_id=True)
        return CLIENT.deleteUser(user)

    @success_message('Successfully deleted.')
    def testDeleteGroup(self):
        group = CLIENT.createGroup('whatever', returns_id=True)
        return CLIENT.deleteGroup(group)

    def testGetAllMedia(self):
        self.assertIsInstance(CLIENT.getMedia(), list)

    def testGetAllLayers(self):
        self.assertIsInstance(CLIENT.getLayers(), list)

    def testGetAllAnnotations(self):
        self.assertIsInstance(CLIENT.getAnnotations(), list)

    def testGetAllQueues(self):
        self.assertIsInstance(CLIENT.getQueues(), list)


class TestAsAdmin(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

    def tearDown(self):
        try:
            CLIENT.logout()
        except Exception:
            pass
        emptyDatabase()

    def testDeleteGroup(self):
        with self.assertRaises(CamomileForbidden) as cm:
            CLIENT.deleteGroup('5727137292f2900f241a8493')
        self.assertEqual(cm.exception.message, 'Access denied (root only).')

    def testGetAllMedia(self):
        with self.assertRaises(CamomileForbidden) as cm:
            CLIENT.getMedia()
        self.assertEqual(cm.exception.message, 'Access denied (root only).')

    def testGetAllLayers(self):
        with self.assertRaises(CamomileForbidden) as cm:
            CLIENT.getLayers()
        self.assertEqual(cm.exception.message, 'Access denied (root only).')

    def testGetAllAnnotations(self):
        with self.assertRaises(CamomileForbidden) as cm:
            CLIENT.getAnnotations()
        self.assertEqual(cm.exception.message, 'Access denied (root only).')
