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

var Utils = require('../controllers/utils');
var User = require('../controllers/User');
var Group = require('../controllers/Group');
var Corpus = require('../controllers/Corpus');
var Medium = require('../controllers/Medium');
var Layer = require('../controllers/Layer');
var Annotation = require('../controllers/Annotation');
var Queue = require('../controllers/Queue');
var Session = require('../controllers/Session');

exports.initialize = function (app) {

  // AUTHENTICATION

  // -- LOG IN
  // POST login --data '{"username":"...", "password":"..."}' --cookie-jar "cookies.txt"
  // Data 
  app.post('/login',
    Session.login);

  // -- LOG OUT
  // POST /logout --cookie-jar "cookies.txt"
  app.post('/logout',
    Session.isLoggedIn,
    Session.logout);

  // -- GET CURRENT USER
  // GET /me --cookie-jar "cookies.txt"
  app.get('/me',
    Session.isLoggedIn,
    Session.me);

  // --- tools routes --- \\
  // GET /date --cookie-jar "cookies.txt"
  app.get('/date',
    Session.isLoggedIn,
    Utils.date);

  // --- user routes --- \\
  // create user
  // POST /user --data '{"username":"...", "password":"...", "role":"admin", "description":{"...":"..."}}'
  app.post('/user',
    Session.isLoggedIn,
    Session.isAdmin,
    User.create);
  // get list of all users
  // GET /user
  app.get('/user',
    Session.isLoggedIn,
    Session.isAdmin,
    User.getAll);
  // info on a specific user
  // GET /user/id_user
  app.get('/user/:id_user',
    Session.isLoggedIn,
    User.exists,
    Session.isAdmin,
    User.getOne);
  // update information on a specific user
  // PUT /user/id_user --data '{"password":"...", "role":"admin", "description":{"...":"..."}}'
  app.put('/user/:id_user',
    Session.isLoggedIn,
    User.exists,
    Session.isAdmin,
    User.update);

  // delete a specific user
  // DELETE /user/id_user
  // TODO: make sure ACL entries are removed for this user
  app.delete('/user/:id_user',
    Session.isLoggedIn,
    Session.isRoot,
    User.exists,
    User.remove);

  // get all group of a user
  // GET /user/id_user/group
  app.get('/user/:id_user/group',
    Session.isLoggedIn,
    User.exists,
    Session.isAdmin,
    User.getGroups);

  // --- group routes --- \\
  // create a group
  // POST /group --data '{"name":"...", "description":{"...":"..."}}'
  app.post("/group",
    Session.isLoggedIn,
    Session.isAdmin,
    Group.create);
  // get list of all groups
  // GET /group
  app.get('/group',
    Session.isLoggedIn,
    Session.isAdmin,
    Group.getAll);
  // info on a specific group
  // GET /group/id_group
  app.get('/group/:id_group',
    Session.isLoggedIn,
    Group.exists,
    Session.isAdmin,
    Group.getOne);
  // update information of a group
  // PUT /group/id_group --data '{"description":"desc"}'
  app.put('/group/:id_group',
    Session.isLoggedIn,
    Group.exists,
    Session.isAdmin,
    Group.update);
  // delete a group
  // DELETE /group/id_group
  app.delete('/group/:id_group',
    Session.isLoggedIn,
    Group.exists,
    Session.isRoot,
    Group.remove);      // rajouter la suppression dans les acl
  // add user to a group
  // PUT /group/id_group/user/id_user
  app.put("/group/:id_group/user/:id_user",
    Session.isLoggedIn,
    Group.exists,
    User.exists,
    Session.isAdmin,
    Group.addUser);
  // remove a user from a group
  // DELETE /group/id_group/user/id_user
  app.delete('/group/:id_group/user/:id_user',
    Session.isLoggedIn,
    Group.exists,
    User.exists,
    Session.isAdmin,
    Group.removeUser);

  // --- resources routes --- \\
  // corpus
  // create new corpus
  // POST /corpus --data '{"name":"new corpus", "description":{"...":"..."}' 
  app.post('/corpus',
    Session.isLoggedIn,
    Session.isAdmin,
    Corpus.create);

  // GET /corpus
  app.get('/corpus',
    Session.isLoggedIn,
    Corpus.getAll);
  // info on a particular corpus
  // GET /corpus/id_corpus
  app.get('/corpus/:id_corpus',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O', 'W', 'R']),
    Corpus.getOne);
  // update info of a corpus
  // PUT /corpus/id_corpus --data '{"name":"new corpus", "description":{"...":"..."}}'
  app.put('/corpus/:id_corpus',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O']),
    Corpus.update);
  // delete a corpus
  // DELETE /corpus/id_corpus
  app.delete('/corpus/:id_corpus',
    Session.isLoggedIn,
    Corpus.exists,
    Session.isAdmin,
    Corpus.hasRights(['O']),
    Corpus.remove);

  // create multi media for a corpus
  // POST /corpus/id_corpus/medium --data '[{"name":"...", "url":"...", "description":{"...":"..."}}, ...]' 
  app.post('/corpus/:id_corpus/medium',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O', 'W']),
    Corpus.addMedia);
  // create a layer
  // POST /corpus/id_corpus/layer --data '{"name":"new layer", "description":{"...":"..."}, "fragment_type":{"...":"..."}, "data_type":{"...":"..."}}' 
  app.post('/corpus/:id_corpus/layer',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O', 'W']),
    Corpus.addLayer);
  // list all media of a corpus
  // GET /corpus/id_corpus/medium
  app.get('/corpus/:id_corpus/medium',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O', 'W', 'R']),
    Corpus.getAllMedia);
  // list all layer of a corpus 
  // GET /corpus/id_corpus/layer
  app.get('/corpus/:id_corpus/layer',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.getAllLayer);
  // ACL of a particular corpus
  // GET /corpus/id_corpus/acl
  app.get('/corpus/:id_corpus/ACL',
    Session.isLoggedIn,
    Corpus.exists,
    Corpus.hasRights(['O']),
    Corpus.getRights);
  // update user ACL for a corpus
    // PUT /corpus/id_corpus/user/id_user --data '{"Right":"O"}'
  app.put('/corpus/:id_corpus/user/:id_user',
    Session.isLoggedIn,
    Corpus.exists,
    User.exists,
    Corpus.hasRights(['O']),
    Corpus.updateUserRights);
    // update group ACL for a corpus
    // PUT /corpus/id_corpus/group/id_group --data '{"Right":"O"}'
  app.put('/corpus/:id_corpus/group/:id_group',
    Session.isLoggedIn,
    Corpus.exists,
    Group.exists,
    Corpus.hasRights(['O']),
    Corpus.updateGroupRights);

    // DELETE /corpus/id_corpus/user/id_user 
  app.delete('/corpus/:id_corpus/user/:id_user',
    Session.isLoggedIn,
    Corpus.exists,
    User.exists,
    Corpus.hasRights(['O']),
    Corpus.removeUserRights);
    // delete a group right for a corpus
    // DELETE /corpus/id_corpus/group/id_group 
  app.delete('/corpus/:id_corpus/group/:id_group',
    Session.isLoggedIn,
    Corpus.exists,
    Group.exists,
    Corpus.hasRights(['O']),
    Corpus.removeGroupRights);

  // media
  // get all media
  // GET /medium
  app.get('/medium',
    Session.isLoggedIn,
    Session.isRoot,
    Medium.getAll);
  // info on a particular media
  // GET /medium/id_medium
  app.get('/medium/:id_medium',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O', 'W', 'R']),
    Medium.getOne);
  // update info of a media
  // PUT /medium/id_medium --data '{"name":"...", "url":"...", "description":{"...":"..."}}'
  app.put('/medium/:id_medium',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O']),
    Medium.update);
  // delete a media
  // DELETE /medium/id_medium
  app.delete('/medium/:id_medium',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O']),
    Medium.remove);
  // get video stream
  // GET /medium/id_medium/video
  app.get('/medium/:id_medium/video',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O', 'W', 'R']),
    Medium.getVideo);
  // get webm stream
  // GET /medium/id_medium/webm
  app.get('/medium/:id_medium/webm',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O', 'W', 'R']),
    Medium.getVideoWEBM);
  // get mp4 stream
  // GET /medium/id_medium/mp4
  app.get('/medium/:id_medium/mp4',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O', 'W', 'R']),
    Medium.getVideoMP4);
  // get ogv stream
  // GET /medium/id_medium/ogv
  app.get('/medium/:id_medium/ogv',
    Session.isLoggedIn,
    Medium.exists,
    Medium.hasRights(['O', 'W', 'R']),
    Medium.getVideoOGV);

  // layer
  // get all layer
  // GET /layer
  app.get('/layer',
    Session.isLoggedIn,
    Session.isRoot,
    Layer.getAll);
  // info on a particular layer
  // GET /layer/id_layer
  app.get('/layer/:id_layer',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O', 'W', 'R']),
    Layer.getOne);
  // update info of a layer
  // PUT /layer/id_layer --data '{"name":"speaker", "description":{"...":"..."}}'
  app.put('/layer/:id_layer',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O']),
    Layer.update);
  // delete a layer
  // DELETE /layer/id_layer
  app.delete('/layer/:id_layer',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O']),
    Layer.remove);

  // create multi annotation
  // POST /layer/id_layer/annotation --data '{"annotation_list":[{"fragment":{"start":0, "end":15}, "data":"value", "id_medium":""}, ...]}' 
  app.post('/layer/:id_layer/annotation',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O', 'W']),
    Layer.addAnnotation);
  // list all annotation of a layer
  // GET /layer/id_layer/annotation
  app.get('/layer/:id_layer/annotation',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O', 'W', 'R']),
    Layer.getAnnotations);
  // ACL of a particular layer
  // GET /corpus/id_layer/acl
  app.get('/layer/:id_layer/ACL',
    Session.isLoggedIn,
    Layer.exists,
    Layer.hasRights(['O']),
    Layer.getRights);
  // update user ACL for a layer
  // PUT /corpus/id_layer/user/id_user --data '{"Right":"O"}'
  app.put('/layer/:id_layer/user/:id_user',
    Session.isLoggedIn,
    Layer.exists,
    User.exists,
    Layer.hasRights(['O']),
    Layer.updateUserRights);
  // update group ACL for a layer
  // PUT /corpus/id_layer/group/id_group --data '{"Right":"O"}'
  app.put('/layer/:id_layer/group/:id_group',
    Session.isLoggedIn,
    Layer.exists,
    Group.exists,
    Layer.hasRights(['O']),
    Layer.updateGroupRights);
  // delete a user right for a layer
  // DELETE /corpus/id_layer/user/id_user 
  app.delete('/layer/:id_layer/user/:id_user',
    Session.isLoggedIn,
    Layer.exists,
    User.exists,
    Layer.hasRights(['O']),
    Layer.removeUserRights);
    // delete a group right for a layer
  // DELETE /corpus/id_layer/group/id_group
  app.delete('/layer/:id_layer/group/:id_group',
    Session.isLoggedIn,
    Layer.exists,
    Group.exists,
    Layer.hasRights(['O']),
    Layer.removeGroupRights);

  // annotation
  // get all annotation
  // GET /annotation
  app.get('/annotation',
    Session.isLoggedIn,
    Session.isRoot,
    Annotation.getAll);
  // info on a particular annotation
  // GET /annotation/id_annotation
  app.get('/annotation/:id_annotation',
    Session.isLoggedIn,
    Annotation.exists,
    Annotation.hasRights(['O', 'W', 'R']),
    Annotation.getOne);
  // update info of an annotation
  // PUT /annotation/id_annotation --data '{"user":"id_user", fragment":{"start":0, "end":15}, "data":"value", "id_medium":""}'
  app.put('/annotation/:id_annotation',
    Session.isLoggedIn,
    Annotation.exists,
    Annotation.hasRights(['O', 'W']),
    Annotation.update);
  // delete annotation
  // DELETE /annotation/id_annotation
  app.delete('/annotation/:id_annotation',
    Session.isLoggedIn,
    Annotation.exists,
    Annotation.hasRights(['O']),
    Annotation.remove);

  // --- queue routes --- \\
  // create a queue
  // POST /queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
  app.post('/queue',
    Session.isLoggedIn,
    Queue.create);
  // list all ids in a queue
  // GET /queue
  app.get('/queue',
    Session.isLoggedIn,
    Session.isRoot,
    Queue.getAll);
  // info on a queue
  // GET /queue/id_queue
  app.get('/queue/:id_queue',
    Session.isLoggedIn,
    Queue.exists,
    Queue.getOne);
  // create or replace a list of ids
  // PUT /queue/id_queue --data '{"name":"...", "description":{"...":"..."}, "list": [{}, {}, ...]}'
  app.put('/queue/:id_queue',
    Session.isLoggedIn,
    Queue.exists,
    Queue.update);
  // add new annotation in a queue
  // PUT /queue/id_queue/next --data '{}'
  app.put('/queue/:id_queue/next',
    Session.isLoggedIn,
    Queue.exists,
    Queue.push);
  // get next annotation of a queue
  // GET /queue/id_queue/nex@t
  app.get('/queue/:id_queue/next',
    Session.isLoggedIn,
    Queue.exists,
    Queue.pop);
  // delete a queue
  // DELETE /queue/id_queue
  app.delete('/queue/:id_queue',
    Session.isLoggedIn,
    Queue.exists,
    Session.isAdmin,
    Queue.remove);
};
