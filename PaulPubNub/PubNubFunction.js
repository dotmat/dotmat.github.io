'use-strict';
const pubnub = require('pubnub');
const xhr = require("xhr");
export default (initialRequest) => {
    // PubNub to GPT3 function example. 
    // This script recieves a message from a user and then makes a request to GPT3 with the contents of the message. 
    // Once processed, the response is injected into the chatroom for the user to see. 

    console.log('request',initialRequest); //request
    const inboundChannel = initialRequest.channels[0];
    console.log("The person that sent this message is: ", initialRequest.message.sender);
    // If the message is from a human sender and that its a text based object
    if(initialRequest.message.content.type == "text" && initialRequest.message.sender != "gpt3Bot"){
        console.log("A human sent this message");
        const inboundMessage = initialRequest.message.content.message;
        console.log("message: ",inboundMessage); //message Payload

        // Make a request to GPT3 with the contents of the message.
        const http_options = {
            'method': 'POST',
            'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer Token Goes here.'
            },
            'body': JSON.stringify({
                "model": "text-davinci-003",
                "prompt": inboundMessage,
                "temperature": 0.7,
                "max_tokens": 1000,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0
            })
        };
        
        const url = 'https://api.openai.com/v1/completions';
        
        return xhr.fetch(url, http_options)
        .then((resp) => {
            const body = JSON.parse(resp.body);
            //console.log(body);
            var gpt3MessageResponse = body.choices[0].text
            console.log('gpt3 response; ', gpt3MessageResponse);

            // Sometes GPT3 returns \n\n in the reponse obeject, we dont need these so remove them before making a response body. 
            gpt3MessageResponse = gpt3MessageResponse.replace("\n\n", "");
            // Assemble the GPT3 message payload, Im using the PubNub Message types 'text' convention found here: 
            // https://www.pubnub.com/docs/general/messages/type#text

            const gpt3ResponseObject = {"content": {"type": "text","message": gpt3MessageResponse},"sender": "gpt3Bot"}
            // Make a new request to publish this message into the chat channel so the client can see the response.
            pubnub.publish({
                "channel": inboundChannel,
                "message": gpt3ResponseObject
                }).then((publishResponse) => {
                    console.log(`Publish Status: ${publishResponse[0]}:${publishResponse[1]} with TT ${publishResponse[2]}`);
                });
            

            return initialRequest.ok('Request succeeded');
        })
        .catch((err) => {
            return initialRequest.ok(`Request Failed: ${err}`);
        }); 


    } else {
        console.log("A robot sent this message, do nothing.");
        return initialRequest.ok(); // return a promise when you're done
    };
};
