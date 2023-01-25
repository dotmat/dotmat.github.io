'use-strict';

var paulSPA = {
  pubnubClient: null,
  username: null,
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
        console.log("PubNub Paul the SDR is Launching.");
        const myPubKey = $('meta[name=pubNubPubKey]').attr("content");
        const mySubKey = $('meta[name=pubNubSubKey]').attr("content");
        paulSPA.username = $('meta[name=userID]').attr("content");
        // Make the connection to PubNub
        var pubnubConstructorObject = {
            subscribeKey: mySubKey,
            publishKey: myPubKey,
            userId: chatSPA.username,
            heartbeatInterval: 0
        };
        paulSPA.pubnubClient = new PubNub(pubnubConstructorObject);
        const chatbotChannel = "paul."+chatSPA.username;
        
        paulSPA.channelsArray.push("admin", chatbotChannel);
        paulSPA.pubnubClient.subscribe({
            channels: chatSPA.channelsArray,
        });
        
        // Create Event Listeners for the App
        paulSPA.pubnubClient.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    console.log('Connected Event;', statusEvent);
                    // Write the connected time to localStorage
                    localStorage.setItem('connectedTime', statusEvent.currentTimetoken);
                };
                if (statusEvent.category === "PNReconnectedCategory") {
                    console.log('PubNub Issued a Reconnect Event');
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
       },
       handleInputtedTextWindow: function(){
        var messageToSend = $('#paulSPA-textInput').val();
        var messageContainer = {"content": {"type": "text","message": messageToSend},"sender": paulSPA.username}


        // Sent the message to the PN Channel.
        var outgoingPubNubPayload = {
            channel : "paul."+paulSPA.username,
            message : messageContainer, 
            sendByPost: true, 
            sender: paulSPA.username,
        };

        paulSPA.pubnubClient.publish(outgoingPubNubPayload, function(status, response) {
            console.log('PubNub Response:');
            console.log(status, response);
        });

        // Clear the message input box.
        $('#paulSPA-textInput').val('');

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
