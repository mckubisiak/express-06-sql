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
          rarity: 'rare',
          price:'189',
          cost: '16',
          owner_id: 1
        },
        {
          id: 2,
          name: 'Basic Blue',
          image: 'basicblue.png',
          description: 'Baisc blue has some boring swirls',
          rarity: 'common',
          price: '6.5',
          cost: '0.25',
          owner_id: 1
        },
        { 
          id: 3,
          name: 'Windy',
          image: 'windy.png',
          description: 'Swwoooosh',
          rarity: 'uncommon',
          price: '15',
          cost: '3',
          owner_id: 1
        },
        {
          id: 4,
          name: 'catyeye',
          image: 'catyeye.png',
          description: 'This ones just gonna knock your stuff down.',
          rarity: 'common',
          price: '50',
          cost: '4.25',
          owner_id: 1
        },
        { 
          id: 5,
          name: 'Neuron',
          image: 'neuron.png',
          description: 'Swwoooosh',
          rarity: 'rare',
          price:'250',
          cost: '45',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/marbles')
        .expect('Contgit sent-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns single marble', async() => {
      const expectation =
        {
          id: 4,
          name: 'catyeye',
          image: 'catyeye.png',
          description: 'This ones just gonna knock your stuff down.',
          rarity: 'common',
          price: '50',
          cost: '4.25',
          owner_id: 1
        }
      ;

      const data = await fakeRequest(app)
        .get('/marbles/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a new marble!', async() => {
      const data = await fakeRequest(app)
        .post('/marbles/')
        .send(
          {
            name: 'Earth Marble',
            image: 'earthmarble.png',
            description: 'spectacular object, terrible inhabitence ',
            rarity: 'uncommon',
            price: '50',
            cost: '5'
          })

        .expect('Content-Type', /json/)
        .expect(200);

      const marbles =  await fakeRequest(app)
        .get('/marbles')
        .expect('Content-Type', /json/)
        .expect(200);

      const newMarble =  {
        id: 6,
        name: 'Earth Marble',
        image: 'earthmarble.png',
        description: 'spectacular object, terrible inhabitence ',
        rarity: 'uncommon',
        price: '50',
        cost: '5',
        owner_id: 1
      };


      expect(data.body).toEqual(newMarble);
      expect(marbles.body).toContainEqual(newMarble);
    });
    
    test('updates a single marble', async() => {

      const data = await fakeRequest(app)
        .put('/marbles/6')
        .send({
          name: 'replace',
          image: 'this contents',
          description: 'if thi',
          rarity: 'object',
          price: '50',
          cost: '5'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const marbleData = await fakeRequest(app)
        .get('/marbles')
        .expect('Content-Type', /json/)
        .expect(200);

      const newMarble = {
        id: 6,
        name: 'replace',
        image: 'this contents',
        description: 'if thi',
        rarity: 'object',
        price: '50',
        cost: '5',
        owner_id: 1
      };

      expect(data.body).toEqual(newMarble);
      expect(marbleData.body).toContainEqual(newMarble);
    });

    test('/DELETE marbles deletes a single marbles', async() => {

      await fakeRequest(app)
        .delete('/marbles/6')
        .expect('Content-Type', /json/)
        .expect(200);

      const marbleData = await fakeRequest(app)
        .get('/marbles')
        .expect('Content-Type', /json/)
        .expect(200);

      const newMarble = {
        id: 6,
        name: 'replace',
        image: 'this contents',
        description: 'if thi',
        rarity: 'object',
        price: '50',
        cost: '5',
        owner_id: 1
      };

      expect(marbleData.body).not.toContainEqual(newMarble);
    });
  });
});
