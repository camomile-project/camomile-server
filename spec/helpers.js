var server =require('supertest').agent('http://127.0.0.1:3000');

var metadata_fixtures = {
    test_corpus: {
        "value": "this value for corpus",
        "level": {
            level1: {
                level1_1: 'level1_1 value for corpus'
            },
            level2: {
                level2_1: 'level2_1 value for corpus',
                level2_2: 'level2_2 value for corpus'
            }
        }
    }
};

function authenticate(done) {
    server
        .post('/login')
        .send({"username": "root", "password": "password"})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
}

function createCorpus(done) {
    var time = (new Date()).getTime();
    server
        .post('/corpus')
        .send({"name": "test_corpus_" + time, "description": "corpus test " + time})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
}

module.exports = {
    server: server,
    metadata_fixtures: metadata_fixtures,
    authenticate: authenticate,
    createCorpus: createCorpus
};