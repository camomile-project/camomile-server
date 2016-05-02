var helpers = require('./helpers');

var server = helpers.server;

describe('Auth', function() {
    it('should return a 200 HTTP code if login successful', function(done) {
        server
           .post('/login')
           .send({"username": "root", "password": "password"})
           .set('Accept', 'application/json')
           .expect('Content-Type', /json/)
           .expect(200, done);
    });

    it('should return an 400 HTTP code if login is wrong', function(done) {
        server
            .post('/login')
            .send({"username": "root", "password": "passwrd"})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400, done);
    });
});