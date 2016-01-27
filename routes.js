/*
The MIT License (MIT)

Copyright (c) 2013-2015 CNRS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var _ = require('./controllers/utils');
var User = require('./controllers/User');
var Group = require('./controllers/Group');
var Corpus = require('./controllers/Corpus');
var Medium = require('./controllers/Medium');
var Layer = require('./controllers/Layer');
var Annotation = require('./controllers/Annotation');
var Queue = require('./controllers/Queue');
var Authentication = require('./controllers/Authentication');

var mUser = require('./models/User');
var mGroup = require('./models/Group');
var mCorpus = require('./models/Corpus');
var mMedium = require('./models/Medium');
var mLayer = require('./models/Layer');
var mAnnotation = require('./models/Annotation');
var mQueue = require('./models/Queue');

exports.initialize = function (app) {

  // UTILS

  app.get('/date',
    Authentication.middleware.isLoggedIn,
    _.route.date);

  // AUTHENTICATION

  // login
  app.post('/login',
    Authentication.login);

  // logout
  app.post('/logout',
    Authentication.middleware.isLoggedIn,
    Authentication.logout);

  // get logged in user
  app.get('/me',
    Authentication.middleware.isLoggedIn,
    Authentication.me);

  // get groups of logged in user
  app.get('/me/group',
    Authentication.middleware.isLoggedIn,
    Authentication.getGroups);

  // update password
  app.put('/me',
    Authentication.middleware.isLoggedIn,
    User.change_password);

  // USERS

  // create new user
  app.post('/user',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    User.create);

  // delete one user
  app.delete('/user/:id_user',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mUser),
    User.remove);

  // get all users
  app.get('/user',
    Authentication.middleware.isLoggedIn,
    // Authentication.middleware.isAdmin,
    User.getAll);

  // get one user
  app.get('/user/:id_user',
    Authentication.middleware.isLoggedIn,
    // Authentication.middleware.isAdmin,
    _.middleware.fExists(mUser),
    User.getOne);

  // update one user
  app.put('/user/:id_user',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mUser),
    User.update);

  // get one user's groups
  app.get('/user/:id_user/group',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mUser),
    User.getGroups);

  // GROUPS

  // get all groups
  app.get('/group',
    Authentication.middleware.isLoggedIn,
    // Authentication.middleware.isAdmin,
    Group.getAll);

  // get one group
  app.get('/group/:id_group',
    Authentication.middleware.isLoggedIn,
    // Authentication.middleware.isAdmin,
    _.middleware.fExists(mGroup),
    Group.getOne);

  // create new group
  app.post("/group",
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    Group.create);

  // update one group
  app.put('/group/:id_group',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mGroup),
    Group.update);

  // delete one group
  app.delete('/group/:id_group',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isRoot,
    _.middleware.fExists(mGroup),
    Group.remove);

  // add one user to one group
  app.put("/group/:id_group/user/:id_user",
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mGroup),
    _.middleware.fExists(mUser),
    Group.addUser);

  // remove one user from one group
  app.delete('/group/:id_group/user/:id_user',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExists(mGroup),
    _.middleware.fExists(mUser),
    Group.removeUser);

  // CORPUS

  // get all READable corpora
  app.get('/corpus',
    Authentication.middleware.isLoggedIn,
    Corpus.getAll);

  // get one corpus
  app.get('/corpus/:id_corpus',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.READ),
    Corpus.getOne);

  // create new corpus
  app.post('/corpus',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    Corpus.create);

  // update one corpus
  app.put('/corpus/:id_corpus',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.update);

  // delete one corpus
  app.delete('/corpus/:id_corpus',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.remove);

  // get one corpus' rights
  app.get('/corpus/:id_corpus/permissions',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.getRights);

  // give one user rights to one corpus
  app.put('/corpus/:id_corpus/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.updateUserRights);

  // remove one user's rights to one corpus
  app.delete('/corpus/:id_corpus/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.removeUserRights);

  // give one group rights to one corpus
  app.put('/corpus/:id_corpus/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.updateGroupRights);

  // remove one group's rights to one corpus
  app.delete('/corpus/:id_corpus/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Corpus.removeGroupRights);

  // MEDIUM

  // get all media
  app.get('/medium',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isRoot,
    Medium.getAll);

  // get one medium
  app.get('/medium/:id_medium',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.READ),
    Medium.getOne);

  // get one corpus' media
  app.get('/corpus/:id_corpus/medium',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.READ),
    Medium.getCorpusMedia);

  // get number of one corpus' media
  app.get('/corpus/:id_corpus/medium/count',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.READ),
    Medium.getCorpusMediaCount);

  // create new medium(a) in one corpus
  app.post('/corpus/:id_corpus/medium',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.ADMIN),
    Medium.create);

  // update one medium
  app.put('/medium/:id_medium',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.ADMIN),
    Medium.update);

  // delete one medium
  app.delete('/medium/:id_medium',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.ADMIN),
    Medium.remove);

  // stream one medium in default format
  app.get('/medium/:id_medium/video',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.READ),
    Medium.stream);

  // stream one medium in WebM
  app.get('/medium/:id_medium/webm',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.READ),
    Medium.streamWebM);

  // stream one medium in MP4
  app.get('/medium/:id_medium/mp4',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.READ),
    Medium.streamMp4);

  // stream one medium in OGV
  app.get('/medium/:id_medium/ogv',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mMedium, _.READ),
    Medium.streamOgv);

  // LAYER

  // get all layers
  app.get('/layer',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isRoot,
    Layer.getAll);

  // get one layer
  app.get('/layer/:id_layer',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.READ),
    Layer.getOne);

  // get one corpus' layers
  app.get('/corpus/:id_corpus/layer',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.READ),
    Layer.getCorpusLayers);

  // create new layer(s) in one corpus
  app.post('/corpus/:id_corpus/layer',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mCorpus, _.WRITE),
    Layer.create);

  // update one layer
  app.put('/layer/:id_layer',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.update);

  // delete one layer
  app.delete('/layer/:id_layer',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.remove);

  // get one layer's rights
  app.get('/layer/:id_layer/permissions',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.getRights);

  // give one user rights to one layer
  app.put('/layer/:id_layer/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.updateUserRights);

  // remove one user's rights to one layer
  app.delete('/layer/:id_layer/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.removeUserRights);

  // give one group rights to one layer
  app.put('/layer/:id_layer/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.updateGroupRights);

  // remove on group's rights to one layer
  app.delete('/layer/:id_layer/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mLayer, _.ADMIN),
    Layer.removeGroupRights);

  // ANNOTATION

  // get all annotations
  app.get('/annotation',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isRoot,
    Annotation.getAll);

  // get one annotation
  app.get('/annotation/:id_annotation',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mAnnotation, _.READ),
    Annotation.getOne);

  // get one layer's annotations
  app.get('/layer/:id_layer/annotation',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.READ),
    Annotation.getLayerAnnotations);

  // get count of one layer's annotations
  app.get('/layer/:id_layer/annotation/count',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.READ),
    Annotation.getLayerAnnotationsCount);

  // create new annotation(s) in one layer
  app.post('/layer/:id_layer/annotation',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mLayer, _.WRITE),
    Annotation.create);

  // update one annotation
  app.put('/annotation/:id_annotation',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mAnnotation, _.WRITE),
    Annotation.update);

  // delete one annotation
  app.delete('/annotation/:id_annotation',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mAnnotation, _.ADMIN),
    Annotation.remove);

  // QUEUE

  // get all READable corpora
  app.get('/queue',
    Authentication.middleware.isLoggedIn,
    Queue.getAll);

  // get one queue
  app.get('/queue/:id_queue',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.getOne);

  // create new queue
  app.post('/queue',
    Authentication.middleware.isLoggedIn,
    Authentication.middleware.isAdmin,
    Queue.create);

  // update one queue
  app.put('/queue/:id_queue',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.update);

  // append items to one queue
  app.put('/queue/:id_queue/next',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.WRITE),
    Queue.push);

  // pop one item from one queue
  app.get('/queue/:id_queue/next',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.WRITE),
    Queue.pop);

  // get all items from one queue
  app.get('/queue/:id_queue/first',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.pickOne);

  // get number of items in one queue
  app.get('/queue/:id_queue/length',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.pickLength);

  // get all items from one queue
  app.get('/queue/:id_queue/all',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.pickAll);

  // remove one queue
  app.delete('/queue/:id_queue',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.remove);

  // get one queue' rights
  app.get('/queue/:id_queue/permissions',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.getRights);

  // give one user rights to one queue
  app.put('/queue/:id_queue/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.updateUserRights);

  // remove one user's rights to one queue
  app.delete('/queue/:id_queue/user/:id_user',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mUser),
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.removeUserRights);

  // give one group rights to one queue
  app.put('/queue/:id_queue/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.updateGroupRights);

  // remove one group's rights to one queue
  app.delete('/queue/:id_queue/group/:id_group',
    Authentication.middleware.isLoggedIn,
    _.middleware.fExists(mGroup),
    _.middleware.fExistsWithRights(mQueue, _.ADMIN),
    Queue.removeGroupRights);

};