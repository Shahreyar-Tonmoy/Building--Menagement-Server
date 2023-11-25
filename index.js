const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0ipecx.mongodb.net/?retryWrites=true&w=majority`;

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0ipecx.mongodb.net/?retryWrites=true&w=majority`;



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
        // Connect the client to the server	(optional starting in v4.7)
      
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const ApartmentsCollaction = client.db("BuildSync").collection('Apartments')
        const RentsCollaction = client.db("BuildSync").collection('Rents')
        const UserCollaction = client.db("BuildSync").collection('User')
        const AnnouncementCollaction = client.db("BuildSync").collection('Announcement')
        

        app.get('/announcement', async (req, res) => {
            const cursor = AnnouncementCollaction.find()
            const result = await cursor.toArray()
            res.send(result)
        })


        app.post('/announcement' , async (req, res) => {
            const addProduct = req.body
            console.log(addProduct);
            const result = await AnnouncementCollaction.insertOne(addProduct)
            res.send(result)
        })




        app.get('/apartments', async (req, res) => {
            const cursor = ApartmentsCollaction.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/apartments' , async (req, res) => {
            const addProduct = req.body
            console.log(addProduct);
            const result = await ApartmentsCollaction.insertOne(addProduct)
            res.send(result)
        })

        app.get('/rents', async (req, res) => {
            const cursor = RentsCollaction.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/rents' , async (req, res) => {
            const addProduct = req.body
            console.log(addProduct);
            const result = await RentsCollaction.insertOne(addProduct)
            res.send(result)
        })

        app.get('/rents/:id' , async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await RentsCollaction.findOne(query)
            res.send(result)

        })


        app.get('/users', async (req, res) => {
            const cursor = UserCollaction.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/users' , async (req, res) => {
            const user = await req?.body
            const query =await {Email: user.Email}
            console.log(query);

            const existingUser = await UserCollaction.findOne(query)
            if(existingUser){
                return res.send({ message: "user already exists", insertedId: null})
            }


            console.log(user);
            const result = await UserCollaction.insertOne(user)
            res.send(result)
        })

        app.get('/users/:email' , async (req, res) => {
            const id = req.params.email
            const query = { Email: id }
            const result = await UserCollaction.findOne(query)
            res.send(result)

        })

        
        // app.get('/product/:id' , async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: new ObjectId(id) }
        //     const result = await productCollaction.findOne(query)
        //     res.send(result)

        // })
        // app.get('/mycart' , async (req, res) => {
        //     const cursor = MyCartCollaction.find()
        //     const result = await cursor.toArray()
        //     res.send(result)
        // })
        
        // app.get('/mycart/:id' , async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: new ObjectId(id) }
        //     const result = await MyCartCollaction.findOne(query)
        //     res.send(result)

        // })
        
        
        
        // app.delete('/mycart/:id' , async (req, res)=>{
        //     const id =req.params.id
        //     const query ={ _id: new ObjectId(id) }
        //     const result = await MyCartCollaction.deleteOne(query)
        //     res.send(result)
        // })

        // // post opciton
        // app.post('/product' , async (req, res) => {
        //     const addProduct = req.body
        //     console.log(addProduct);
        //     const result = await productCollaction.insertOne(addProduct)
        //     res.send(result)
        // })
        

        // // update opction

        app.put('/rents/:id' , async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const UpdateProduct = req.body
            const Updates = {
                $set: {
                    Status: UpdateProduct.Status,
                    
                }
            }
            const result = await RentsCollaction.updateOne(filter, Updates, options)
            res.send(result)
        })

         app.delete('/rents/:id' , async (req, res)=>{
            const id =req.params.id
            const query ={ _id: new ObjectId(id) }
            const result = await RentsCollaction.deleteOne(query)
            res.send(result)
        })
        app.put('/users/:email' , async (req, res) => {
            const email = req.params.email
            const filter = { Email: email }
            const options = { upsert: true }
            const UpdateProduct = req.body
            const Updates = {
                $set: {
                    Role: UpdateProduct.Role,
                    
                }
            }
            const result = await UserCollaction.updateOne(filter, Updates, options)
            res.send(result)
        })

         app.delete('/users/:id' , async (req, res)=>{
            const id =req.params.id
            const query ={ _id: new ObjectId(id) }
            const result = await UserCollaction.deleteOne(query)
            res.send(result)
        })

        



    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("BuildSync Hub server is running")
})

app.listen(port, () => {
    console.log(`BuildSync Hub server is running on port : ${port}`);
})