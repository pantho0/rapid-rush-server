const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware : 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.guubgk2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const parcelsCollection = client.db('RapidRush').collection('parcels')
    // To save user parcel data api
    app.post("/parcels", async(req,res)=>{
        try{
            const parcel = req.body;
            const result = await parcelsCollection.insertOne(parcel)
            res.send(result);
        }catch(error){
            console.log(error);
        }
    })
    // To get user all parcel data api 
    app.get("/bookings", async(req, res)=>{
      try{
        let query = {}
      if(req.query.email){
        query = {email : req.query?.email}
      }
      const result = await parcelsCollection.find(query).toArray();
      res.send(result);
      }
      catch(error){
        console.log(error);
      }
    })
    // To get single parcel api
    app.get("/update/:id",async(req,res)=>{
      try{
        const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await parcelsCollection.findOne(query);
      res.send(result)
      }catch(error){
        console.log(error);
      }
    })
    // To update parcel api
    app.put("/update/:id", async(req,res)=>{
      const id = req.params.id;
      const {name,
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
        approxDelivery} = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedDoc = {
        $set: {name,
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
        approxDelivery}}
        const result = await parcelsCollection.updateOne(filter, updatedDoc, options)
        res.send(result)


    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



    









  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get("/", (req,res) => {
    res.send("RAPIDRUSH is rushing for delivery")
})

app.listen(port, ()=>{
    console.log(`RapidRush is running on port ${port}`);
})