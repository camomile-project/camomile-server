var should = require('should');
var helpers = require('./helpers');
var server = helpers.server;

describe('Listener', function() {

    it('should retrieve a valid channel_id if i\'m authenticated', function(done) {
        helpers.authenticate(function(err, success) {
            if (err) {
                throw err;
            }

            server
                .post('/listen')
                .set('Accept', 'application/json')
                .expect(201)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }

                    res.body.should.Object();
                    res.body.should.have.keys('channel_id');

                    done();
                });
        });
    });

    it('should get an http error if i request a channel_id and i\'m not authenticated', function(done) {
        server
            .post('/logout')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                server
                    .post('/listen')
                    .set('Accept', 'application/json')
                    .expect(401, done);
            });
    });

    describe('SSE Channel', function() {
        var es;

        before(function(done) {
            helpers.authenticate(function(err, res) {
                helpers.startSSEChannel(function(err, _es) {
                    es = _es;
                    done();
                });
            });
        });

        describe('Corpus', function() {
            var medium_id, corpus_id, layer_id;

            before(function(done) {
                helpers.createCorpus(function(err, res) {
                   corpus_id = res.body._id;
                   done();
                });
            });

            it ('should receive an event if corpus is updated', function(done) {
                helpers.watch(es, 'corpus', corpus_id, function(msg) {

                    msg.type.should.equal('corpus:' + corpus_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('corpus', 'event');
                    msg.data.should.deepEqual({corpus: corpus_id, event: {update: ['description']}});

                    done();
                }, function() {
                    server
                        .put('/corpus/' + corpus_id)
                        .send({description: 'new description'})
                        .expect(200)
                        .end(function(err, res) {});
                });
            });

            // ADD / REMOVE MEDIUM
            it ('should receive an event if medium is added to corpus', function(done) {
                helpers.watch(es, 'corpus', corpus_id, function(msg) {

                    msg.type.should.equal('corpus:' + corpus_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('corpus', 'event');
                    msg.data.should.deepEqual({corpus: corpus_id, event: {add_medium: medium_id}});

                    done();
                }, function() {
                    server
                        .post('/corpus/' + corpus_id + '/medium')
                        .send({name: 'new medium for ' + corpus_id, url: 'test/url'})
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }

                            medium_id = res.body._id;
                        });
                });
            });

            it ('should receive an event if medium is removed to corpus', function(done) {
                helpers.watch(es, 'corpus', corpus_id, function(msg) {

                    msg.type.should.equal('corpus:' + corpus_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('corpus', 'event');
                    msg.data.should.deepEqual({corpus: corpus_id, event: {delete_medium: medium_id}});

                    done();
                }, function() {
                    server
                        .delete('/medium/' + medium_id)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });

            // ADD / REMOVE LAYER
            it ('should receive an event if layer is added to corpus', function(done) {
                helpers.watch(es, 'corpus', corpus_id, function(msg) {

                    msg.type.should.equal('corpus:' + corpus_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('corpus', 'event');
                    msg.data.should.deepEqual({corpus: corpus_id, event: {add_layer: layer_id}});

                    done();
                }, function() {
                    server
                        .post('/corpus/' + corpus_id + '/layer')
                        .send({"name": "test_layer_" + corpus_id, fragment_type: {}, data_type: {}})
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }

                            layer_id = res.body._id;
                        });
                });
            });

            it ('should receive an event if layer is removed to corpus', function(done) {
                helpers.watch(es, 'corpus', corpus_id, function(msg) {

                    msg.type.should.equal('corpus:' + corpus_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('corpus', 'event');
                    msg.data.should.deepEqual({corpus: corpus_id, event: {delete_layer: layer_id}});

                    done();
                }, function() {
                    server
                        .delete('/layer/' + layer_id)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });
        });

        describe('Medium', function() {
            var medium_id;

            before(function(done) {
                helpers.createMedium(function(err, res) {
                    medium_id = res.body._id;
                    done();
                });
            });

            it ('should receive an event if medium is updated', function(done) {
                helpers.watch(es, 'medium', medium_id, function(msg) {

                    msg.type.should.equal('medium:' + medium_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('medium', 'event');
                    msg.data.should.deepEqual({medium: medium_id, event: {update: ['url']}});

                    done();
                }, function() {
                    server
                        .put('/medium/' + medium_id)
                        .send({url: 'new/url'})
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });
        });

        describe('Layer', function() {
            var layer_id, annotation_id;

            before(function(done) {
                helpers.createLayer(function(err, res) {
                    layer_id = res.body._id;
                    done();
                });
            });

            it ('should receive an event if layer is updated', function(done) {
                helpers.watch(es, 'layer', layer_id, function(msg) {

                    msg.type.should.equal('layer:' + layer_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('layer', 'event');
                    msg.data.should.deepEqual({layer: layer_id, event: {update: ['name']}});

                    done();
                }, function() {
                    server
                        .put('/layer/' + layer_id)
                        .send({name: 'new name'})
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });

            // ADD / REMOVE ANNOTATION
            it ('should receive an event if annotation is added to layer', function(done) {
                helpers.watch(es, 'layer', layer_id, function(msg) {

                    msg.type.should.equal('layer:' + layer_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('layer', 'event');
                    msg.data.should.deepEqual({layer: layer_id, event: {add_annotation: annotation_id}});

                    done();
                }, function() {
                    server
                        .post('/layer/' + layer_id + '/annotation')
                        .send({name: 'new annotation for ' + layer_id})
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }

                            annotation_id = res.body._id;
                        });
                });
            });

            it ('should receive an event if annotation is removed to layer', function(done) {
                helpers.watch(es, 'layer', layer_id, function(msg) {

                    msg.type.should.equal('layer:' + layer_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('layer', 'event');
                    msg.data.should.deepEqual({layer: layer_id, event: {delete_annotation: annotation_id}});

                    done();
                }, function() {
                    server
                        .delete('/annotation/' + annotation_id)
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });
        });

        describe('Queue', function() {
            var queue_id;

            before(function(done) {
                helpers.createQueue(function(err, res) {
                    queue_id = res.body._id;
                    done();
                });
            });

            it ('should receive an event if push item in queue', function(done) {
                helpers.watch(es, 'queue', queue_id, function(msg) {

                    msg.type.should.equal('queue:' + queue_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('queue', 'event');
                    msg.data.should.deepEqual({queue: queue_id, event: {push_item: 3}});

                    done();
                }, function() {
                    server
                        .put('/queue/' + queue_id + '/next')
                        .send(['new name', 'new name 2', 'new name 3'])
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });

            it ('should receive an event if pop item in queue', function(done) {
                helpers.watch(es, 'queue', queue_id, function(msg) {

                    msg.type.should.equal('queue:' + queue_id);
                    msg.data.should.Object();
                    msg.data.should.have.keys('queue', 'event');
                    msg.data.should.deepEqual({queue: queue_id, event: {pop_item: 2}});

                    done();
                }, function() {
                    server
                        .get('/queue/' + queue_id + '/next')
                        .expect(200)
                        .end(function(err, res) {
                            if (err) {
                                throw err;
                            }
                        });
                });
            });
        });
    });
});