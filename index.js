require('dotenv').config(); // ✅ Load environment variables FIRST
console.log("✅ MONGODB_URI:", process.env.MONGODB_URI); // Debugging log

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./src/schema/typeDefs');
const resolvers = require('./src/resolvers/resolver');
const authenticate = require('./src/middleware/auth');
const cors = require('cors');

const PORT = process.env.PORT || 8081;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is not defined. Check your .env file.");
    process.exit(1);
}

async function startServer() {
    const app = express();
    app.use(cors());

    // ✅ Connect to MongoDB Atlas
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('🚀 MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            const user = authenticate(req);
            return { user };
        },
    });

    await server.start();
    server.applyMiddleware({ app });

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();
