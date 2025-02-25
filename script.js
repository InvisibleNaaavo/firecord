console.log("Script loaded, waiting for DOMContentLoaded...");
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded triggered");
    var app = document.getElementById("app");
    if (!app) {
        console.error("App element not found");
        return;
    }

    if (!localStorage.getItem("discordToken")) {
        showLogin();
    } else if (!localStorage.getItem("serverId")) {
        showServers();
    } else if (!localStorage.getItem("channelId")) {
        showChannels();
    } else {
        showChat();
    }
});

//function showELSB() {
//    try {
//        var erase = document.getElementById("erase");
//        erase.innerHTML = '<button id="eraseLocalStorageButton">clear localStorage</button>';
//        
//        var eLSB = document.getElementById("eraseLocalStorageButton");
//        eLSB.addEventListener("click", elsbMAIN);
//    } catch (error) {
//        console.error("Error in showELSB:", error);
//    }
//}

//function elsbMAIN() {
//    try {
//        localStorage.clear();
//        window.location.reload();
//        console.log("localStorage cleared successfully");
//    } catch (error) {
//        console.error("Error in elsbMAIN:", error);
//    }
//}

function showLogin() {
    try {
        var app = document.getElementById("app");
        app.innerHTML = '<input type="password" id="tokenInput" placeholder="enter token" />' +
                        '<button id="loginButton">login</button>';

        var loginButton = document.getElementById("loginButton");
        loginButton.addEventListener("click", login);
        console.log("Login form rendered successfully");
    } catch (error) {
        console.error("Error in showLogin:", error);
    }
}

function login() {
    try {
        var token = document.getElementById("tokenInput").value;
        if (!token) return alert("Enter a token");

        localStorage.setItem("discordToken", token);

        showServers();
    } catch (error) {
        console.error("Error in login:", error);
    }
}

function showServers() {
    try {
        console.log("Loading servers...");
        document.getElementById("app").innerHTML = "<h2>select a server</h2><button id='goBack'><-- back</button><ul id='serverList'></ul>";
        
        var gob3 = document.getElementById("goBack");
        gob3.addEventListener("click", F_goBack3);

        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader("Authorization", localStorage.getItem("discordToken"));
        
        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    console.log("Servers loaded successfully");
                    var servers = JSON.parse(xhr.responseText);
                    var list = document.getElementById("serverList");

                    servers.forEach(function(server) {
                        var item = document.createElement("li");
                        var link = document.createElement("a");
                        link.id = "menuItem-" + server.id;
                        link.classList.add("menu-item");
                        link.setAttribute("href", "#server-" + server.id);
                        link.setAttribute("data-icon", "brightness");
                        link.setAttribute("data-l10n-id", server.name);
                        link.textContent = server.name;

                        link.addEventListener("click", function() {
                            localStorage.setItem("serverId", server.id);
                            showChannels();
                        });

                        item.appendChild(link);
                        list.appendChild(item);
                    });
                } else {
                    console.error("Failed to load servers:", xhr.status, xhr.statusText);
                }
            } catch (error) {
                console.error("Error in showServers response:", error);
            }
        };

        xhr.onerror = function() {
            console.error("Request failed in showServers:", xhr.status, xhr.statusText);
        };

        xhr.send();
    } catch (error) {
        console.error("Error in showServers:", error);
    }
}

function showChannels() {
    try {
        console.log("Loading channels...");
        document.getElementById("app").innerHTML = "<h2>select a channel</h2><button id='goBack'><-- back</button><ul id='channelList'></ul>";
        var serverId = localStorage.getItem("serverId");
        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader("Authorization", localStorage.getItem("discordToken"));
        
        var gob2 = document.getElementById("goBack");
        gob2.addEventListener("click", F_goBack2);
        
        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    console.log("Channels loaded successfully");
                    var channels = JSON.parse(xhr.responseText);
                    var list = document.getElementById("channelList");

                    channels = channels.filter(channel => channel.type !== 4);
                    
                    channels.forEach(function(channel) {
                        var item = document.createElement("li");
                        var link = document.createElement("a");
                        link.id = "menuItem-" + channel.id;
                        link.classList.add("menu-item");
                        link.setAttribute("href", "#channel-" + channel.id);
                        link.setAttribute("data-icon", "chat");
                        link.setAttribute("data-l10n-id", channel.name);
                        link.textContent = channel.name;

                        link.addEventListener("click", function() {
                            localStorage.setItem("channelId", channel.id);
                            showChat();
                        });

                        item.appendChild(link);
                        list.appendChild(item);
                    });
                } else {
                    console.error("Failed to load channels:", xhr.status, xhr.statusText);
                }
            } catch (error) {
                console.error("Error in showChannels response:", error);
            }
        };

        xhr.onerror = function() {
            console.error("Request failed in showChannels:", xhr.status, xhr.statusText);
        };

        xhr.send();
    } catch (error) {
        console.error("Error in showChannels:", error);
    }
}

var previousMessageIds = [];

function showChat() {
    try {
        console.log("Loading chat...");
        document.getElementById("app").innerHTML = "<button id='goBack'><-- back</button>" +
                                                    "<div id='messages'></div>" +
                                                    "<input type='text' id='messageInput' placeholder='type a message' />" +
                                                    "<button id='sendMessageButton'>send</button>";

        var gob = document.getElementById("goBack");
        gob.addEventListener("click", F_goBack);

        var sendMessageButton = document.getElementById("sendMessageButton");
        sendMessageButton.addEventListener("click", sendMessage);

        var channelId = localStorage.getItem("channelId");
        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader("Authorization", localStorage.getItem("discordToken"));
        
        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    var messages = JSON.parse(xhr.responseText);
                    var chatBox = document.getElementById("messages");

                    messages.reverse().forEach(function(msg) {
                        var messageContainer = document.createElement("div");
                        messageContainer.classList.add("message");

                        var profilePic = document.createElement("img");
                        profilePic.alt = `${msg.author.username}'s avatar`;
                        profilePic.classList.add("pfp");

                        var messageContent = document.createElement("div");
                        messageContent.classList.add("message-content");

                        function padToTwoDigits(num) {
                            return num < 10 ? '0' + num : num;
                        }

                        var date = new Date(msg.timestamp);
                        var formattedDate = `${date.getFullYear()}-${padToTwoDigits(date.getMonth() + 1)}-${padToTwoDigits(date.getDate())} ${padToTwoDigits(date.getHours())}:${padToTwoDigits(date.getMinutes())}`;

                        var username = document.createElement("strong");
                        username.textContent = `${msg.author.username}  `;
                        
                        var timestamp = document.createElement("span");
                        timestamp.classList.add("timestamp");
                        timestamp.textContent = formattedDate;

                        var messageText = document.createElement("p");
                        messageText.textContent = msg.content;

                        messageContent.appendChild(username);
                        messageContent.appendChild(timestamp);
                        messageContent.appendChild(messageText);

                        messageContainer.appendChild(profilePic);
                        messageContainer.appendChild(messageContent);

                        if (msg.edited_timestamp) {
                            var editedIndicator = document.createElement("span");
                            editedIndicator.classList.add("edited");
                            editedIndicator.textContent = " (edited)";
                            messageContent.appendChild(editedIndicator);
                            editedIndicator.style.backgroundColor = "yellow"; 
                        }

                        if (!Array.isArray(previousMessageIds)) {
                            console.warn("previousMessageIds was not an array, resetting to empty array.");
                            previousMessageIds = [];
                        }

                        console.log("previousMessageIds type:", typeof previousMessageIds, previousMessageIds);

                        if (previousMessageIds.indexOf(msg.id) === -1) {
                            previousMessageIds.push(msg.id);
                        } else {
                            editedIndicator.style.backgroundColor = "red";
                            editedIndicator.textContent = ` (deleted)`;
                        }

                        chatBox.appendChild(messageContainer);
                    });
                } else {
                    console.error("failed to load messages:", xhr.status, xhr.statusText);
                }
            } catch (error) {
                console.error("error in showChat response:", error);
            }
        };

        xhr.onerror = function() {
            console.error("request failed in showChat:", xhr.status, xhr.statusText);
        };

        xhr.send();
    } catch (error) {
        console.error("error in showChat:", error);
    }
}


function F_goBack() {
    try {
        localStorage.removeItem("channelId");
        window.location.reload();
    } catch (error) {
        console.error("F_goBack FAIL !!");
    }
}

function F_goBack2() {
    try {
        localStorage.removeItem("serverId");
        window.location.reload();
    } catch (error) {
        console.error("F_goBack FAIL !!");
    }
}

function F_goBack3() {
    try {
        localStorage.removeItem("discordToken");
        window.location.reload();
    } catch (error) {
        console.error("F_goBack FAIL !!");
    }
}

function sendMessage() {
    try {
        console.log("Sending message...");
        var message = document.getElementById("messageInput").value;
        var channelId = localStorage.getItem("channelId");
        var xhr = new XMLHttpRequest({ mozSystem: true });
        xhr.setRequestHeader("Authorization", localStorage.getItem("discordToken"));
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function() {
            try {
                if (xhr.status === 200) {
                    console.log("Message sent successfully, Reloading...");
                } else {
                    console.error("Failed to send message:", xhr.status, xhr.statusText);
                }
            } catch (error) {
                console.error("Error in sendMessage response:", error);
            }
        };

        xhr.onerror = function() {
            console.error("Request failed in sendMessage:", xhr.status, xhr.statusText);
        };

        xhr.send(JSON.stringify({ content: message }));
    } catch (error) {
        console.error("Error in sendMessage:", error);
    }
}

function storeMessage(msg) {
    var storedMessages = JSON.parse(localStorage.getItem("discordMessages")) || [];
    
    var exists = storedMessages.some(m => m.id === msg.id);
    
    if (!exists) {
        localStorage.setItem("discordMessages", JSON.stringify(storedMessages));
    }
}

window.onload = function () {
    loadStoredMessages();
    initWebSocket();
};

function loadStoredMessages() {
    var chatBox = document.getElementById("messages");
    if (!chatBox) {
        console.error("Error: 'messages' element not found.");
        return;
    }


    var storedMessages = JSON.parse(localStorage.getItem("discordMessages")) || [];

    for (var i = 0; i < storedMessages.length; i++) {
        renderMessage(storedMessages[i]);
    }
}

function renderMessage(msg) {
    var chatBox = document.getElementById("messages");

    if (document.getElementById('msg-' + msg.id)) {
    }

    var messageContainer = document.createElement("div");
    messageContainer.className = "message";

    var profilePic = document.createElement("img");
    profilePic.alt = msg.author.username + "'s avatar";
    profilePic.className = "pfp";

    var messageContent = document.createElement("div");
    messageContent.className = "message-content";

    function padToTwoDigits(num) {
        return num < 10 ? '0' + num : num;
    }

    var date = new Date(msg.timestamp);
    var formattedDate = date.getFullYear() + "-" + 
                        padToTwoDigits(date.getMonth() + 1) + "-" + 
                        padToTwoDigits(date.getDate()) + " " + 
                        padToTwoDigits(date.getHours()) + ":" + 
                        padToTwoDigits(date.getMinutes());

    var username = document.createElement("strong");
    username.textContent = msg.author.username + "  ";
    
    var timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = formattedDate;

    var messageText = document.createElement("p");
    messageText.textContent = msg.content;

    messageContent.appendChild(username);
    messageContent.appendChild(timestamp);
    messageContent.appendChild(messageText);

    messageContainer.appendChild(profilePic);
    messageContainer.appendChild(messageContent);

    if (msg.attachments && msg.attachments.length > 0) {
        for (var i = 0; i < msg.attachments.length; i++) {
            var attachment = msg.attachments[i];

            if (attachment.content_type && attachment.content_type.startsWith("image/")) {
                var imageElement = document.createElement("img");
                imageElement.src = attachment.url;
                imageElement.className = "attachment-image";
                messageContainer.appendChild(imageElement);
            }
        }
    }

    if (msg.embeds && msg.embeds.length > 0) {
        for (var i = 0; i < msg.embeds.length; i++) {
            var embed = msg.embeds[i];
            var embedContainer = document.createElement("div");
            embedContainer.className = "embed";

            if (embed.title) {
                var embedTitle = document.createElement("h4");
                embedTitle.textContent = embed.title;
                embedContainer.appendChild(embedTitle);
            }

            if (embed.description) {
                var embedDesc = document.createElement("p");
                embedDesc.textContent = embed.description;
                embedContainer.appendChild(embedDesc);
            }

            if (embed.image) {
                var embedImage = document.createElement("img");
                embedImage.src = embed.image.url;
                embedImage.className = "embed-image";
                embedContainer.appendChild(embedImage);
            }

            messageContainer.appendChild(embedContainer);
        }
    }

    chatBox.appendChild(messageContainer);
}

function initWebSocket() {
    var token = localStorage.getItem("discordToken");
    var channelId = localStorage.getItem("channelId");
    if (!token || !channelId) return console.error("Token or Channel ID is missing.");

    var socket;

    if (window.WebSocket) {
    } else if (window.MozWebSocket) {
    } else {
        return console.error("WebSocket is not supported in this environment.");
    }

    socket.onopen = function () {
        var identifyData = {
            op: 2,
            d: {
                token: token,
                properties: {
                    $os: "windows",
                    $browser: "chrome",
                    $device: "chrome"
                }
            }
        };
        socket.send(JSON.stringify(identifyData));
    };

    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        if (data.t === "MESSAGE_CREATE") {
            var message = data.d;
            console.log("New message:", message);
            
        }
    };

    socket.onerror = function (error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function () {
        console.log("WebSocket connection closed, attempting to reconnect");
    };
}

initWebSocket();