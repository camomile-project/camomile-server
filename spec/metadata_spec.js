var should = require('should');
var helpers = require('./helpers');
var server = helpers.server;

describe('Metadata', function() {

    beforeEach(function(done) {
        helpers.authenticate(done);
    });

    function executeType(resource) {
        describe (resource, function() {
            var resource_id;
            var resource_name = resource.toLowerCase();
            var fixtures = helpers.metadata_fixtures['test_' + resource_name];

            before(function(done) {
                helpers['create' + resource](function(err, res) {
                    if (err) {
                        throw err;
                    }
                    resource_id = res.body._id;
                    done();
                });
            });

            it('should create a metadata and return response with HTTP 201 code', function(done) {
                server
                    .post('/' + resource_name + '/' + resource_id + '/metadata')
                    .send(fixtures)
                    .set('Accept', 'application/json')
                    .expect(201, done);
            });

            it('should return a valid json response with "key" parameter', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/level')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.Object();
                        res.body.should.deepEqual(fixtures.level);

                        done();
                    });
            });

            it('should return a json array if value of "key" parameter is an array', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/array1')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }
                        res.body.should.Array();
                        res.body.should.deepEqual(fixtures.array1);

                        done();
                    });
            });

            it('should return a json string if value of "key" parameter is a string', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/value')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.equal(fixtures.value);

                        done();
                    });
            });

            it('should return a json object if value of "key" parameter is an object', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/level.level1')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.Object();
                        res.body.should.deepEqual(fixtures.level.level1);

                        done();
                    });
            });



            it('should return a url if value of "key" parameter is an file object', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/mypicture')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', 'image/jpeg')
                    .expect(200)
                    .end(done);
            });

            it('should return a valid first level keys', function(done) {
                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.deepEqual(Object.keys(fixtures));
                    });

                server
                    .get('/' + resource_name + '/' + resource_id + '/metadata/level.')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            throw err;
                        }

                        res.body.should.deepEqual(Object.keys(fixtures.level));

                        done();
                    });
            });

            it('should remove tree key and update keys of parent level', function(done) {
                server
                    .delete('/' + resource_name + '/' + resource_id + '/metadata/value')
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function(err) {
                        if (err) {
                            throw err;
                        }

                        server
                            .get('/' + resource_name + '/' + resource_id + '/metadata/')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function(err, res) {
                                if (err) {
                                    throw err;
                                }

                                res.body.should.not.deepEqual('value');

                                done();
                            });
                    });
            });

            it('should remove metadata if resource is removed', function(done) {
                server
                    .delete('/' + resource_name + '/' + resource_id)
                    .set('Accept', 'application/json')
                    .expect(200)
                    .end(function(err) {
                        if (err) {
                            throw err;
                        }

                        server
                            .get('/' + resource_name + '/' + resource_id + '/metadata/')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .expect(400)
                            .end(done);
                    });
            });

        });
    }

    executeType('Corpus');
    executeType('Layer');
    executeType('Medium');
});