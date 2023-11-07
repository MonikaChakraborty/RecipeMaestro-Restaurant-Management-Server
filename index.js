// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const { parse } = require("dotenv");
// require("dotenv").config();
// const app = express();
// const port = process.env.PORT || 5000;

// // middleware
// app.use(cors());
// app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.63dg6sa.mongodb.net/?retryWrites=true&w=majority`;


// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const allFoodItemsCollection = client
//       .db("restaurantManagement")
//       .collection("allFoodItems");


//     // show all food items
//     app.get("/allFoodItems", async (req, res) => {
//       const page = parseInt(req.query.page);
//       const size = parseInt(req.query.size);
//       console.log('pagination query', page, size);
//       const cursor = allFoodItemsCollection.find()
//       .skip(page * size)
//       .limit(size)
//       const result = await cursor.toArray();
//       res.send(result);
//     });

    



//     // pagination
//     app.get("/allFoodItemsCount", async (req, res) => {
//       const count = await allFoodItemsCollection.estimatedDocumentCount();
//       res.send({ count });
//     });

    

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("restaurant management server is running");
// });

// app.listen(port, () => {
//   console.log(`Restaurant Management Server is running on port ${port}`);
// });


const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.63dg6sa.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const allFoodItemsCollection = client
      .db("restaurantManagement")
      .collection("allFoodItems");

    // show all food items with search
    app.get("/allFoodItems", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const searchTerm = req.query.searchTerm;

      let query = {};
      if (searchTerm) {
        query = { foodName: { $regex: new RegExp(searchTerm, "i") } };
      }

      const cursor = allFoodItemsCollection.find(query)
        .skip(page * size)
        .limit(size);

      const result = await cursor.toArray();
      res.send(result);
    });

    // pagination
    app.get("/allFoodItemsCount", async (req, res) => {
      const count = await allFoodItemsCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("restaurant management server is running");
});

app.listen(port, () => {
  console.log(`Restaurant Management Server is running on port ${port}`);
});

