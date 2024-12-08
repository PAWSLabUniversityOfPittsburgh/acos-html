(function ($) {
    'use strict';

    var SPLICE_PROTOCOL = function () { };

    var nonceMap = {};

    SPLICE_PROTOCOL.sendMessage = function (event, payload, callback) {
        if (window.self !== window.top) { // loaded in iframe -- send message
            const message = {
                message_id: uuid.v4()
            }

            if (event == 'grade') {
                message.subject = 'SPLICE.reportScoreAndState'
                message.score = payload.points / payload.max_points
                message.state = payload
                
            } else if (event == 'log') {
                message.subject = 'SPLICE.sendEvent'
                message.data = payload
            } else if (event == 'content-load') {
                message.subject = 'SPLICE.getState'
                message.data = payload

                nonceMap[message.message_id] = callback

                const MESSAGE_TIMEOUT = 5000
                setTimeout(() => {
                    if ((message.message_id in nonceMap)) { 
                        delete nonceMap[message.message_id]
                        callback(null)
                    }
                }, MESSAGE_TIMEOUT)      
            }

            window.parent.postMessage(message, '*')
        }
    }
    // Make the namespace globally available
    window.SPLICE_PROTOCOL = SPLICE_PROTOCOL;

    function receiveMessage(event) {
        if (event.data.subject === 'SPLICE.getState.response') { 
          if (event.data.message_id in nonceMap) {
            // If not, already timed out
            nonceMap[event.data.message_id](event.data.state)
            delete nonceMap[event.data.message_id]
          }
        }
      }
  
      window.addEventListener('message', receiveMessage, false);

}(jQuery));
