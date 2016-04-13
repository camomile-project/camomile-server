var should = require('should');
var helpers = require('./helpers');
var server = helpers.server;

describe('Metadata', function() {
    var corpus_id;

    before(function(done) {
        helpers.createCorpus(function(err,res) {
            if (err) {
                throw err;
            }
            corpus_id = res.body._id;
            done();
        });
    });

    beforeEach(function(done) {
        helpers.authenticate(done);
    });

    it('should create a metadata and return an empty response with HTTP 201 code', function(done) {
        server
            .post('/corpus/' + corpus_id + '/metadata')
            .send({test_corpus: helpers.metadata_fixtures.test_corpus})
            .set('Accept', 'application/json')
            .expect(201, done);
    });

    it('should return a valid json response with "key" parameter', function(done) {
        server
            .get('/corpus/' + corpus_id + '/metadata/test_corpus')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.should.Object();
                res.body.should.deepEqual(helpers.metadata_fixtures.test_corpus);

                done();
            });
    });

    it('should not return an object or array if value of "key" parameter is a string', function(done) {
        server
            .get('/corpus/' + corpus_id + '/metadata/test_corpus.value')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.should.equal(helpers.metadata_fixtures.test_corpus.value);

                done();
            });
    });

    it('should return a valid first level keys', function(done) {
        server
            .get('/corpus/' + corpus_id + '/metadata/test_corpus.')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.should.deepEqual(Object.keys(helpers.metadata_fixtures.test_corpus));
            });

        server
            .get('/corpus/' + corpus_id + '/metadata/test_corpus.level.')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                res.body.should.deepEqual(Object.keys(helpers.metadata_fixtures.test_corpus.level));

                done();
            });
    });

    it('should remove tree key and update keys of parent level', function(done) {
        server
            .delete('/corpus/' + corpus_id + '/metadata/test_corpus.value')
            .set('Accept', 'application/json')
            .expect(204)
            .end(function(err) {
                if (err) {
                    throw err;
                }

                server
                    .get('/corpus/' + corpus_id + '/metadata/test_corpus.')
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
});