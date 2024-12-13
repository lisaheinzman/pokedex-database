import fs from "fs"
import express from "express"
import { ConnectionCheckOutFailedEvent, MongoClient } from "mongodb"

export let cachedDb
export let client
const DB_NAME = "project3"
const MONGODB_URI = "mongodb://localhost:37017/project9"
const COLLECTION_NAME = "trainers"

const app = express()
const port = 3000

import bodyParser from 'body-parser'

app.use(bodyParser.json());

// Condense the output that mongodb provides to the specified values 
function printpostCollection(postCollection) {
console.log(`${postCollection.title}: ${postCollection.rank}: ${postCollection.published}`)
}
async function start() {
    const connectToDatabase = async () => {
        if (cachedDb) {
            console.log("Existing cached connection found!")
            return cachedDb
        }
        console.log("Aquiring new DB connection.... " + MONGODB_URI)
        try {
            // Connect to MongoDB database
        
            client = await MongoClient.connect(MONGODB_URI)
            console.log("client connected")
            // Specify database
            const db = await client.db(DB_NAME)
        
            cachedDb = db
            console.log("Connected")
            return db
        } catch (error) {
            console.log("ERROR aquiring DB Connection!")
            console.log(error)
            throw error
    }
    console.log("Somehow didn't work")
    }
    connectToDatabase()
    //Runs function that closes the database after data retrieval
    
    // initial loading info to database
    app.post("/postinit", async (request, response) => {
    const trainers = JSON.parse(fs.readFileSync("trainers.json"))
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.insertMany(trainers)
    response.send()
    })

    // delete entire database
    app.delete("/trainer/all", async (request, response) => {
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.deleteMany({})
    response.send()
    })

    // 1 GET /trainers : Returns all trainers
    app.get("/trainers", async (request, response) => {
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const docs = await trainerCollections.find({}).toArray()
    const newDoc = JSON.stringify(docs)
    response.send(newDoc)
    })

    // 2 POST trainer /trainer - Accepts a JSON object of a trainer 
    // as the body of the request and adds it to the list of trainers.
    app.post("/trainer", async (request, response) => {
    const content = JSON.stringify(request.body)
    const parsed = JSON.parse(content)
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.insertOne(parsed)
    response.send()
    })

    // 3 DELETE /trainer/:trainerName - Removes a trainer based on the trainerName param
    app.delete("/trainer/:trainerName", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.deleteOne({trainerName : selection})
    response.send()
    })

    // 4 UPDATE /trainer/:trainerName/updatePokedex - Updates pokedex to increment by one according to trainerName param
    app.patch("/trainer/:trainerName/updatePokedex", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateOne({trainerName : selection},  {$inc: {pokedex :  1}})
    response.send(result)
    })

    // 5 GET /trainer/pokemon/:trainerName - Returns an array of pokemon associated with a trainerName param
    app.get("/trainer/:trainerName/pokemon", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const docs = await trainerCollections.findOne({trainerName : selection}, {"pokemon": 1})
    response.send(docs.pokemon)
    })

    // 6 POST /trainer/:trainerName/pokemon - Inserts an pokemon object into the array of pokemon
    // according to the trainerName param
    app.post("/trainer/:trainerName/pokemon", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateOne(
        {trainerName : selection}, {$push: {pokemon: {
            pokemonName: "arbok",
            pokedexNum: 24,
            hp: 39,
            type: "fire"
        }}}
    )
    response.send()
    })

    // 7 DELETE /trainer/:trainerName/pokemon/:pokemonName - Removes a pokemon from a trainer based on the pokemonName param
    app.delete("/trainer/:trainerName/pokemon/:pokemonName", async (request, response) => {
    const trainerSel = request.params.trainerName
    const pokemonSel = request.params.pokemonName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateMany({trainerName : trainerSel},  {$pull: {pokemon : {pokemonName :  pokemonSel}}})
    response.send()
    })

    // 8 UPDATE /trainer/:trainerName/pokemon/:pokemonName/updatehp = Updates hp to 100 of the trainer and pokemon based on the trainerName and pokemonName param
    app.patch("/trainer/:trainerName/pokemon/:pokemonName/updatehp", async (request, response) => {
    const trainerSel = request.params.trainerName
    const pokemonSel = request.params.pokemonName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateOne({trainerName : trainerSel, "pokemon.pokemonName" : pokemonSel},  {$set: {"pokemon.$.hp" :  100}})
    response.send()
    })

    // 9 GET /trainer/:trainerName/items - Returns an array of items with a given trainer based on the param
    app.get("/trainer/:trainerName/items", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const docs = await trainerCollections.findOne({trainerName : selection}, {"items": 1})
    response.send(docs.items)
    })

    // 10 POST /trainer/:trainerName/pokemon - Inserts an item object to the array of items
    // based on the trainerName param
    app.post("/trainer/:trainerName/items", async (request, response) => {
    const selection = request.params.trainerName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateOne(
        {trainerName : selection}, {$push: {items: {
            itemName: "bicycle",
            itemType: "field item",
            quantity: 1,
            Cost: 1000000
        }}}
    )
    response.send()
    })

    // 11 DELETE /trainer/:trainerName/item/:itemName - Removes an specified item object based on the itemName param from 
    // the specified trainer based on the trainerName param
    
    app.delete("/trainer/:trainerName/items/:itemName", async (request, response) => {
    const trainerSel = request.params.trainerName
    const itemSel = request.params.itemName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateMany({trainerName : trainerSel},  {$pull: {items : {itemName :  itemSel}}})
    response.send()
    })

    // 12 UPDATE /trainer/:trainerName/:itemName/updateItem - Updates quantity to increment by 1 of the item from the itemName param
    // from the trainer specified by the trainerName param
    app.patch("/trainer/:trainerName/:itemName/updateItem", async (request, response) => {
    const trainerSel = request.params.trainerName
    const itemSel = request.params.itemName
    const project3DB = client.db(DB_NAME)
    const trainerCollections = project3DB.collection(COLLECTION_NAME)
    const result = await trainerCollections.updateOne({trainerName : trainerSel, "items.itemName" : itemSel},  {$inc: {"items.$.quantity" :  1}})
    response.send()
    })
    
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
// disconnectFromDatabase()
}

start()
