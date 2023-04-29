const express=require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const port =process.env.PORT || 5000;

const app=express();

//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sa2k7xp.mongodb.net/?retryWrites=true&w=majority`;

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
    const imageCollection =client.db('suncraft').collection('suncraftImage')
    const logoCollection =client.db('suncraft').collection('addedlogo')
    const tableDataCollection =client.db('suncraft').collection('addedTableData')

    // home image post & get

    app.post('/addImage', async(req,res) =>{
      const added = req.body
      console.log(added)
      const result = await imageCollection.insertOne(added);
      res.send(result)
  })

  app.get('/getImage', async(req,res)=>{
    const query = {}
    const getImage = await imageCollection.find(query).toArray();
    res.send(getImage)
})

//logo add & get

app.post('/addLogo', async(req,res) =>{
  const add = req.body
  console.log(add)
  const result = await logoCollection.insertOne(add);
  res.send(result)
})

app.get('/getLogo', async(req,res)=>{
const query = {}
const getLogo = await logoCollection.find(query).toArray();
res.send(getLogo)
})





//table data add & get

app.post('/addLogo ', async(req,res) =>{
  const add = req.body
  console.log(add)
  const result = await logoCollection.insertOne(add);
  res.send(result)
})

app.get('/getLogo', async(req,res)=>{
const query = {}
const getLogo = await logoCollection.find(query).toArray();
res.send(getLogo)
})
  } 



  finally {
    
  }
}
run().catch(console.dir);



app.get('/',async(req, res)=>{
    res.send('suncraft is running')
})

app.listen(port, ()=> console.log(`suncraft is running on ${port}`));