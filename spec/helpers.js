var baseUrl = 'http://127.0.0.1:3000';
var server =require('supertest').agent(baseUrl);
var EventSource = require('eventsource');


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

function startSSEChannel(done) {
    server
        .post('/listen')
        .set('Accept', 'application/json')
        .expect(201)
        .end(function(err, res) {
            if (err) {
                throw err;
            }

            var es = new EventSource(baseUrl + '/listen/' + res.body.channel_id);
            es.channel_id = res.body.channel_id;
            done(null, es);
        });
}

function watch(es, resource, id, callback, done){

    var sseCallback = function(msg) {
        var datas = {
            type: msg.type,
            data: JSON.parse(msg.data)
        };
        es.removeAllListeners(resource + ':' + id);
        server
            .delete('/listen/' + es.channel_id + '/' + resource + '/' + id)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                callback(datas);
            });
    };


    server
        .put('/listen/' + es.channel_id + '/' + resource + '/' + id)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
           if (err) {
               throw err;
           }
            es.addEventListener(res.body.event, sseCallback);

            done();
        });
}

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

function createQueue(done) {
    var time = (new Date()).getTime();
    server
        .post('/queue')
        .send({name: 'queue name ' + time})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
            if (err) {
                console.log(res.body);
                throw err;
            }

            done(err, res);
        });
}

module.exports = {
    server: server,
    metadata_fixtures: metadata_fixtures,
    authenticate: authenticate,
    createCorpus: createCorpus,
    createLayer: createLayer,
    createMedium: createMedium,
    createQueue: createQueue,
    startSSEChannel: startSSEChannel,
    watch: watch
};