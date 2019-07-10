'Use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

app.get('/location', (req,res)=>{
  try {
    const locationData = searchLatLong(req.query.data);
    res.send(locationData);
  }
  catch(error){
    console.error(error);
    res.status(500).send('Status 500');
  }
})

app.get('/weather', (req,res)=>{
  try{
    const weatherData = searchWeather(req.query.data);
    console.log(weatherData);
    res.send(weatherData);
  }
  catch(error){
    console.log(error);
    res.status(500).send('status 500');
  }
})

app.use('*',(req, res)=> {
  res.send('You got in the wrong place')
})

function FormattedLocation(query, data){
  this.search_query = query;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng
}

function FormattedDailyWeather(data){
  this.forecast = data.summary;
  this.time = new Date(data.time*1000).toDateString();
}

function searchLatLong(query){
  const geoData = require('./data/geo.json');
  let fakeQuery = 'seattle'
  const location = new FormattedLocation(fakeQuery,geoData);
  console.log(location)
  return location;
}

function searchWeather(query){
  const weatherData = require('./data/darksky.json');
  let forcastArr = weatherData.daily.data;
  let result = [];
  forcastArr.forEach(element => {
    result.push(new FormattedDailyWeather(element))
  })
  return result;
}


app.listen(PORT, () =>{
  console.log('listing on port', PORT);
})
