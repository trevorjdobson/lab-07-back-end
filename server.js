'Use strict'

//Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());


//Routes
app.get('/location', searchLatLong);

app.get('/weather', searchWeather);

app.use('*',(req, res)=> {
  res.send('You got in the wrong place')
})


/*--Functions--*/

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

function searchLatLong(request,response){
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

function searchWeather(request,response){
  console.log(request.query.data.latitude)
  let lat = request.query.data.latitude;
  let long = request.query.data.longitude;
  let weatherLocation = `${lat},${long}` || '37.8267,-122.4233';
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${weatherLocation}`
  superagent.get(url)
    .then(result => {
      console.log(result.body.daily.data);
      let forecastArr = result.body.daily.data.map(el=>{
        return new FormattedDailyWeather(el);
      })
      response.send(forecastArr);
    }).catch(e=>{
      console.error(e);
      response.status(500).send('Status 500')
    })
}


//Starting Server
app.listen(PORT, () =>{
  console.log('listing on port', PORT);
})
