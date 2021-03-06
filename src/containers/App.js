import React, { Component } from 'react';
import 'tachyons';
import './App.css';
import Navigation from '../components/Navigation';
import ImageLinkForm from '../components/ImageLinkForm';
import Rank from '../components/Rank';
import FaceRecognition from '../components/FaceRecognition';
import SignIn from '../SignIn/SignIn';
import Register from '../Register/Register';

const initialState = {
  route: 'signin',
  input: '',
  url: '',
  isSignedIn: false,
  box: {},
  user: {
        id: '',
        username: '',
        email: '',
        entries: 0,
        joined: ''
      }
};

class App extends Component {
  constructor(){
    super()
    this.onRouteChange = this.onRouteChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.handleDetectClick = this.handleDetectClick.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.state = initialState;
   }

  componentDidMount(){
    fetch('http://localhost:8080/')
      .then(response => response.json())
      .then(console.log)
  }

  loadUser(user){
    this.setState({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        entries: user.entries,
        joined: user.joined
      }
    });
  }

  calculateFaceLocation(response){
    const data = response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
        leftCol: data.left_col * width,
        topRow: data.top_row * height,
        bottomRow: height - (data.bottom_row * height),
        rightCol: width - (data.right_col * width)
      }
  }

  displayFaceBox(box){
    this.setState({
      box: box
    });
  }

  handleDetectClick(){ //perhaps better name "onPictureSubmit"
    this.setState({
      url: this.state.input
    });
   fetch('http://localhost:8080/imageurl', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
        })
    .then(response => response.json())
    .then(response => {
      if(response) {
        fetch('http://localhost:8080/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}));
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
  })
    .catch(err => {
      console.log(err);
    });
  }

  onInputChange(e){
      this.setState({
        input: e.target.value
      });
  }

   onRouteChange(route){
      if(route === 'home'){
        this.setState({
          route: 'home',
          isSignedIn: true
        });
      }
      else {
        this.setState(initialState);
        if(route === 'register'){
          this.setState({
            route: 'register'
          });
        }
      }
   }

  render(){
    const { url, route, isSignedIn, box } = this.state;
    const { username, entries } = this.state.user;

    return (
      <div>
        <Navigation onRouteChange={this.onRouteChange} currentRoute={route} />
        {
          isSignedIn
          ? <div>
              <Rank username={username} entries={entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.handleDetectClick}/>
              <FaceRecognition imageUrl={url} box={box} />
            </div>
          :
          (
            route === 'signin'
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }

}

export default App;
