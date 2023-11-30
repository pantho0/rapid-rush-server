const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware :
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.guubgk2.mongodb.net/?retryWrites=true&w=majority`;

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
    const parcelsCollection = client.db("RapidRush").collection("parcels");
    const usersCollection = client.db("RapidRush").collection("users");
    const deliveryInfoCollection = client.db("RapidRush").collection("deliveryInfo");
    // To save user parcel data api
    app.post("/parcels/:id?", async (req, res) => {
      try {
        const parcel = req.body;
        const result = await parcelsCollection.insertOne(parcel);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // To get user all parcel data api
    app.get("/bookings", async (req, res) => {
      try {
        let query = {};
        if (req.query.email) {
          query = { email: req.query?.email };
        }
        const result = await parcelsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // Delivery Man's Parcel Api

    app.get("/deliverList/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {deliveryManId : id}
      const result = await parcelsCollection.find(query).toArray()
      res.send(result)
    })


    // To get single parcel api
    app.get("/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await parcelsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // To update parcel api
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const {
        name,
        email,
        phone,
        type,
        receiverName,
        weight,
        receiverAddress,
        receiverPhone,
        requestedTime,
        latitude,
        longitude,
        price,
        bookingDate,
        deliveryManId,
        status,
        approxDelivery,
      } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name,
          email,
          phone,
          type,
          receiverName,
          weight,
          receiverAddress,
          receiverPhone,
          requestedTime,
          latitude,
          longitude,
          price,
          bookingDate,
          deliveryManId,
          status,
          approxDelivery,
        },
      };
      const result = await parcelsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // for cancel any parcel
    app.delete("/delete/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await parcelsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });


    //For save user info :
    app.post("/users", async(req,res)=>{
      const user = req.body;
      const query = {email: user.email}
      const isExist = await usersCollection.findOne(query)
      if(isExist){
        return res.send({message: "user exist", insertedId: null})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    
    app.get("/users/:email?", async(req,res)=>{
      const email = req.params.email;
      if(email){
        const query = {email : email}
        const result = await usersCollection.find(query).toArray();
        res.send(result)
      }else{
        const result = await usersCollection.find().toArray();
      res.send(result)
      }
      
    })
    
    app.get("/deliveryMan", async(req,res)=>{
      const query = {role : "dBoy"};
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })
    //For checking user role : 
    app.get("/user/role/:email", async(req,res)=>{
      const email = req.params.email;
      const query = {email : email};
      const result = await usersCollection.findOne(query)
      console.log(result);
      res.send(result)
    })  

    // Role changing api for admin : 
    app.patch("/user/makeAdmin/:id", async(req,res)=>{
      const id = req?.params?.id;
      const filter = {_id : new ObjectId(id)}
      const updatedRole = {
        $set : {
          role : "admin"
        }
      }
      const result = await usersCollection.updateOne(filter, updatedRole)
      res.send(result)
    })
    // Role changing api for user :
    app.patch("/user/makeUser/:id", async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updatedRole = {
        $set : {
          role : "user"
        }
      }
      const result = await usersCollection.updateOne(filter, updatedRole)
      res.send(result)
    })
    // Role changing api for user :
    app.patch("/user/makedBoy/:id", async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedRole = {
        $set : {
          role : "dBoy"
        }
      }
      const result = await usersCollection.updateOne(filter, updatedRole)
      res.send(result)
    })
    // Update Parcel Info After Assign Delivery Man 
    app.patch("/assign/:id", async(req, res)=>{
      const id = req.params.id;
      const {deliveryManID} = req.body;
      console.log(deliveryManID);
      const filter = {_id: new ObjectId(id)}
      const updatedInfo = {
        $set : {
          status : "On the way",
          deliveryManId : deliveryManID
        }
      } 
      const result = await parcelsCollection.updateOne(filter, updatedInfo)
      res.send(result)
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("RAPIDRUSH is rushing for delivery");
});

app.listen(port, () => {
  console.log(`RapidRush is running on port ${port}`);
});
