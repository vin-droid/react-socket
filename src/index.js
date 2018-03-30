import React from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import $ from "jquery/dist/jquery.min.js";
window.jQuery = $;
window.$ = $;
global.jQuery = $;
import './ui/css/style.css';
import Notifier from './app/services/notification';

class App extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount() {
    this.socket = io('/')
    this.socket.on('message', message => {
      Notifier.notify({text: message.text, image: message.image, from: message.from})
    })
  }


  render () {
    return (
      <div>
        <input type='text' placeholder='Enter a message...' />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
