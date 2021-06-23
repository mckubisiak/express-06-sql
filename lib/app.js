const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});


app.post('/marbles/', async(req, res) => {
  try {
    const data = await client.query(`
  INSERT INTO marbles (name, image,  description, rarity_id, price, cost, owner_id) 
  VALUES ($1, $2, $3, $4, $5, $6, 1)
  RETURNING *
  `, [req.body.name, req.body.image, req.body.description, req.body.rarity_id, req.body.price, req.body.cost]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/raritys', async (req, res) => {
  try {
    const data = await client.query(`
      SELECT 	 id, rarity
      FROM     raritys
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/marbles', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 
    marbles.name, 
    marbles.id, 
    marbles.image,  
    marbles.description, 
    raritys.rarity, 
    marbles.price, 
    marbles.cost, 
    marbles.owner_id
    FROM marbles
    JOIN raritys 
    ON marbles.rarity_id = raritys.id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.get('/marbles/:id', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 
    marbles.id, 
    marbles.name, 
    marbles.image,  
    marbles.description, 
    raritys.rarity, 
    marbles.price, 
    marbles.cost, 
    marbles.owner_id
    FROM marbles
    JOIN raritys 
    ON marbles.rarity_id = raritys.id
    WHERE marbles.id = $1
    `, [req.params.id]);



    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});





app.put('/marbles/:id', async(req, res) => {
  try {
    // the SQL query is UPDATE
    const data = await client.query(`
      UPDATE marbles
      SET 
          name=$1,
          image=$2,
          description=$3,
          rarity_id=$4,
          price=$5,
          cost=$6
      WHERE id=$7
      RETURNING *
    `, [req.body.name, req.body.image, req.body.description, req.body.rarity_id, req.body.price, req.body.cost, req.params.id]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/marbles/:id', async(req, res) => {
  try {
    // the SQL query is DELETE
    const marbleData = await client.query('DELETE FROM marbles WHERE id=$1', [req.params.id]);
    
    res.json(marbleData.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;