require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphQL/schema');

const app = express();

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());

// -------------------- Environment --------------------
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskdb';

// -------------------- Connect to MongoDB --------------------
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// -------------------- GraphQL Endpoint --------------------
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // Enable GraphiQL in development
}));

// -------------------- Root Route --------------------
app.get('/', (req, res) => {
  res.send('Task Manager GraphQL API is running. Visit /graphql');
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
