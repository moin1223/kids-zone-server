const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const fs = require('fs-extra');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;
app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.json());
app.use(cors());
app.use(express.static('Cources'));
const port = 5000;




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bghwt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

  const CoursesCollection = client.db("kidZone").collection("courses");
  const ReviewsCollection = client.db("kidZone").collection("reviews");
  const AdmissionCollection = client.db("kidZone").collection("admission");
  const AdminCollection = client.db("kidZone").collection("admins");

  //add courses
  app.post('/addCourse', (req, res) => {
    const file = req.files.file;
    const CourseName = req.body.CourseName
    const price = req.body.price
    const filePath = `${__dirname}/Cources/${file.name}`;

    file.mv(filePath, err => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: 'Fild to upload image' })
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64')

      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, 'base64')
      };

      CoursesCollection.insertOne({ CourseName, price, image })
        .then(result => {
          fs.remove(filePath, error => {
            if (error) {
              console.log(error)
              res.status(500).send({ msg: 'Fild to upload image' })
            }
            res.send(result.insertedCount > 0)
          })

        })

    })


  })
  //data base theke course ana

  app.get('/Courses', (req, res) => {
    CoursesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })



  // Review deya and data base patano

  app.post('/addReviews', (req, res) => {
    const Name = req.body.Name
    const Description = req.body.Description
    ReviewsCollection.insertOne({ Name, Description })
      .then(result => {

        res.send(result.insertedCount > 0)
      })

  })
  //data base theke Review ana

  app.get('/Reviews', (req, res) => {
    ReviewsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  //single couse id diye dhore data neya
  app.get('/course/:id', (req, res) => {
    const id = req.params.id;
    CoursesCollection.find({ _id: ObjectId(id) })
      .toArray((err, documents) => {
        res.send(documents[0]);

      })
  })

  //admission gula database e patano
  app.post("/addAdmission", (req, res) => {
    const admission = req.body;
    AdmissionCollection.insertOne(admission)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  //data base theke admissions gula ana

  app.get('/Admissions', (req, res) => {
    AdmissionCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
  //data base theke email diye  admission  ana

  app.get('/Admission/:email', (req, res) => {
    const email = req.params.email;
    AdmissionCollection.find({ email: email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  // app.delete('/deleteRegistration/:id', (req, res) => {
  app.delete('/deleteAdmission/:id', (req, res) => {
    const id = req.params.id;
    AdmissionCollection.deleteOne({ _id: ObjectId(id) }, (err) => {
      if (!err) {
        res.send({ count: 1 })
      }
    })

  })

  // Admin data base patano
  app.post('/addAdmins', (req, res) => {
    const Name = req.body.Name
    const email = req.body.email
    AdminCollection.insertOne({ Name, email })
      .then(result => {

        res.send(result.insertedCount > 0)
      })

  })
  //adminkina deka
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    AdminCollection.find({ email: email })
      .toArray((err, admins) => {
        res.send(admins.length > 0);
      })
  })


  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
});


app.listen(process.env.PORT || port)