const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
app.use(cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tx9lkv1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const carCollection = client.db("magicSearch").collection("cars");

    // Car related api's
    app.get("/cars", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const filter = req?.query;
      // console.log(filter);
      const query = {
        $and: [
          {
            $or: [
              { name: { $regex: filter?.search || "", $options: "i" } },
              { brand: filter?.brand },
            ],
          },
        ],
      };

      if (filter.brand) {
        query.$and.push({ brand: filter.brand });
      }

      if (filter.category) {
        query.$and.push({ category: filter.category });
      }

      if (filter?.price === "first") {
        query.$and.push({ price: { $gte: 20000, $lte: 50000 } });
      }

      if (filter?.price === "second") {
        query.$and.push({ price: { $gte: 50000, $lte: 100000 } });
      }

      if (filter?.price === "third") {
        query.$and.push({ price: { $gte: 100000, $lte: 200000 } });
      }

      if (filter?.price === "fourth") {
        query.$and.push({ price: { $gte: 1000000, $lte: 200000 } });
      }

      if (filter?.price === "sixth") {
        query.$and.push({ price: { $gte: 1000000, $lte: 3500000 } });
      }

      const sortOptions = {};
      if (filter.sort) {
        sortOptions.price = filter.sort === "asc" ? 1 : -1;
      }
      if (filter.newest) {
        sortOptions.creationDate = filter.newest === "newest" ? -1 : 1;
      }

      // console.log(page, size);
      const cursor = carCollection
        .find(query)
        .sort(sortOptions)
        .skip(page * size)
        .limit(size);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/carsCount", async (req, res) => {
      const count = await carCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running from port: ${port}`);
});
