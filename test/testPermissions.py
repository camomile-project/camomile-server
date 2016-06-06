from __future__ import unicode_literals
import string
import random
from unittest import TestCase


from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import ADMIN_USERNAME, ADMIN_PASSWORD
from .helper import USER0_USERNAME, USER0_PASSWORD
from .helper import USER1_USERNAME, USER1_PASSWORD
from .helper import USER2_USERNAME, USER2_PASSWORD
from .helper import USER3_USERNAME, USER3_PASSWORD

from .helper import initDatabase, emptyDatabase
from .helper import success_message, error_message
from requests.exceptions import HTTPError


class TestCorpusPermissions(TestCase):

    def setUp(self):

        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        self.corpus = CLIENT.createCorpus('corpus', returns_id=True)

        self.user0 = CLIENT.getUsers(username=USER0_USERNAME, returns_id=True)[0]
        self.user1 = CLIENT.getUsers(username=USER1_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.READ, user=self.user1)

        self.user2 = CLIENT.getUsers(username=USER2_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.WRITE, user=self.user2)

        self.user3 = CLIENT.getUsers(username=USER3_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.ADMIN, user=self.user3)

    def testCreateCorpus(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createCorpus('new corpus')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied (admin only).'})

    def testGetCorpus(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getCorpus(self.corpus)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        assert CLIENT.getCorpus(self.corpus)._id == self.corpus

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        assert CLIENT.getCorpus(self.corpus)._id == self.corpus

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        assert CLIENT.getCorpus(self.corpus)._id == self.corpus

    def testUpdateCorpus(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateCorpus(self.corpus, name='new_name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateCorpus(self.corpus, name='new_name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateCorpus(self.corpus, name='new_name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        assert CLIENT.updateCorpus(self.corpus, name='new_name').name == 'new_name'

    def testDeleteCorpus(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteCorpus(self.corpus)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied (admin only).'})

    def testGetCorpusMedia(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getMedia(corpus=self.corpus, returns_id=True)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        media = CLIENT.getMedia(corpus=self.corpus, returns_id=True)
        assert len(media) == 0

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        media = CLIENT.getMedia(corpus=self.corpus, returns_id=True)
        assert len(media) == 0

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        media = CLIENT.getMedia(corpus=self.corpus, returns_id=True)
        assert len(media) == 0

    def testCreateMedium(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createMedium(self.corpus, 'medium')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createMedium(self.corpus, 'medium')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createMedium(self.corpus, 'medium')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        medium = CLIENT.createMedium(self.corpus, 'medium')
        assert medium.name == 'medium'

    def testGetCorpusLayers(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getLayers(corpus=self.corpus, returns_id=True)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        layers = CLIENT.getLayers(corpus=self.corpus, returns_id=True)
        assert len(layers) == 0

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        layers = CLIENT.getLayers(corpus=self.corpus, returns_id=True)
        assert len(layers) == 0

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        layers = CLIENT.getLayers(corpus=self.corpus, returns_id=True)
        assert len(layers) == 0

    def testCreateLayer(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createLayer(self.corpus, 'layer', fragment_type='fragment_type', data_type='data_type')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createLayer(self.corpus, 'layer', fragment_type='fragment_type', data_type='data_type')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        layer = CLIENT.createLayer(self.corpus, 'layer', fragment_type='fragment_type', data_type='data_type')
        assert layer.name == 'layer'

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        layer = CLIENT.createLayer(self.corpus, 'layer', fragment_type='fragment_type', data_type='data_type')
        assert layer.name == 'layer'

    def testGetMedata(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getCorpusMetadata(self.corpus)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        keys = CLIENT.getCorpusMetadata(self.corpus)
        assert keys == []

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        keys = CLIENT.getCorpusMetadata(self.corpus)
        assert keys == []

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        keys = CLIENT.getCorpusMetadata(self.corpus)
        assert keys == []

    def testSetMetadata(self):
        pass

    def testDeleteMetadata(self):
        pass

class TestMediumPermissions(TestCase):

    def setUp(self):

        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        self.corpus = CLIENT.createCorpus('corpus', returns_id=True)
        self.medium = CLIENT.createMedium(self.corpus, 'medium', returns_id=True)

        self.user0 = CLIENT.getUsers(username=USER0_USERNAME, returns_id=True)[0]
        self.user1 = CLIENT.getUsers(username=USER1_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.READ, user=self.user1)

        self.user2 = CLIENT.getUsers(username=USER2_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.WRITE, user=self.user2)

        self.user3 = CLIENT.getUsers(username=USER3_USERNAME, returns_id=True)[0]
        CLIENT.setCorpusPermissions(self.corpus, CLIENT.ADMIN, user=self.user3)

    def testGetAllMedia(self):

        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
        media = CLIENT.getMedia()
        assert media[0].name == 'medium'

        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getMedia()
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied (root only).'})

    def testGetOneMedium(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getMedium(self.medium)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        medium = CLIENT.getMedium(self.medium)
        assert medium.name == 'medium'

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        medium = CLIENT.getMedium(self.medium)
        assert medium.name == 'medium'

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        medium = CLIENT.getMedium(self.medium)
        assert medium.name == 'medium'

    def testUpdateOneMedium(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateMedium(self.medium, url='url')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateMedium(self.medium, url='url')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateMedium(self.medium, url='url')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        medium = CLIENT.updateMedium(self.medium, url='url')
        assert medium.url == 'url'

    def testDeleteOneMedium(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteMedium(self.medium)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteMedium(self.medium)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteMedium(self.medium)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        result = CLIENT.deleteMedium(self.medium)
        self.assertDictEqual(result, {'success': 'Successfully deleted.'})


class TestLayerPermissions(TestCase):

    def setUp(self):

        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        self.corpus = CLIENT.createCorpus('corpus', returns_id=True)
        self.layer = CLIENT.createLayer(self.corpus, 'layer', returns_id=True)
        self.annotation = CLIENT.createAnnotation(self.layer, fragment='fragment', data='data', returns_id=True)

        self.user0 = CLIENT.getUsers(username=USER0_USERNAME, returns_id=True)[0]
        self.user1 = CLIENT.getUsers(username=USER1_USERNAME, returns_id=True)[0]
        CLIENT.setLayerPermissions(self.layer, CLIENT.READ, user=self.user1)

        self.user2 = CLIENT.getUsers(username=USER2_USERNAME, returns_id=True)[0]
        CLIENT.setLayerPermissions(self.layer, CLIENT.WRITE, user=self.user2)

        self.user3 = CLIENT.getUsers(username=USER3_USERNAME, returns_id=True)[0]
        CLIENT.setLayerPermissions(self.layer, CLIENT.ADMIN, user=self.user3)

    def testGetAllLayers(self):

        CLIENT.login(ROOT_USERNAME, ROOT_PASSWORD)
        layers = CLIENT.getLayers()
        assert layers[0].name == 'layer'

        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getLayers()
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied (root only).'})

    def testGetOneLayer(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getLayer(self.layer)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        layer = CLIENT.getLayer(self.layer)
        assert layer.name == 'layer'

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        layer = CLIENT.getLayer(self.layer)
        assert layer.name == 'layer'

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        layer = CLIENT.getLayer(self.layer)
        assert layer.name == 'layer'

    def testUpdateOneLayer(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateLayer(self.layer, name='new layer name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateLayer(self.layer, name='new layer name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.updateLayer(self.layer, name='new layer name')
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        layer = CLIENT.updateLayer(self.layer, name='new layer name')
        assert layer.name == 'new layer name'

    def testDeleteOneLayer(self):

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteLayer(self.layer)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteLayer(self.layer)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.deleteLayer(self.layer)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        result = CLIENT.deleteLayer(self.layer)
        self.assertDictEqual(result, {'success': 'Successfully deleted.'})

    def testGetLayerAnnotations(self):  # READ

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getAnnotations(layer=self.layer)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        annotations = CLIENT.getAnnotations(layer=self.layer)
        assert annotations[0]._id == self.annotation

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        annotations = CLIENT.getAnnotations(layer=self.layer)
        assert annotations[0]._id == self.annotation

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        annotations = CLIENT.getAnnotations(layer=self.layer)
        assert annotations[0]._id == self.annotation

    def testCreateLayerAnnotation(self):  # WRITE

        CLIENT.login(USER0_USERNAME, USER0_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createAnnotation(self.layer, fragment='fragment', data='data', returns_id=True)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER1_USERNAME, USER1_PASSWORD)
        with self.assertRaises(HTTPError) as cm:
            CLIENT.createAnnotation(self.layer, fragment='fragment', data='data', returns_id=True)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Access denied.'})

        CLIENT.login(USER2_USERNAME, USER2_PASSWORD)
        annotation = CLIENT.createAnnotation(self.layer, fragment='fragment', data='data')
        assert annotation.fragment == 'fragment'

        CLIENT.login(USER3_USERNAME, USER3_PASSWORD)
        annotation = CLIENT.createAnnotation(self.layer, fragment='fragment', data='data')
        assert annotation.fragment == 'fragment'
