'use-strict';

var paulSPA = {
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
        console.log("Paul the SDR Helper is Launching.");
        const myPubKey = $('meta[name=pubNubPubKey]').attr("content");
        const mySubKey = $('meta[name=pubNubSubKey]').attr("content");
        paulSPA.username = $('meta[name=userID]').attr("content");

        // Make the connection to PubNub
        var pubnubConstructorObject = {
            subscribeKey: mySubKey,
            publishKey: myPubKey,
            userId: paulSPA.username,
            heartbeatInterval: 0
        };
        paulSPA.pubnubClient = new PubNub(pubnubConstructorObject);

        // Connect to the chatbot channel for the conversation between this user and the chatbot.
        // In this example Im using dot notation for channel separation. You can find more details here:
        // https://www.pubnub.com/docs/general/channels/channel-naming
        const chatbotChannel = "paul."+paulSPA.username;

        // Subscribe to PubNub to recieve messages.
        paulSPA.channelsArray.push("admin", chatbotChannel);
        paulSPA.pubnubClient.subscribe({
            channels: paulSPA.channelsArray,
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
                // Check if the message is a type of text based message. 
                if(messagePayload.message.content.type == "text"){
                    // If the message is from us, then display it on the left hand side
                    // If the message is from PaulBot then display on the right
                    // Manage all other messages in the else container. 
                    var messageHTML ='I am HTML';
                    if(messagePayload.message.sender == paulSPA.username){
                        console.log("Human message being injected now.");
                        messageHTML = '<div class="d-flex justify-content-start mb-4"><div class="img_cont_msg"><img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg"></div><div class="msg_cotainer">'+messagePayload.message.content.message+'</div></div>';
                    } else if(messagePayload.message.sender == "paulBot"){
                        messageHTML = '<div class="d-flex justify-content-end mb-4"><div class="msg_cotainer_send">'+messagePayload.message.content.message+'</div><div class="img_cont_msg"><img src="https://100k-faces.glitch.me/random-image" class="rounded-circle user_img_msg"></div></div>';
                    } else {

                    }

                    // Add the HTML to the page
                    //console.log(messageHTML);
                    $('#messageConversationContainer').append(messageHTML);
                } else {

                }
            },
            presence: function(presenceEvent) {
                // handle presence
                console.log('New presence event, here are the details', presenceEvent);
            }
        });
        $("#paulSPA-textInput").keyup(function(event) {if (event.keyCode === 13) {paulSPA.handleInputtedTextWindow();};});
    },
    handleInputtedTextWindow: function(){
        var messageToSend = $('#paulSPA-textInput').val();
        var messageContainer = {"content": {"type": "text","message": messageToSend},"sender": paulSPA.username}


        // Sent the message to the PN Channel.
        var outgoingPubNubPayload = {
            channel : "gpt3."+paulSPA.username,
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
                //paulSPA.handleMessageAPIRequestToServerSuccess(data);
                successFunction(data);
            },
            error: function( jqXhr, textStatus, errorThrown ){
                if(textStatus == 'timeout'){
                    //console.log('Request Timeout');
                    //paulSPA.handleMessageAPIRequestToServerFailure({success: false, message: 'timeout'});
                    failureFunction({success: false, message: 'timeout'});
                } else {
                    //paulSPA.handleMessageAPIRequestToServerFailure(jqXhr.responseJSON);
                    failureFunction({success: false, message: 'timeout'});
                }
                //console.log(errorThrown);
                //console.log(jqXhr.responseJSON);
            }
        });
    },

};
