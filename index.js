const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const stripe = require('stripe')(process.env.STRIPE_TOKEN_SECTET)


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
        const CouponsCollaction = client.db("BuildSync").collection('Coupons')
        const PaymentHistoryCollaction = client.db("BuildSync").collection('Payment History')
        

        app.post('/jwt',async(req,res)=>{
            const user = req.body
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECTET,{
                expiresIn: '1h' })
                res.send({ token })
        })


        const verifyToken = (req,res,next)=>{
            // console.log("verify Token",req.headers.authorization)
            if(!req.headers.authorization){
                return res.status(401).send({message: "forbidden access"})
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token,process.env.ACCESS_TOKEN_SECTET,(err,decoded) =>{
                if(err){
                    return res.status(401).send({message: "forbidden access"})
                }
                req.decoded = decoded
                
                next()
            })
           
        
        }


        const verifyAdmin =async(req,res,next)=>{
            const email = req.decoded?.email
            const query = {Email: email}
            const user = await UserCollaction.findOne(query)
            const isAdmin = user?.Role === "admin"
            if(!isAdmin){
                return res.status(403).send({message: "forbidden access"})
            }
            next()

        }


        app.get("/user/admin/:email",verifyToken, async (req,res)=>{
            const email = req.params.email
            console.log("email",email);
            if(email !== req.decoded?.email){
                return res.status(403).send({message: "unauthorized access"})
            }
            const query = {Email: email}
            const user = await UserCollaction.findOne(query)
            console.log(user);
            let admin = false
            if(user){
                admin =user?.Role === "admin"
                
            }
            res.send({ admin })
        })


        app.get("/user/member/:email",verifyToken, async (req,res)=>{
            const email = req.params.email
            // console.log("email",email);
            if(email !== req.decoded?.email){
                return res.status(403).send({message: "unauthorized access"})
            }
            const query = {Email: email}
            const user = await UserCollaction.findOne(query)
            console.log(user);
            let Member = false
            if(user){
                Member =user?.Role === "Member"
                
            }
            res.send({ Member })
        })


        app.get('/rents/:email' , async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await RentsCollaction.find(query).sort({$natural:-1}).toArray()
            // const statusdata = result.Status === "checked"
            // if(statusdata){
                
            //     res.send(result)
            // }

            res.send(result)

        })



      



        app.post('/paymentHistory' , async (req, res) => {
            const addProduct = req.body
            console.log(addProduct);
            const result = await PaymentHistoryCollaction.insertOne(addProduct)
            res.send(result)
        })
        app.get('/paymentHistory', async (req, res) => {
            const cursor = PaymentHistoryCollaction.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/status', async (req, res) => {
            const query = { Status: "booked"}
            const cursor = PaymentHistoryCollaction.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        
        




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


        app.post('/coupons' , async (req, res) => {
            const addProduct = req.body
            console.log(addProduct);
            const result = await CouponsCollaction.insertOne(addProduct)
            res.send(result)
        })

        app.get('/coupons', async (req, res) => {
            const cursor = CouponsCollaction.find().sort({$natural:-1})
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/coupons/:Coupon' , async (req, res) => {
            const CouponCode = req.params.Coupon
            const query = { CouponCode: CouponCode }
            const result = await CouponsCollaction.findOne(query)
            res.send(result)

        })




        app.get('/pagination', async (req, res) => {
            const count = await ApartmentsCollaction.estimatedDocumentCount()
            
            res.send({count})
        })

        

        app.get('/apartments', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)


            console.log(req.query);
            const cursor = ApartmentsCollaction.find()
            const result = await cursor
            .skip(page * size)
            .limit(size)
            .toArray()
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

        app.post('/rents' ,verifyToken, async (req, res) => {
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


        app.get('/users',  async (req, res) => {
            
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
                    AcceptDate: UpdateProduct.AcceptDate
                    
                    
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
                    Name: UpdateProduct.name,
                    
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



        app.post('/create-payment-intent',async(req,res) => {
            const price = req.body
            
            const amount = parseInt(price.tk * 100)
            console.log("data",amount)
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency : "usd",
                payment_method_types: ["card"]
                
                
                
            })
            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })

        



    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("BuildSync server is running")
})

app.listen(port, () => {
    console.log(`BuildSync server is running on port : ${port}`);
})