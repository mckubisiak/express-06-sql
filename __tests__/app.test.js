require('dotenv').config();

const { execSync } = require('child_process');
const { getMarbleByRarity } = require('../lib/utils.js');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('get routes', () => {
  describe('routes', () => {
    let token;
    let raritys;
  
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
  
      const raritysData = await fakeRequest(app).get('/raritys');
      raritys = raritysData.body;

      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns marbles', async() => {
      const expectation = [
        {
          'name': 'catyeye',
          'id': 4,
          'image': 'catyeye.png',
          'description': 'This ones just gonna knock your stuff down.',
          'rarity': 'common',
          'price': '50',
          'cost': '4.25',
          'owner_id': 1
        },
        {
          'name': 'Basic Blue',
          'id': 2,
          'image': 'basicblue.png',
          'description': 'Baisc blue has some boring swirls',
          'rarity': 'common',
          'price': '6.5',
          'cost': '0.25',
          'owner_id': 1
        },
        {
          'name': 'Windy',
          'id': 3,
          'image': 'windy.png',
          'description': 'Swwoooosh',
          'rarity': 'uncommon',
          'price': '15',
          'cost': '3',
          'owner_id': 1
        },
        {
          'name': 'Neuron',
          'id': 5,
          'image': 'neuron.png',
          'description': 'Swwoooosh',
          'rarity': 'rare',
          'price': '250',
          'cost': '45',
          'owner_id': 1
        },
        {
          'name': 'Crack Attack',
          'id': 1,
          'image': 'crackattack.png',
          'description': 'Crack attack breaks other marbles in half',
          'rarity': 'rare',
          'price': '189',
          'cost': '16',
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/marbles')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns single marble', async() => {
      const expectation =
        {
          'id': 4,
          'name': 'catyeye',
          'image': 'catyeye.png',
          'description': 'This ones just gonna knock your stuff down.',
          'rarity': 'common',
          'price': '50',
          'cost': '4.25',
          'owner_id': 1
        }
      ;

      const data = await fakeRequest(app)
        .get('/marbles/4')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('creates a new marble!', async() => {

      const rarityId = getMarbleByRarity(raritys, 2);

      const data = await fakeRequest(app)
        .post('/marbles/')
        .send(
          {
            name: 'Earth Marble',
            image: 'earthmarble.png',
            description: 'spectacular object, terrible inhabitence ',
            rarity_id: rarityId,
            price: '50',
            cost: '5',
          })

        .expect('Content-Type', /json/)
        .expect(200);

      const marbles =  await fakeRequest(app)
        .get('/marbles/6')
        .expect('Content-Type', /json/)
        .expect(200);

      const postedMarble =  {
        id: 6,
        name: 'Earth Marble',
        image: 'earthmarble.png',
        description: 'spectacular object, terrible inhabitence ',
        rarity_id: rarityId,
        price: '50',
        cost: '5',
        owner_id: 1
      };

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

      console.log(data.body); 'SNAKES HERE GET YA NSAKES HERE';

      expect(data.body).toEqual(postedMarble);
      expect(marbles.body).toEqual(newMarble);
    });
    
    test('updates a single marble', async() => {

      const rarityId = getMarbleByRarity(raritys, 3);

      const data = await fakeRequest(app)
        .put('/marbles/6')
        .send({
          name: 'Neuron-Plus',
          image: 'neuron-plus.png',
          description: 'Swwoooosh-plus',
          id: 6,
          rarity_id: rarityId,
          price: '450',
          cost: '245'
        })
        .expect('Content-Type', /json/);
        // .expect(200);

      const marbleData = await fakeRequest(app)
        .get('/marbles/6')
        .expect('Content-Type', /json/)
        .expect(200);

        
      const postedMarble = {
        name: 'Neuron-Plus',
        image: 'neuron-plus.png',
        description: 'Swwoooosh-plus',
        rarity_id: rarityId,
        id: 6,
        owner_id: 1,
        price: '450',
        cost: '245'
      };

      const newMarble = {
        name: 'Neuron-Plus',
        image: 'neuron-plus.png',
        description: 'Swwoooosh-plus',
        rarity: 'rare',        
        id: 6,
        owner_id: 1,
        price: '450',
        cost: '245'
      };

      expect(data.body).toEqual(postedMarble);
      expect(marbleData.body).toEqual(newMarble);
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
        name: 'replace',
        image: 'this contents',
        description: 'if thi',
        rarity_id: 2,
        price: '50',
        cost: '5'
      };

      expect(marbleData.body).not.toContainEqual(newMarble);
    });
  });
});
