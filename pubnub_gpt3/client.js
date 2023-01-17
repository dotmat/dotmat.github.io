'use-strict';

var chatSPA = {
    appName: null,
    appURL: null,
    pubnubClient: null,
    usePNSignals: false,
    username: null,
    accessToken: null,
    deliveryMethology: null,
    channelsArray:[],
    generateUUID: function(){
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    },
    launcher: function(){
        console.log("ChatSPA is Launching.");
        const myPubKey = $('meta[name=pubNubPubKey]').attr("content");
        const mySubKey = $('meta[name=pubNubSubKey]').attr("content");
        chatSPA.username = $('meta[name=userID]').attr("content");

        // Make the connection to PubNub
        var pubnubConstructorObject = {
            subscribeKey: mySubKey,
            publishKey: myPubKey,
            userId: chatSPA.username,
            heartbeatInterval: 0
        };
        chatSPA.pubnubClient = new PubNub(pubnubConstructorObject);

        // Connect to the chatbot channel for the conversation between this user and the chatbot.
        // In this example Im using dot notation for channel separation. You can find more details here:
        // https://www.pubnub.com/docs/general/channels/channel-naming
        const chatbotChannel = "gpt3."+chatSPA.username;

        // Subscribe to PubNub to recieve messages.
        chatSPA.channelsArray.push("admin", chatbotChannel);
        chatSPA.pubnubClient.subscribe({
            channels: chatSPA.channelsArray,
        });

        // Create Event Listeners for the App
        chatSPA.pubnubClient.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    console.log('Connected Event;', statusEvent);
                    // Write the connected time to localStorage
                    localStorage.setItem('connectedTime', statusEvent.currentTimetoken);
                };
                if (statusEvent.category === "PNReconnectedCategory") {
                    console.log('PubNub Issued a Reconnect Event');
                    // If a reconnection event occurrs check the expiration time of the accessToken
                    // This is done to ensure that if the client has been offline for a few days and the token gets expired make it seamless to get a reconnection event.
                    // if(){
                    //     // Access Token is Valid
                    // } else {
                    //     // Access Token is Invalid
                    //     chatSPA.handleInvalidAccessToken();
                    // };
                };
            },
            message: function(messagePayload) {
                // handle message
                console.log('New message event, here is the object:', messagePayload);
            },
            presence: function(presenceEvent) {
                // handle presence
                console.log('New presence event, here are the details', presenceEvent);
            }
        });
        $("#chatSPA-textInput").keyup(function(event) {if (event.keyCode === 13) {chatSPA.handleInputtedTextWindow();};});
    },
    handleInputtedTextWindow: function(){
        var messageToSend = $('#chatSPA-textInput').val();
        var messageContainer = {"content": {"type": "text","message": messageToSend},"sender": chatSPA.username}


        // Sent the message to the PN Channel.
        var outgoingPubNubPayload = {
            channel : "gpt3."+chatSPA.username,
            message : messageToSend, 
            sendByPost: true, 
            sender: chatSPA.username,
        };

        chatSPA.pubnubClient.publish(outgoingPubNubPayload, function(status, response) {
            console.log('PubNub Response:');
            console.log(status, response);
        });

        // Clear the message input box.
        $('#chatSPA-textInput').val('');

    },
    lazyAPIRequestToServer: function(resourceURL,messagePayload, requestType, successFunction, failureFunction){
        $.ajax({
            url: resourceURL,
            timeout: 5000,
            dataType: 'json',
            type: requestType,
            contentType: 'application/json',
            headers: { 'x-api-key': localStorage.getItem('accessToken') },
            data: JSON.stringify(messagePayload),
            processData: false,
            success: function( data, textStatus, jQxhr ){
                //console.log(data);
                //chatSPA.handleMessageAPIRequestToServerSuccess(data);
                successFunction(data);
            },
            error: function( jqXhr, textStatus, errorThrown ){
                if(textStatus == 'timeout'){
                    //console.log('Request Timeout');
                    //chatSPA.handleMessageAPIRequestToServerFailure({success: false, message: 'timeout'});
                    failureFunction({success: false, message: 'timeout'});
                } else {
                    //chatSPA.handleMessageAPIRequestToServerFailure(jqXhr.responseJSON);
                    failureFunction({success: false, message: 'timeout'});
                }
                //console.log(errorThrown);
                //console.log(jqXhr.responseJSON);
            }
        });
    },

};
