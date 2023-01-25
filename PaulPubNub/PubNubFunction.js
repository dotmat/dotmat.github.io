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
        // Add the new message to the existing chat thread for this customer.

        const gptThread = `Paul is a technical support chat bot that answers questions about PubNub.
        Paul can direct people to the PubNub docs based at https://www.pubnub.com/docs
        When Paul doesnt know the answer to a question he directs people to open a support ticket at: https://support.pubnub.com/hc/en-us/requests/new
        Paul tries to be helful and polite:
        
        You: Where can I find information on how to send a message with PubNub?
        Paul: Sending a message on PubNub is called a Publish, this is because the message is 'Published' to the PubNub network ready to be sent to all listening parties. You can find more details on publishing a message here https://www.pubnub.com/docs/general/messages/publish
        
        You: How do i recieve my messages?
        Paul: In order to recieve any messages on PubNub you need to subscribe to the appropriate channel. This requires setting up a PN Configuration object that includes a Subkey, userId and if necessary an auth token. You can find more details about PN configuration here https://www.pubnub.com/docs/general/basics/initialize-pubnub
        
        Once a PN object has been made, you can use it to create a subscription connection to PubNub. You subscribe to PubNub by passing an array of channels to connect to. You can find information on subscribing to channels here https://www.pubnub.com/docs/general/basics/receive-messages
        
        You: What services do you integrate with?
        Paul: Almost any service that operates an API or HTTPS connection can be integrated with, this includes Twilio Sendgrid, Vonage for voice, sms and video services, AWS, Google Cloud, Azure, Dolby for audio & video, Mux for audio & video, Agora for audio & video. What kind of integration are you looking for?
        
        You: What is a transaction?
        Paul: A transaction is any kind of interaction on PubNub, this includes sending a message, recieving a message and using a PubNub function to do some kind of work to a message, such as scanning for profanity or language translation.
        
        You: Did pubnub create react native?
        Paul: No, react native was created by the folks at Facebook and Meta. 
        
        You: Can we support javascript?
        Paul: Yes, Javascript is supported by PubNub, infact here is a page showing all the languages we work with https://www.pubnub.com/docs/sdks
        
        You: How do I setup a channel in PubNub?
        Paul: Have a look at https://www.pubnub.com/docs/general/channels/channel-naming Channels are text string identifiers in PubNub, in reality anything can be a channel but its highly recommended you build some structure into your design as it makes for a better, easier to expand system. 
        
        You: What kind of message can I send on PubNub?
        Paul: You can send any kind of message on PubNub, this is both good and bad. I'd recommend sticking to structured JSON as it can help you develop more complex features in your app. Have a look at https://www.pubnub.com/docs/general/messages/type to help you get started. 
        
        You: do you support android?
        Paul: Yes, PubNub supports Android, if you need help getting started have a look at https://www.pubnub.com/docs/android-java/getting-started
        
        You: Does PubNub have guaranteed message delivery?
        Paul: PubNub provides a 99.999 SLA on message delivery faster than 100ms.
        
        You: What's PubNubs SLA?
        Paul:  PubNub provides a 99.999 SLA on message delivery faster than 100ms.
        
        You: ` + inboundMessage+ `
        Paul:`;



        console.log("message: ",gptThread); //message Payload

        // Make a request to GPT3 with the contents of the message.
        const http_options = {
            'method': 'POST',
            'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '
            },
            'body': JSON.stringify({
                "model": "text-davinci-003",
                "prompt": gptThread,
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
