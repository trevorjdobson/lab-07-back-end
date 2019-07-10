'Use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

app.get('/location', searchLatLong);

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
  console.log(data);
  this.search_query = query;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng
}

function FormattedDailyWeather(data){
  this.forecast = data.summary;
  this.time = new Date(data.time*1000).toDateString();
}

function searchLatLong(request,response){
  console.log(request.query.data);
  let locationName = request.query.data || 'seattle';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`

  superagent.get(url)
    .then(result => {
      console.log(result.body);
      let location = new FormattedLocation(locationName, result.body);
      response.send(location);
    }).catch(e=>{
      console.error(e);
      response.status(500).send('Status 500')
    })
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