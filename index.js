const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
// app.use(express.json());

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

    const orderCollection = client
      .db("restaurantManagement")
      .collection("orders");

    const userCollection = client
      .db("restaurantManagement")
      .collection("users");


    // get users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    // top food section
    app.get("/topFood", async (req, res) => {
      const show = 6;
      const cursor = allFoodItemsCollection
        .find()
        .sort({ count: "desc" })
        .limit(show);
      const result = await cursor.toArray();
      res.send(result);
    });

    

    // show all food items with search
    app.get("/allFoodItems", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const searchTerm = req.query.searchTerm;

      let query = {};
      if (searchTerm) {
        query = { foodName: { $regex: new RegExp(searchTerm, "i") } };
      }

      const cursor = allFoodItemsCollection
        .find(query)
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
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      // const options = {
      //   projection: { foodName: 1, foodImage: 1,foodCategory: 1, }
      // };

      // const result =await allFoodItemsCollection.findOne(query, options);
      const result = await allFoodItemsCollection.findOne(query);
      res.send(result);
    });


    // food purchase page
    app.get("/foodPurchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allFoodItemsCollection.findOne(query);
      res.send(result);
    });



    // added items
    app.get("/addedFoodItems", async (req, res) => {
      console.log(req.query.madeBy);

      let query = {};
      if (req.query?.madeBy) {
        query = { madeBy: req.query.madeBy };
      }

      const result = await allFoodItemsCollection.find(query).toArray();

      res.send(result);
    });



    app.get('/addedFoodItems/updateAddedFoodItems/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allFoodItemsCollection.findOne(query);
      res.send(result)
    })



    // orders
    app.get("/orders", async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });



    // users
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    // add food items to allFoodItems Collection
    app.post("/addFoodItems", async (req, res) => {
      const foodItem = req.body;
      // console.log(foodItem);
      const result = await allFoodItemsCollection.insertOne(foodItem);
      res.send(result);
    });



    // orders to orderCollection
    app.post("/orders", async (req, res) => {
      const order = req.body;
      // console.log(order);
      const filter = { foodName: order.foodName };
      const update = {
        $inc: { count: 1, quantity: -order.quantity },
      };

      await allFoodItemsCollection.updateOne(filter, update);

      const result = await orderCollection.insertOne(order);
      res.send(result);
    });


    // update added items
    app.put('/addedFoodItems/updateAddedFoodItems/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedFoodItem = req.body;

      const foodItem = {
        $set: {
          foodImage: updatedFoodItem.foodImage,
          foodName: updatedFoodItem.foodName,
          foodOrigin: updatedFoodItem.foodOrigin,
          foodCategory: updatedFoodItem.foodCategory,
          price: updatedFoodItem.price,
          description: updatedFoodItem.description,
          quantity: updatedFoodItem.quantity
        }
      }

      const result = await allFoodItemsCollection.updateOne(filter, foodItem, options)
      res.send(result);
    })



    // delete order
    app.delete('/orders/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })




    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
