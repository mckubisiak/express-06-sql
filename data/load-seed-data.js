/* eslint-disable no-console */
const client = require('../lib/client');
// import our seed data:
const marbles = require('./marbles.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

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

    await Promise.all(
      marbles.map(marble => {
        return client.query(`
                    INSERT INTO marbles (name, image, description, category, price, cost, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [marble.name, marble.image, marble.description, marble.category, marble.price, marble.cost, user.id]);
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
