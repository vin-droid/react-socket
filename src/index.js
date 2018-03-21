import React from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import $ from "jquery/dist/jquery.min.js";
window.jQuery = $;
window.$ = $;
global.jQuery = $;

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = { messages: [] }
  }

  componentDidMount() {
    this.socket = io('/')
    this.socket.on('message', message => {
      this.notifyMsg(message);
      this.setState({ messages: [message, ...this.state.messages] })
    })
  }

  notifyMsg(message) {
    Lobibox.notify('default', {
      continueDelayOnInactiveTab: true,
      msg: message.body,
      title: message.from
    });
  }

  handleSubmit = event => {
    const body = event.target.value
    if (event.keyCode === 13 && body) {
      const message = {
        body,
        from: 'Me'
      }
      this.setState({ messages: [message, ...this.state.messages] })
      $('#root').css('background', "red")

      this.socket.emit('message', body)
      event.target.value = ''
    }
  }

  render () {
    const messages = this.state.messages.map((message, index) => {
      const img = message.img ? <img src={message.img} width='200px' /> : null
      return <li key={index}><b>{message.from}:</b>{message.body} {img}</li>
    })
    return (
      <div>
        <input type='text' placeholder='Enter a message...' onKeyUp={this.handleSubmit} />
        {messages}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
