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
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const allFoodItemsCollection = client.db("restaurantManagement").collection("allFoodItems");



    const orderCollection = client.db('restaurantManagement').collection("orders");

    const userCollection = client.db('restaurantManagement').collection("users");


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



    // show single food item
    app.get('/details/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      // const options = {
      //   projection: { foodName: 1, foodImage: 1,foodCategory: 1, }
      // };

      // const result =await allFoodItemsCollection.findOne(query, options);
      const result =await allFoodItemsCollection.findOne(query);
      res.send(result)
    })



    // food purchase/order page
    app.get('/foodPurchase/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result =await allFoodItemsCollection.findOne(query);
      res.send(result)
    })



     // users
     app.post('/users', async(req, res) => {
      const user = req.body;
      console.log(user);
      const result = await orderCollection.insertOne(user);
      res.send(result);
    })



    // orders
    app.post('/orders', async(req, res) => {
      const order = req.body;
      console.log(order);

     // Update the count and quantity in the allFoodItems collection
  const filter = { foodName: order.foodName };
  const update = {
    $inc: { count: 1, quantity: -order.quantity }, // Increment the count by 1 and decrement the quantity by the ordered quantity
  };

  await allFoodItemsCollection.updateOne(filter, update);
      
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })



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

