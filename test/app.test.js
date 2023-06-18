const app = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));
const server = require('../app');
const should = chai.should();

chai.should();
chai.use(chaiHttp);

let token = '';

describe('Node Server', () => {
    it('Should login and get a JWT token', (done) => {
        chai
            .request(app)
            .post('/api/login')
            .type('application/json')
            .send({
                username: 'admin1',
                password: 'password',  // replace with the actual password for the user 'admin'
            })
            .end((err, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('token');
                token = `Bearer ${response.body.token}`;
                done();
            });
    });

    it('Should return the data of the logged in user', (done) => {
        console.log(token)
        chai.request(server)
            .get('/api/me')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should retrieve product data', (done) => {
        chai.request(server)
            .get('/api/product')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('Should attempt to create a new product and return success', (done) => {
        chai.request(server)
            .post('/api/product')
            .type('application/json')
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('success');
                done();
            });
    });

    it('Should validate a user\'s access to a specific store', (done) => {
        chai.request(server)
            .get(`/api/store/${users[0].store}`)
            .set('Authorization', token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});
