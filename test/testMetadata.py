from __future__ import unicode_literals
from unittest import TestCase
import tempfile

from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import ADMIN_USERNAME, ADMIN_PASSWORD

from .helper import initDatabase
from .helper import success_message, error_message
from requests.exceptions import HTTPError

from base64 import b64decode, b64encode
import os.path
import time


class TestCorpusMetadata(TestCase):

    METADATA = {
        'key1': 'value',
        'key2': {'key1': 'other_value',
                 'key2': ['item1', 'item2']},
        'key3': {'sub_key': {'sub_sub_key1': 'string',
                             'sub_sub_key2': 3}}
    }

    LOREM = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        self.corpusWithMetadata = CLIENT.createCorpus('corpus1', returns_id=True)
        CLIENT.setCorpusMetadata(self.corpusWithMetadata, self.METADATA)

        self.corpusWithoutMetadata = CLIENT.createCorpus('corpus2', returns_id=True)

    def testGetMetadata(self):
        keys = CLIENT.getCorpusMetadata(self.corpusWithMetadata)
        assert sorted(keys) == sorted(self.METADATA)

    def testGetMetadataEmpty(self):
        keys = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataKeysEmpty(self):
        keys = CLIENT.getCorpusMetadataKeys(self.corpusWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataByPath(self):
        path = 'key1'
        metadata = CLIENT.getCorpusMetadata(self.corpusWithMetadata, path=path)
        assert self.METADATA['key1'] == metadata

        path = 'key2.key2'
        metadata = CLIENT.getCorpusMetadata(self.corpusWithMetadata, path=path)
        assert self.METADATA['key2']['key2'] == metadata

        path = 'key3.sub_key.sub_sub_key2'
        metadata = CLIENT.getCorpusMetadata(self.corpusWithMetadata, path=path)
        assert self.METADATA['key3']['sub_key']['sub_sub_key2'] == metadata

    def testGetMetadataByWrongPath(self):
        path = 'key1.sub_key'
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getCorpusMetadata(self.corpusWithMetadata, path=path)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Metadata does not exist.'})

    def testGetMetadataKeysByWrongPath(self):
        path = 'key1.sub_key'
        keys = CLIENT.getCorpusMetadataKeys(self.corpusWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysAtLeaf(self):
        path = 'key1'
        keys = CLIENT.getCorpusMetadataKeys(self.corpusWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysByPath(self):
        path = 'key3.sub_key'
        metadata = CLIENT.getCorpusMetadataKeys(self.corpusWithMetadata, path=path)
        assert sorted(self.METADATA['key3']['sub_key']) == sorted(metadata)

    @success_message('Successfully created.')
    def testSetMetadataSuccess(self):
        return CLIENT.setCorpusMetadata(self.corpusWithoutMetadata, self.METADATA)

    def testKeyWithDot(self):
        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata, {'key.subkey': 'value'})
        keys = CLIENT.getCorpusMetadataKeys(self.corpusWithoutMetadata)
        assert keys == ['key.subkey']

    def testKeyWithComma(self):
        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata, {'key,subkey': 'value'})
        keys = CLIENT.getCorpusMetadataKeys(self.corpusWithoutMetadata)
        assert keys == ['key,subkey']

    def testSetMetadataByPath(self):
        CLIENT.setCorpusMetadata(
            self.corpusWithoutMetadata, 'value', path='key')
        metadata = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, path='key')
        assert metadata == 'value'

    def testSetMetadataByPathSubkey(self):
        CLIENT.setCorpusMetadata(
            self.corpusWithoutMetadata, 'value', path='key.subkey')
        metadata = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, path='key')
        assert metadata == {'subkey': 'value'}

    def testSetStructuredMetadataByPath(self):
        CLIENT.setCorpusMetadata(
            self.corpusWithoutMetadata, self.METADATA, path='key')
        metadata = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, path='key')
        assert metadata == self.METADATA

    def testUpdateMetadataByPath(self):
        CLIENT.setCorpusMetadata(self.corpusWithMetadata, 'updated_value', path='key2.key1')
        metadata = CLIENT.getCorpusMetadata(self.corpusWithMetadata, path='key2')
        assert metadata == {'key1': 'updated_value', 'key2': ['item1', 'item2']}
    #
    def testUpdateStructuredMetadata(self):
        metadata = {
            'key2': {'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key2': 4}}}
        CLIENT.setCorpusMetadata(self.corpusWithMetadata, metadata)

        updated_metadata = {
            'key1': 'value',
            'key2': {'key1': 'other_value',
                     'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key1': 'string',
                                 'sub_sub_key2': 4}}
        }
        assert CLIENT.getCorpusMetadata(self.corpusWithMetadata, 'key1') == updated_metadata['key1']
        assert CLIENT.getCorpusMetadata(self.corpusWithMetadata, 'key2') == updated_metadata['key2']
        assert CLIENT.getCorpusMetadata(self.corpusWithMetadata, 'key3') == updated_metadata['key3']

    def testAddMetadataKeyAtRoot(self):
        metadata = {'key4': 'value4'}
        CLIENT.setCorpusMetadata(self.corpusWithMetadata, metadata)
        assert sorted(CLIENT.getCorpusMetadata(self.corpusWithMetadata)) == ['key1', 'key2', 'key3', 'key4']

    def testDeleteMetadataPartial(self):
        CLIENT.deleteCorpusMetadata(self.corpusWithMetadata, path='key1')
        assert sorted(CLIENT.getCorpusMetadataKeys(self.corpusWithMetadata)) == ['key2', 'key3']

    @success_message('Successfully created.')
    def testSetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        return CLIENT.sendCorpusMetadataFile(
            self.corpusWithoutMetadata, 'key.subkey', uploaded)

    def testSetAndGetMetadataEmptyFile(self):
        _, uploaded = tempfile.mkstemp()
        CLIENT.sendCorpusMetadataFile(
            self.corpusWithoutMetadata, 'key', uploaded)

        time.sleep(1.0)

        received = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, path='key')

        received.pop('url')
        expected = {'type': 'file', 'data': '', 'filename': os.path.basename(uploaded)}

        self.assertDictEqual(received, expected)

    def testGetMetadataFileContent(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        CLIENT.sendCorpusMetadataFile(
            self.corpusWithoutMetadata, 'key.subkey', uploaded)

        result = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata,
                                           path='key.subkey', file=True)
        self.assertEqual(result, self.LOREM)

    def testGetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        CLIENT.sendCorpusMetadataFile(
            self.corpusWithoutMetadata, 'key.subkey', uploaded)

        received = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata,
                                            path='key.subkey')

        with open(uploaded, 'rb') as f:
            content = f.read()

        url = '/corpus/{corpus}/metadata/key.subkey?file'.format(
            corpus=self.corpusWithoutMetadata)
        filename = os.path.basename(uploaded)
        data = b64encode(content).decode()

        expected = {'type': 'file',
                    'filename': filename,
                    'url': url,
                    'data': data}

        self.assertDictEqual(expected, received)

    def testOverwriteWholeSubtreeBis(self):

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 {'subkey1': 'value1', 'subkey2': 'value2'},
                                 path='key')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value', path='key')

        received = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, 'key')
        expected = 'value'
        assert received == expected, received


    def testOverwriteWholeSubtree(self):

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value1', path='key.subkey1')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value2', path='key.subkey2')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value', path='key')

        received = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, 'key')
        expected = 'value'
        assert received == expected, received

    def testOverwriteWholeSubSubtree(self):

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value1', path='key.subkey1.subsubkey1')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value2', path='key.subkey1.subsubkey2')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value3', path='key.subkey2.subsubkey3')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value4', path='key.subkey2.subsubkey4')

        CLIENT.setCorpusMetadata(self.corpusWithoutMetadata,
                                 'value', path='key')

        received = CLIENT.getCorpusMetadata(self.corpusWithoutMetadata, 'key')
        self.assertEqual(received, 'value')

    def testGithubIssueNumber64(self):
        with self.assertRaises(TypeError) as cm:
            _ = CLIENT.setCorpusMetadata(
                self.corpusWithoutMetadata,
                path='mymtdata', datas={'gt': 'dzq'})


class TestLayerMetadata(TestCase):

    METADATA = {
        'key1': 'value',
        'key2': {'key1': 'other_value',
                 'key2': ['item1', 'item2']},
        'key3': {'sub_key': {'sub_sub_key1': 'string',
                             'sub_sub_key2': 3}}
    }

    LOREM = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        corpus = CLIENT.createCorpus('corpus', returns_id=True)

        self.layerWithMetadata = CLIENT.createLayer(corpus, name='layer1', returns_id=True)
        CLIENT.setLayerMetadata(self.layerWithMetadata, self.METADATA)

        self.layerWithoutMetadata = CLIENT.createLayer(corpus, name='layer2', returns_id=True)

    def testGetMetadata(self):
        keys = CLIENT.getLayerMetadata(self.layerWithMetadata)
        assert sorted(keys) == sorted(self.METADATA)

    def testGetMetadataEmpty(self):
        keys = CLIENT.getLayerMetadata(self.layerWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataKeysEmpty(self):
        keys = CLIENT.getLayerMetadataKeys(self.layerWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataByPath(self):
        path = 'key1'
        metadata = CLIENT.getLayerMetadata(self.layerWithMetadata, path=path)
        assert self.METADATA['key1'] == metadata

        path = 'key2.key2'
        metadata = CLIENT.getLayerMetadata(self.layerWithMetadata, path=path)
        assert self.METADATA['key2']['key2'] == metadata

        path = 'key3.sub_key.sub_sub_key2'
        metadata = CLIENT.getLayerMetadata(self.layerWithMetadata, path=path)
        assert self.METADATA['key3']['sub_key']['sub_sub_key2'] == metadata

    def testGetMetadataByWrongPath(self):
        path = 'key1.sub_key'
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getLayerMetadata(self.layerWithMetadata, path=path)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Metadata does not exist.'})

    def testGetMetadataKeysByWrongPath(self):
        path = 'key1.sub_key'
        keys = CLIENT.getLayerMetadataKeys(self.layerWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysAtLeaf(self):
        path = 'key1'
        keys = CLIENT.getLayerMetadataKeys(self.layerWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysByPath(self):
        path = 'key3.sub_key'
        metadata = CLIENT.getLayerMetadataKeys(self.layerWithMetadata, path=path)
        assert sorted(self.METADATA['key3']['sub_key']) == sorted(metadata)

    @success_message('Successfully created.')
    def testSetMetadataSuccess(self):
        return CLIENT.setLayerMetadata(self.layerWithoutMetadata, self.METADATA)

    def testKeyWithDot(self):
        CLIENT.setLayerMetadata(self.layerWithoutMetadata, {'key.subkey': 'value'})
        keys = CLIENT.getLayerMetadataKeys(self.layerWithoutMetadata)
        assert keys == ['key.subkey']

    def testKeyWithComma(self):
        CLIENT.setLayerMetadata(self.layerWithoutMetadata, {'key,subkey': 'value'})
        keys = CLIENT.getLayerMetadataKeys(self.layerWithoutMetadata)
        assert keys == ['key,subkey']

    def testSetMetadataByPath(self):
        CLIENT.setLayerMetadata(
            self.layerWithoutMetadata, 'value', path='key')
        metadata = CLIENT.getLayerMetadata(self.layerWithoutMetadata, path='key')
        assert metadata == 'value'

    def testSetMetadataByPathSubkey(self):
        CLIENT.setLayerMetadata(
            self.layerWithoutMetadata, 'value', path='key.subkey')
        metadata = CLIENT.getLayerMetadata(self.layerWithoutMetadata, path='key')
        assert metadata == {'subkey': 'value'}

    def testSetStructuredMetadataByPath(self):
        CLIENT.setLayerMetadata(
            self.layerWithoutMetadata, self.METADATA, path='key')
        metadata = CLIENT.getLayerMetadata(self.layerWithoutMetadata, path='key')
        assert metadata == self.METADATA

    def testUpdateMetadataByPath(self):
        CLIENT.setLayerMetadata(self.layerWithMetadata, 'updated_value', path='key2.key1')
        metadata = CLIENT.getLayerMetadata(self.layerWithMetadata, path='key2')
        assert metadata == {'key1': 'updated_value', 'key2': ['item1', 'item2']}
    #
    def testUpdateStructuredMetadata(self):
        metadata = {
            'key2': {'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key2': 4}}}
        CLIENT.setLayerMetadata(self.layerWithMetadata, metadata)

        updated_metadata = {
            'key1': 'value',
            'key2': {'key1': 'other_value',
                     'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key1': 'string',
                                 'sub_sub_key2': 4}}
        }
        assert CLIENT.getLayerMetadata(self.layerWithMetadata, 'key1') == updated_metadata['key1']
        assert CLIENT.getLayerMetadata(self.layerWithMetadata, 'key2') == updated_metadata['key2']
        assert CLIENT.getLayerMetadata(self.layerWithMetadata, 'key3') == updated_metadata['key3']

    def testAddMetadataKeyAtRoot(self):
        metadata = {'key4': 'value4'}
        CLIENT.setLayerMetadata(self.layerWithMetadata, metadata)
        assert sorted(CLIENT.getLayerMetadata(self.layerWithMetadata)) == ['key1', 'key2', 'key3', 'key4']

    def testDeleteMetadataPartial(self):
        CLIENT.deleteLayerMetadata(self.layerWithMetadata, path='key1')
        assert sorted(CLIENT.getLayerMetadataKeys(self.layerWithMetadata)) == ['key2', 'key3']

    @success_message('Successfully created.')
    def testSetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        return CLIENT.sendLayerMetadataFile(
            self.layerWithoutMetadata, 'key.subkey', uploaded)

    def testGetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        CLIENT.sendLayerMetadataFile(
            self.layerWithoutMetadata, 'key.subkey', uploaded)

        encoded = CLIENT.getLayerMetadata(self.layerWithoutMetadata, path='key.subkey').data
        decoded = b64decode(encoded).decode()
        self.assertEqual(decoded, self.LOREM)


class TestMediumMetadata(TestCase):

    METADATA = {
        'key1': 'value',
        'key2': {'key1': 'other_value',
                 'key2': ['item1', 'item2']},
        'key3': {'sub_key': {'sub_sub_key1': 'string',
                             'sub_sub_key2': 3}}
    }

    LOREM = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)

        corpus = CLIENT.createCorpus('corpus', returns_id=True)

        self.mediumWithMetadata = CLIENT.createMedium(corpus, name='layer1', returns_id=True)
        CLIENT.setMediumMetadata(self.mediumWithMetadata, self.METADATA)

        self.mediumWithoutMetadata = CLIENT.createMedium(corpus, name='layer2', returns_id=True)

    def testGetMetadata(self):
        keys = CLIENT.getMediumMetadata(self.mediumWithMetadata)
        assert sorted(keys) == sorted(self.METADATA)

    def testGetMetadataEmpty(self):
        keys = CLIENT.getMediumMetadata(self.mediumWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataKeysEmpty(self):
        keys = CLIENT.getMediumMetadataKeys(self.mediumWithoutMetadata)
        assert sorted(keys) == []

    def testGetMetadataByPath(self):
        path = 'key1'
        metadata = CLIENT.getMediumMetadata(self.mediumWithMetadata, path=path)
        assert self.METADATA['key1'] == metadata

        path = 'key2.key2'
        metadata = CLIENT.getMediumMetadata(self.mediumWithMetadata, path=path)
        assert self.METADATA['key2']['key2'] == metadata

        path = 'key3.sub_key.sub_sub_key2'
        metadata = CLIENT.getMediumMetadata(self.mediumWithMetadata, path=path)
        assert self.METADATA['key3']['sub_key']['sub_sub_key2'] == metadata

    def testGetMetadataByWrongPath(self):
        path = 'key1.sub_key'
        with self.assertRaises(HTTPError) as cm:
            CLIENT.getMediumMetadata(self.mediumWithMetadata, path=path)
        self.assertDictEqual(cm.exception.response.json(), {'error': 'Metadata does not exist.'})

    def testGetMetadataKeysByWrongPath(self):
        path = 'key1.sub_key'
        keys = CLIENT.getMediumMetadataKeys(self.mediumWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysAtLeaf(self):
        path = 'key1'
        keys = CLIENT.getMediumMetadataKeys(self.mediumWithMetadata, path=path)
        assert sorted(keys) == []

    def testGetMetadataKeysByPath(self):
        path = 'key3.sub_key'
        metadata = CLIENT.getMediumMetadataKeys(self.mediumWithMetadata, path=path)
        assert sorted(self.METADATA['key3']['sub_key']) == sorted(metadata)

    @success_message('Successfully created.')
    def testSetMetadataSuccess(self):
        return CLIENT.setMediumMetadata(self.mediumWithoutMetadata, self.METADATA)

    def testKeyWithDot(self):
        CLIENT.setMediumMetadata(self.mediumWithoutMetadata, {'key.subkey': 'value'})
        keys = CLIENT.getMediumMetadataKeys(self.mediumWithoutMetadata)
        assert keys == ['key.subkey']

    def testKeyWithComma(self):
        CLIENT.setMediumMetadata(self.mediumWithoutMetadata, {'key,subkey': 'value'})
        keys = CLIENT.getMediumMetadataKeys(self.mediumWithoutMetadata)
        assert keys == ['key,subkey']

    def testSetMetadataByPath(self):
        CLIENT.setMediumMetadata(
            self.mediumWithoutMetadata, 'value', path='key')
        metadata = CLIENT.getMediumMetadata(self.mediumWithoutMetadata, path='key')
        assert metadata == 'value'

    def testSetMetadataByPathSubkey(self):
        CLIENT.setMediumMetadata(
            self.mediumWithoutMetadata, 'value', path='key.subkey')
        metadata = CLIENT.getMediumMetadata(self.mediumWithoutMetadata, path='key')
        assert metadata == {'subkey': 'value'}

    def testSetStructuredMetadataByPath(self):
        CLIENT.setMediumMetadata(
            self.mediumWithoutMetadata, self.METADATA, path='key')
        metadata = CLIENT.getMediumMetadata(self.mediumWithoutMetadata, path='key')
        assert metadata == self.METADATA

    def testUpdateMetadataByPath(self):
        CLIENT.setMediumMetadata(self.mediumWithMetadata, 'updated_value', path='key2.key1')
        metadata = CLIENT.getMediumMetadata(self.mediumWithMetadata, path='key2')
        assert metadata == {'key1': 'updated_value', 'key2': ['item1', 'item2']}

    def testUpdateStructuredMetadata(self):
        metadata = {
            'key2': {'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key2': 4}}}
        CLIENT.setMediumMetadata(self.mediumWithMetadata, metadata)

        updated_metadata = {
            'key1': 'value',
            'key2': {'key1': 'other_value',
                     'key2': ['itemA', 'itemB']},
            'key3': {'sub_key': {'sub_sub_key1': 'string',
                                 'sub_sub_key2': 4}}
        }
        assert CLIENT.getMediumMetadata(self.mediumWithMetadata, 'key1') == updated_metadata['key1']
        assert CLIENT.getMediumMetadata(self.mediumWithMetadata, 'key2') == updated_metadata['key2']
        assert CLIENT.getMediumMetadata(self.mediumWithMetadata, 'key3') == updated_metadata['key3']

    def testAddMetadataKeyAtRoot(self):
        metadata = {'key4': 'value4'}
        CLIENT.setMediumMetadata(self.mediumWithMetadata, metadata)
        assert sorted(CLIENT.getMediumMetadata(self.mediumWithMetadata)) == ['key1', 'key2', 'key3', 'key4']

    def testDeleteMetadataPartial(self):
        CLIENT.deleteMediumMetadata(self.mediumWithMetadata, path='key1')
        assert sorted(CLIENT.getMediumMetadataKeys(self.mediumWithMetadata)) == ['key2', 'key3']

    @success_message('Successfully created.')
    def testSetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        return CLIENT.sendMediumMetadataFile(
            self.mediumWithoutMetadata, 'key.subkey', uploaded)

    def testGetMetadataFile(self):

        _, uploaded = tempfile.mkstemp()
        with open(uploaded, 'w') as fp:
            fp.write(self.LOREM)

        CLIENT.sendMediumMetadataFile(
            self.mediumWithoutMetadata, 'key.subkey', uploaded)

        encoded = CLIENT.getMediumMetadata(self.mediumWithoutMetadata, path='key.subkey').data
        decoded = b64decode(encoded).decode()
        self.assertEqual(decoded, self.LOREM)
