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
        const mySubKey = $('meta[name=pubNubPubKey]').attr("content");
        const myUserID = $('meta[name=userID]').attr("content");

        // Make the connection to PubNub
        var pubnubConstructorObject = {
            subscribeKey: mySubKey,
            publishKey: myPubKey,
            userId: myUserID,
            heartbeatInterval: 0
        };
        chatSPA.pubnubClient = new PubNub(pubnubConstructorObject);

        // Connect to the chatbot channel for the conversation between this user and the chatbot.
        // In this example Im using dot notation for channel separation. You can find more details here:
        // https://www.pubnub.com/docs/general/channels/channel-naming
        const chatbotChannel = "gpt3."+myUserID;

        // Subscribe to PubNub to recieve messages.
        chatSPA.channelsArray.push("admin", chatbotChannel);
        chatSPA.pubnubClient.subscribe({
            channels: chatSPA.channelsArray,
        });
    },
    handleInputtedTextWindow: function(){
        var messageToSend = "";

        // Sent the message to the PN Channel.

        // Clear the message input box. 

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
