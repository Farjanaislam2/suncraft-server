const express=require('express');
const cors = require('cors');
const cloudinary=require('cloudinary').v2
const fileUpload=require("express-fileupload")
const jwt=require('jsonwebtoken')
const { ObjectId } = require('mongodb');


const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const port =process.env.PORT || 5000;


const app=express();

//middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  
}))

//cloudinary config

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_NAME, 
  api_key:process.env.CLOUDINARY_KEY, 
  api_secret:process.env.CLOUDINARY_SECRET 
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sa2k7xp.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

function verifyJWT(req,res,next){
  console.log('token inside virifyJWT', req.headers.authorization);
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(401).send('unauthorized access')
  }
  
  const token=authHeader.split('')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if(err){
      return res.status(403).send({message: 'forbidded acess'})
    }
    req.decoded=decoded;
    next();

  })
}

async function run() {
  try {
   
    const imageCollection =client.db('suncraft').collection('suncraftImage')
    const homeVideoCollection =client.db('suncraft').collection('homeVideo')
    const logoCollection =client.db('suncraft').collection('addedlogo')
    const customerLogoCollection =client.db('suncraft').collection('addedCustomerLogo')
    const tableDataCollection =client.db('suncraft').collection('allTableData')
    const aboutDataCollection=client.db('suncraft').collection('about')
    const aboutCollection=client.db('suncraft').collection('aboutData')
    const consultingDataCollection=client.db('suncraft').collection('consulting')
    const videoCall=client.db('suncraft').collection('schedule')
    const usersCollection =client.db('suncraft').collection('users')




//user collection

app.post('/users', async(req,res) =>{
  const user = req.body
  console.log(user)
  const result = await usersCollection.insertOne(user);
  res.send(result)
})

app.get('/users', async(req,res) =>{
  const query = {}
  const users = await usersCollection.find(query).toArray();
  res.send(users)
})

//admin email
app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ isAdmin: user?.role === 'admin' });
})


//admin

app.put('/users/admin/:id', verifyJWT,  async (req, res) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await usersCollection.findOne(query);

  if (user?.role !== 'admin') {
      return res.status(403).send({ message: 'forbidden access' })
  }


  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedDoc = {
      $set: {
          role: 'admin'
      }
  }
  const result = await usersCollection.updateOne(filter, updatedDoc, options);
  res.send(result);
})




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


//logo add & get customer

app.post('/addCustomerLogo', async(req,res) =>{
  const add = req.body
  console.log(add)
  const result = await customerLogoCollection.insertOne(add);
  res.send(result)
})

app.get('/getCustomerLogo', async(req,res)=>{
const query = {}
const getLogo = await customerLogoCollection.find(query).toArray();
res.send(getLogo)
})


//table data add & get

app.post('/addTableData', async(req,res) =>{
  const addData = req.body
  console.log(addData)
  const result = await tableDataCollection.insertOne(addData);
  res.send(result)
})


app.get('/getTableData', async(req,res)=>{
const query = {}
const result = await tableDataCollection.find(query).toArray();
res.send(result)
})


//About text and image

app.post('/addAbout', async(req,res) =>{
  const about = req.body
  console.log(about)
  const result = await aboutDataCollection.insertOne(about);
  res.send(result)
})


app.get('/getAbout', async(req,res)=>{
const query = {}
const result = await aboutDataCollection.find(query).toArray();
res.send(result)
})


  //About us video
  
app.post('/addAboutData', async(req,res) =>{
  const imgVideo = req.files.video;
  const result = await cloudinary.uploader.upload(imgVideo.tempFilePath,{
    public_id: `${Date.now()}`,
    resource_type:"auto",
    folder: "videos"
  });

  // this is cloudinary response
  console.log(result,'=====cloudinary============');
  // res.send(result)



     // Save the uploaded file metadata to MongoDB
     const media = {
      publicId: result.public_id,
      format: result.format,
      url: result.secure_url,
      type: result.resource_type,
      // Set other metadata fields as needed
    };

    const saveabout=await aboutCollection.insertOne(media)

    console.log(saveabout,'=====saveabout============');

      // Return the saved media metadata as the response
      res.send(saveabout)
})


app.get('/getAboutData', async(req,res)=>{
const query = {}
const getAboutData = await aboutCollection.find(query).toArray();
res.send(getAboutData)
})


 //Home video
  
//  app.post('/homeVideo', async(req,res) =>{
//   const imgVideo = req.files.video;
//   const result = await cloudinary.uploader.upload(imgVideo.tempFilePath,{
//     public_id: `${Date.now()}`,
//     resource_type:"auto",
//     folder: "videos"
//   });
// 
//   // this is cloudinary response
//   console.log(result,'=====cloudinary============');
//   // res.send(result)
// 
// 
// 
//      // Save the uploaded file metadata to MongoDB
//      const media = {
//       publicId: result.public_id,
//       format: result.format,
//       url: result.secure_url,
//       type: result.resource_type,
//       // Set other metadata fields as needed
//     };
// 
//     const saveHomeVideo=await homeVideoCollection.insertOne(media)
// 
//     console.log(saveHomeVideo,'=====saveHomeVideo============');
// 
//       // Return the saved media metadata as the response
//       res.send(saveHomeVideo)
// })


app.post('/homeVideo', async(req, res) => {
  try {
    if (!req.files || !req.files.video) {
      throw new Error('No video file found');
    }

    const imgVideo = req.files.video;
    const result = await cloudinary.uploader.upload(imgVideo.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
      folder: "videos"
    });

    // Log the Cloudinary response
    console.log(result, '=====cloudinary============');

    // Save the uploaded file metadata to MongoDB
    const media = {
      publicId: result.public_id,
      format: result.format,
      url: result.secure_url,
      type: result.resource_type,
      // Set other metadata fields as needed
    };

    const saveHomeVideo = await homeVideoCollection.insertOne(media);

    console.log(saveHomeVideo, '=====saveHomeVideo============');

    // Return the saved media metadata as the response
    res.send(saveHomeVideo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});


app.get('/getHomeVideo', async(req,res)=>{
const query = {}
const getHomeVideo = await homeVideoCollection.find(query).toArray();
res.send(getHomeVideo)
})



//consulting data
app.post('/consulting', async(req,res) =>{
  const consulting = req.body
  console.log(consulting)
  const result = await consultingDataCollection.insertOne(consulting);
  res.send(result)
})


app.get('/getConsulting', async(req,res)=>{
const query = {}
const result = await consultingDataCollection.find(query).toArray();
res.send(result)
})



//video call data 
// Replace this with your video call service integration logic
app.post('/api/schedule', async(req, res) => {
  const { title, time } = req.body;
  const result = await videoCall.insertOne({
    title: title,
    time: time,
  });
  // Logic to schedule the video call using the selected service
  // Example: Use an external video call API to schedule the call
  
  // Return a response indicating success
  res.json({ result});
});



//jwt

const expiration = Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60); // 6 months in seconds

app.get('/jwt',async(req,res)=>{
  const email=req.query.email;
  const query={email:email};
  const user=await usersCollection.findOne(query);
  if(user){
    const token=jwt.sign({email}, process.env.ACCESS_TOKEN,{ expiresIn: expiration })
    
    return res.send({accessToken:token});
  }
  res.status(403).send({accessToken:''})
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