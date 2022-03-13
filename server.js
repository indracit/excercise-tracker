const express = require('express')
const app = express()
const cors = require('cors')
const  bodyParser = require('body-parser')
require('dotenv').config()
const mongoose=require('mongoose')

mongoose.connect(process.env.DB_URI,{ useNewUrlParser: true }).then(()=>{console.log("success")}).
  catch(error => console.log(error));

   //userschema
  const userSchema = mongoose.Schema({username:'String'})
  const User=mongoose.model('User',userSchema)
  //details schema
  const excerciseSchema = mongoose.Schema({id:"String",description:'String',duration:'Number',date:'Date'})
  const Excercise=mongoose.model('Excercise',excerciseSchema)

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



//create user 
app.post('/api/users',(req,res)=>{
  const { username }=req.body
  console.log(`username : ${username}`);
  User.create({username},(err,data)=>{
    if(err){
      return res.json({error:'user not created'})
    }
    res.json({username:data.username,_id:data._id})
  })
})


//get all user details
app.get('/api/users',(req,res)=>{
    User.find({},(err,data)=>{
      if(err){
        return res.json({error:'no users'})
      }
      console.log(data);
      res.send(data)
    })
})



//create excercises
app.post('/api/users/:id/exercises',(req,res)=>{
  const {id}=req.params
  const {description,duration,date}=req.body
  var new_date;
  if(date){
    new_date =new Date(date)
  }
    else {new_date = new Date()}
  Excercise.create({id:id,description:description,duration:duration,date:new_date},(err,data)=>{
    if(err){
      console.log(err);
    }
    User.findById({_id:id},(err,userdata)=>{
      if(err){
        console.log(err);
      }
       const details={_id: data.id,
        username : userdata.username,
        date:data.date.toDateString(),
        duration:data.duration,
        description:data.description}
         console.log(details);
      res.json(details)
    })
  }) 
})
  
//get logs
app.get('/api/users/:_id/logs',(req,res)=>{
  const {_id}=req.params
  const {from,to,limit}=req.query
  console.log(`limit: ${limit}`);
  var new_from,new_to,new_limit;
  var query;
  let limitCheck=Number(limit)
  
  if(limitCheck==0){
    new_limit=0
  }
  else{
    new_limit=limitCheck
  }
  if(!from || !to){
    query={id:_id}
   }
  else {
      new_from=new Date(from)
      new_to = new Date(to)
       query={id:_id,date : {$gte:new_from,$lte:new_to}}
  }
   

  User.findById({_id:_id},(err,user)=>{
    if(err || !user){
      return res.send("couldn't find user data")
    }
     console.log(new_limit);
    Excercise.find(query).limit(+new_limit).exec((err,userData)=>{
      if(err){
        console.log(err);
      }
     
        var result=userData.map((item)=>{
          return {
            description: item.description,
            duration: item.duration,
            date: item.date.toDateString(),
          }
        })

        
        const data={
          username:user.username,
          count: userData.length,
          _id: _id,
          log:result
        }
        console.log(data)
        return res.json(data)
      
    })
  })
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
