from __future__ import unicode_literals
from unittest import TestCase
import tempfile

from . import CLIENT, ROOT_USERNAME, ROOT_PASSWORD
from .helper import ADMIN_USERNAME, ADMIN_PASSWORD

from .helper import initDatabase
from .helper import success_message, error_message

from time import sleep
from functools import partial


class TestWatchCorpus(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        self.events = dict()
        self.corpus = CLIENT.createCorpus('corpus', returns_id=True)
        self.medium = CLIENT.createMedium(self.corpus, 'medium', returns_id=True)
        self.layer = CLIENT.createLayer(self.corpus, 'layer', returns_id=True)

    @staticmethod
    def saveEvent(self, resource, event):
        self.events[resource] = event

    def testUpdate(self):

        callback = partial(self.saveEvent, self, self.corpus)
        CLIENT.watchCorpus(self.corpus, callback)
        CLIENT.updateCorpus(self.corpus, name='new corpus')

        sleep(0.2)
        assert self.corpus in self.events
        assert 'update' in self.events[self.corpus]
        assert 'name' in self.events[self.corpus]['update']

    def testAddMedium(self):

        callback = partial(self.saveEvent, self, self.corpus)
        CLIENT.watchCorpus(self.corpus, callback)
        medium = CLIENT.createMedium(self.corpus, 'new_medium', returns_id=True)

        sleep(0.2)
        assert self.corpus in self.events
        assert 'add_medium' in self.events[self.corpus]
        assert self.events[self.corpus]['add_medium'] == medium

    def testDeleteMedium(self):

        callback = partial(self.saveEvent, self, self.corpus)
        CLIENT.watchCorpus(self.corpus, callback)
        CLIENT.deleteMedium(self.medium)

        sleep(0.2)
        assert self.corpus in self.events
        assert 'delete_medium' in self.events[self.corpus]
        assert self.events[self.corpus]['delete_medium'] == self.medium

    def testAddLayer(self):

        callback = partial(self.saveEvent, self, self.corpus)
        CLIENT.watchCorpus(self.corpus, callback)
        layer = CLIENT.createLayer(self.corpus, 'new_layer', returns_id=True)

        sleep(0.2)
        assert self.corpus in self.events
        assert 'add_layer' in self.events[self.corpus]
        assert self.events[self.corpus]['add_layer'] == layer

    def testDeleteLayer(self):

        callback = partial(self.saveEvent, self, self.corpus)
        CLIENT.watchCorpus(self.corpus, callback)
        CLIENT.deleteLayer(self.layer)

        sleep(0.2)
        assert self.corpus in self.events
        assert 'delete_layer' in self.events[self.corpus]
        assert self.events[self.corpus]['delete_layer'] == self.layer


class TestWatchMedium(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        self.events = dict()
        corpus = CLIENT.createCorpus('corpus', returns_id=True)
        self.medium = CLIENT.createMedium(corpus, 'medium', returns_id=True)

    @staticmethod
    def saveEvent(self, resource, event):
        self.events[resource] = event

    def testUpdate(self):

        callback = partial(self.saveEvent, self, self.medium)
        CLIENT.watchMedium(self.medium, callback)
        CLIENT.updateMedium(self.medium, name='new medium')

        sleep(0.2)
        assert self.medium in self.events
        assert 'update' in self.events[self.medium]
        assert 'name' in self.events[self.medium]['update']

class TestWatchLayer(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        self.events = dict()
        corpus = CLIENT.createCorpus('corpus', returns_id=True)
        self.layer = CLIENT.createLayer(corpus, 'layer', returns_id=True)
        self.annotation = CLIENT.createAnnotation(self.layer, fragment='fragment', data='data', returns_id=True)

    @staticmethod
    def saveEvent(self, resource, event):
        self.events[resource] = event

    def testUpdate(self):

        callback = partial(self.saveEvent, self, self.layer)
        CLIENT.watchLayer(self.layer, callback)
        CLIENT.updateLayer(self.layer, name='new layer')

        sleep(0.2)
        assert self.layer in self.events
        assert 'update' in self.events[self.layer]
        assert 'name' in self.events[self.layer]['update']

    def testAddAnnotation(self):

        callback = partial(self.saveEvent, self, self.layer)
        CLIENT.watchLayer(self.layer, callback)
        annotation = CLIENT.createAnnotation(self.layer, fragment='fragment', data='data', returns_id=True)

        sleep(0.2)
        assert self.layer in self.events
        assert 'add_annotation' in self.events[self.layer]
        assert self.events[self.layer]['add_annotation'] == annotation

    def testDeleteAnnotation(self):

        callback = partial(self.saveEvent, self, self.layer)
        CLIENT.watchLayer(self.layer, callback)
        CLIENT.deleteAnnotation(self.annotation)

        sleep(0.2)
        assert self.layer in self.events
        assert 'delete_annotation' in self.events[self.layer]
        assert self.events[self.layer]['delete_annotation'] == self.annotation

class TestWatchQueue(TestCase):

    def setUp(self):
        initDatabase()
        CLIENT.login(ADMIN_USERNAME, ADMIN_PASSWORD)
        self.events = dict()
        self.queue = CLIENT.createQueue('queue', returns_id=True)
        CLIENT.enqueue(self.queue, [1, 'a', 2])

    @staticmethod
    def saveEvent(self, resource, event):
        self.events[resource] = event

    def testPush(self):

        callback = partial(self.saveEvent, self, self.queue)
        CLIENT.watchQueue(self.queue, callback)
        CLIENT.enqueue(self.queue, ['b', 3])

        sleep(0.2)
        assert self.queue in self.events
        assert 'push_item' in self.events[self.queue]
        current_length = self.events[self.queue]['push_item']
        assert current_length == 5

    def testPop(self):

        callback = partial(self.saveEvent, self, self.queue)
        CLIENT.watchQueue(self.queue, callback)
        CLIENT.dequeue(self.queue)

        sleep(0.2)
        assert self.queue in self.events
        assert 'pop_item' in self.events[self.queue]
        current_length = self.events[self.queue]['pop_item']
        assert current_length == 2
