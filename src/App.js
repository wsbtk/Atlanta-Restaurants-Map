import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

var map;

class App extends Component {

  state = {
    restaurants: [],
    filteredRestaurants: [],
    markers: []
  }

  componentDidMount() {
    this.getRestaurants();
  }

  renderMap = () => {    
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyD1DrDBUd6GNL2EIBCxK-K0OjkTny8kbuA&callback=initMap")
    window.initMap = this.initMap
  }

  getRestaurants = () => {
    const endPoint = "https://api.foursquare.com/v2/venues/explore?"
    const parameters = {
      client_id: "503SSLTFBQE5VYVQAM1FZSBGHHPG0OFXB1TC5QI5BWS33ZLZ",
      client_secret: "GGHRZNCAO4OTK4IYKFK51YJ4HHVUC3OWJA1Q3W2NJOFZV0K1",
      query: "restaurant",
      near: "Atlanta",
      v: "20182507",
      limit: "5"      
    }

    axios.get(endPoint + new URLSearchParams(parameters))
      .then(response => {
        this.setState({
          restaurants: response.data.response.groups[0].items,
          filteredRestaurants: response.data.response.groups[0].items
        }, this.renderMap())
      })
      .catch(error => {
        console.log("ERROR!! " + error)
      })
  }

  initMap = () => {
    //Create the Map
    map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.7808076, lng: -84.3669668},
      zoom: 13
    })
    // Create An InfoWindow
    const infowindow = new window.google.maps.InfoWindow()
    this.state.restaurants.forEach(restaurant => {
      var contentString = `${restaurant.venue.name} <br> ${restaurant.venue.location.address}, ${restaurant.venue.location.city}` 
      // Create A Marker
      const markerObj = new window.google.maps.Marker({
        position: {lat: restaurant.venue.location.lat , lng: restaurant.venue.location.lng},
        map: map,
        title: restaurant.venue.name,
        animation: window.google.maps.Animation.DROP
      })
      markerObj.setVisible(true)
      
      //Marker Object, Info Window, and it's animation
      const newMarker = {marker:markerObj, restaurantId:restaurant.venue.id};
      this.setState({markers:[...this.state.markers, newMarker]});     
        markerObj.addListener('click', function() {
        infowindow.setContent(contentString)
        infowindow.open(map, markerObj)
        markerObj.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(function () {
          markerObj.setAnimation(null);}, 700);        
       })
       this.setState({infowindow});
    })
  }


  //Update the Markers
  updateMarkers = () => {
    this.state.markers.forEach(el => {
      const restaurant = this.state.filteredRestaurants.find(restaurant => restaurant.venue.id === el.restaurantId);
      if(!restaurant) el.marker.setVisible(false);
      else el.marker.setVisible(true);
    });

  }

  //Display the InfoWindow based on what was clicked on 
  readMap = key => {
    const markerObj = this.state.markers.find(marker => marker.restaurantId === key.venue.id);
    const contentString = `${key.venue.name} <br> ${key.venue.location.address}, ${key.venue.location.city}` 
    this.state.infowindow.setContent(contentString);
    this.state.infowindow.open(map, markerObj.marker);
    markerObj.marker.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(function () {
      markerObj.marker.setAnimation(null);}, 700); 
  }


  //The Filter function for the list of Restaurants. Updates the Markers and the List of Restaurants. 
  handleFilter = (newFilter) => {
    const filteredRestaurants = this.state.restaurants.filter(restaurant => restaurant.venue.name.toLowerCase().includes(newFilter.toLowerCase()));
    if (newFilter.length > 0) {
      this.setState(() => ({
        filteredRestaurants        
      }), this.updateMarkers);
    } else {
      this.setState(() => ({
        filteredRestaurants: this.state.restaurants
      }),this.updateMarkers);
    }
  };

  render() {
    return (
      <main> 
          <div className="container">
            <header role="banner">
              <h1>Restaurant Finder Near Atlanta</h1>
            </header>
          </div>
          <nav role="navigation">
            <div id="menuToggle">
              <input type="checkbox" />
                <span></span>
                <span></span>
                <span></span>
              <ul id="menu">
                <h1>Restaurants:</h1>
                  <div className="options-box">              
                      <div>
                      <Filter handleFilter={this.handleFilter} />         
                        {this.state.filteredRestaurants.map((restaurant, index) => (             
                          <div className="list-group" key={index}>
                            <ul 
                                aria-label = 'List of Restaurants'>                  
                                  <button  type="button" className="list-group-item list-group-item-action"
                                      onClick = {() => this.readMap(restaurant)
                                      }> 
                                        {restaurant.venue.name}                                                     
                                  </button>                                         
                            </ul>
                          </div>
                        ))}
                      </div>
                  </div>
              </ul>
            </div>
          </nav>
          <div className = "container-full-width">
            <div className="d-flex">
              <div className="mapContainer">
                <div id="map"></div>
              </div>
            </div>
          </div>
      </main>
    )
  }
}

//Search Function. The Filter is handled through this
const Filter = (props) => (
  <div className= "filter-list">
    <input
        id='form-control' 
        type='text' 
        className='form-input'
        placeholder='Enter a Restaurant Name' 
        aria-label="text filter"
        name="filter"
        onChange={(e) => {
          props.handleFilter(e.target.value); 
        }}/>
  </div>
  );

function loadScript(url) {
  var index  = window.document.getElementsByTagName("script")[0]
  var script = window.document.createElement("script")
  script.src = url
  script.async = true
  script.defer = true
  index.parentNode.insertBefore(script, index)
}

export default App;
