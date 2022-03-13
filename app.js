const express = require('express');
const mongoose = require('mongoose');
 const Store = require('./api/models/store');
const app = express()
const axios = require('axios')
const GoogleMapsService = require('./API/services/googleMapsService');
const googleMapsService = new GoogleMapsService();
const port = 3000;
require('dotenv').config();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    next();
});

mongoose.connect('mongodb+srv://Julien_pwj:RUS2WEQwQbPUye6@cluster0.wqz3d.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
//parses incoming requests with JSON payloads and is based on body-parser
app.use(express.json({limit: '50mb'}))



app.delete('/api/stores', (req,res) => {
    Store.deleteMany({}, (err) =>{
        res.status(200).send(err)
    })
})

app.post('/api/stores', (req, res) => { 
    let dbStores = [];
    let stores = req.body;
    stores.forEach((store)=>{
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatusText: store.openStatusText,
            addressLines: store.addressLines,
            location: {
                type:'Point',
                coordinates: [
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]
            }
        })
    })
    Store.create(dbStores, (err, stores) =>{
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(stores);
        }
    })
});
 
app.get("/api/stores", (req, res)=> {
    const zipCode = req.query.zip_code;
   googleMapsService.getCoordinates(zipCode).then((coordinates) => {
        Store.find({
            location: {
                $near: {
                    $maxDistance: 3218,
                    $geometry:{
                        type: "Point",
                        coordinates: coordinates
                    }
                }
            }
        }, (err, stores)=>{
            if(err){
                res.status(500).send(err);
            } else {
                res.status(200).send(stores);
            }
        })
    })
})



app.listen(port, () => console.log(`App listening at http://localhost:${port}`))