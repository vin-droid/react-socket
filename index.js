const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const socketIo = require('socket.io')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackConfig = require('./webpack.config.js')
const config = require('config')
const request = require('request')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json()); 
app.use(webpackDevMiddleware(webpack(webpackConfig)))
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
    console.log(req.body);
  const { Body, From, MediaUrl0 } = req.body
  const message = {
    body: Body,
    from: From.slice(8),
    img: MediaUrl0
  }
  io.emit('message', message)
  res.send(`
           <Response>
            <Message>Thanks for texting!</Message>
           </Response>
           `)
})

io.on('connection', socket => {
  socket.on('message', body => {
    socket.broadcast.emit('message', {
      body,
      from: socket.id.slice(8)
    })
  })
})

server.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));



// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
    (process.env.MESSENGER_VALIDATION_TOKEN) :
    config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and
// assets located at this address.
const SERVER_URL = (process.env.SERVER_URL) ?
    (process.env.SERVER_URL) :
    config.get('serverURL');

// Creates the endpoint for our webhook 
// Adds support for GET requests to our webhook
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {

    console.error("Missing config values");
    process.exit(1);
}
// if (process.env.NODE_ENV === 'production') {
    // app.use(express.static('client/build'));
    // console.log(process.env.NODE_ENV);
    
    // app.use(express.static('client/public'));
// }
/*
 * Use your own validation token. Check that the token used in the Webhook
 * setup is the same token used here.
 *
 */
app.get('/api', function (req, res, next) {
    let data = {
        message: 'Hello World!'
    };
    res.status(200).send(data);
});


 app.get('/api/webhook', function (req, res) {
     console.log("Validating webhook");     
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/api/webhook', function (req, res) {
    var data = req.body;
 console.log(req.body);
    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {

                var senderID = messagingEvent.sender.id;
                console.log("Hello ");
                if (messagingEvent.message != undefined){
                    // sendTextMessage(senderID, messagingEvent.message.text);
                }                
                // console.log("message event: ", messagingEvent);
                if (messagingEvent.optin) {
                    console.log("optin: ", messagingEvent);
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    console.log("message: ", messagingEvent);
                    if (messagingEvent.message.attachments != undefined){
                        messagingEvent.message.attachments.forEach(function (attachment) {
                            console.log("attachment url:",attachment.payload.url);
                        }) ;
                    }
                    if (messagingEvent.message.attachments != undefined) {
                        messagingEvent.message.attachments.forEach(function (attachment) {
                            console.log("attachment type:", attachment.payload.type);
                            console.log("attachment url:", attachment.payload.url);
                        });
                    }
                    // // receivedMessage(messagingEvent);
                    // const message = {
                    //     body: messagingEvent.message.text,
                    //     from: messagingEvent.sender.id
                    // }
                    // io.emit('message', message)
                    sendTextMessage(senderID, messagingEvent.message.text);

                } else if (messagingEvent.delivery) {
                    console.log("delivery: ", messagingEvent);
                    // receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    console.log("postback: ", messagingEvent);
                    // receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    // receivedMessageRead(messagingEvent);
                    console.log("read:", messagingEvent);
                } else if (messagingEvent.account_linking) {
                    // receivedAccountLink(messagingEvent);
                    console.log(" Account linking event:", messagingEvent)
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

/*
DB 
whenver webhoook invoke save or delete user comment

page load -> fetch data from db

*/

function receivedAuthentication(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam,
        timeOfAuth);

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    sendTextMessage(senderID, "Authentication successful");
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}


function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}

