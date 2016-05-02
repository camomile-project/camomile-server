var server =require('supertest').agent('http://127.0.0.1:3000');

var metadata_fixtures = {
    test_corpus: {
        "value": "this value for corpus",
        "array1": [
            "value1",
            "value2"
        ],
        "level": {
            level1: {
                level1_1: 'level1_1 value for corpus'
            },
            level2: {
                level2_1: 'level2_1 value for corpus',
                level2_2: 'level2_2 value for corpus'
            }
        },
        mypicture: {
            type: 'file',
            filename: 'filenametest.jpg',
            data: '/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAKAAoDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGVAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAEFAh//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAY/Ah//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAE/IR//2gAMAwEAAgADAAAAEJJP/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFBABAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPxAf/9k='
        }
    },
    test_layer: {
        "value": "this value for layer",
        "array1": [
            "value1",
            "value2"
        ],
        "level": {
            level1: {
                level1_1: 'level1_1 value for layer'
            },
            level2: {
                level2_1: 'level2_1 value for layer',
                level2_2: 'level2_2 value for layer'
            }
        },
        mypicture: {
            type: 'file',
            filename: 'filenametest.jpg',
            data: '/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAKAAoDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGVAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAEFAh//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAY/Ah//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAE/IR//2gAMAwEAAgADAAAAEJJP/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFBABAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPxAf/9k='
        }
    },
    test_medium: {
        "value": "this value for medium",
        "array1": [
            "value1",
            "value2"
        ],
        "level": {
            level1: {
                level1_1: 'level1_1 value for medium'
            },
            level2: {
                level2_1: 'level2_1 value for medium',
                level2_2: 'level2_2 value for medium'
            }
        },
        mypicture: {
            type: 'file',
            filename: 'filenametest.jpg',
            data: '/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCAAKAAoDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGVAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAEFAh//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAY/Ah//xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAE/IR//2gAMAwEAAgADAAAAEJJP/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFBABAAAAAAAAAAAAAAAAAAAAIP/aAAgBAQABPxAf/9k='
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

function createLayer(done) {
    createCorpus(function(err, res) {
        var time = (new Date()).getTime();
        server
            .post('/corpus/' + res.body._id + '/layer')
            .send({"name": "test_layer_" + time, fragment_type: {}, data_type: {}})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done);
    });
}

function createMedium(done) {
    createCorpus(function(err, res) {
        var time = (new Date()).getTime();
        server
            .post('/corpus/' + res.body._id + '/medium')
            .send({"name": "test_layer_" + time, url: 'test/url'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done);
    });
}

module.exports = {
    server: server,
    metadata_fixtures: metadata_fixtures,
    authenticate: authenticate,
    createCorpus: createCorpus,
    createLayer: createLayer,
    createMedium: createMedium
};