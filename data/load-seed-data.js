/* eslint-disable no-console */
const client = require('../lib/client');
// import our seed data:
const marbles = require('./marbles.js');
const usersData = require('./users.js');
const rarityData = require('./raritys.js');
const { getEmoji } = require('../lib/emoji.js');
// const { getRarityIdByName } = require('../lib/utils.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    const rarityResponse = await Promise.all(
      rarityData.map(rarity => {
        return client.query(`
                      INSERT INTO raritys (rarity)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [rarity.rarity]);
      })
    );

    const raritys = rarityResponse.map(response => {return response.rows[0];});
    console.log(raritys);

    await Promise.all(
      marbles.map(marble => { 

        const rarityFound =  raritys.find(rarity => {
          return rarity.id === marble.rarity_id;
        });
        
        console.log(rarityFound,  'THANKS FOR THE MEMORIES');
        console.log(raritys, 'even though they werent so sweet');
        console.log(marble.rarity_id, 'im running out of bad jokes');
        
        return client.query(`
                    INSERT INTO marbles (name, image, description, rarity_id, price, cost, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [marble.name, marble.image, marble.description, rarityFound.id, marble.price, marble.cost, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
