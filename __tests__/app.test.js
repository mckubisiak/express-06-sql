require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns marbles', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Crack Attack',
          image: 'crackattack.png',
          description: 'Crack attack breaks other marbles in half',
          category: 'rare',
          price:'189',
          cost: '16',
          owner_id: 1
        },
        {
          id: 2,
          name: 'Basic Blue',
          image: 'basicblue.png',
          description: 'Baisc blue has some boring swirls',
          category: 'common',
          price: '6.5',
          cost: '0.25',
          owner_id: 1
        },
        { 
          id: 3,
          name: 'Windy',
          image: 'windy.png',
          description: 'Swwoooosh',
          category: 'uncommon',
          price: '15',
          cost: '3',
          owner_id: 1
        },
        {
          id: 4,
          name: 'catyeye',
          image: 'catyeye.png',
          description: 'This ones just gonna knock your stuff down.',
          category: 'common',
          price: '50',
          cost: '4.25',
          owner_id: 1
        },
        { 
          id: 5,
          name: 'Neuron',
          image: 'neuron.png',
          description: 'Swwoooosh',
          category: 'rare',
          price:'250',
          cost: '45',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/marbles')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
