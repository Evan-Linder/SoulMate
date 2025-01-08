const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions  = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button")
const chatContainer = document.querySelector(".chat-container");
const scrollMarker = document.querySelector(".scroll-marker");


let userMessage = null;
let isResponseGenerating = false;

API_KEY = "AIzaSyAcDhEtVq2aKHLVlutOLlMxZSmv8o--HKk"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom.
}

loadLocalstorageData();

// Create a new message element and return it 
const createmessageElement = (content, ...className) => {
    const div = document.createElement("div");
    div.classList.add("message", ...className);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');

    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");


        // if all words are displayed
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatList.innerHTML); // save chats to local storage
            chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom.
        }
    }, 75);
}

const generateAPIResponse = async (incomingMessageDiv) => {

    const textElement = incomingMessageDiv.querySelector(".text"); // get text element

    // send a post request to the api with the user's message
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{text: userMessage}]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message)

        // get api response text
        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);

    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// show a loading animation while waiting for the API response.
const showLoadingAnimation = () => {
    const html = `
                <div class="message-content">
                    <img src="images/loading.svg" alt="AI Image" class="avatar">
                    <p class = "text"></p>
                    <div class = "loading-indicator">
                        <div class = "loading-bar"></div>
                        <div class = "loading-bar"></div>
                        <div class = "loading-bar"></div>
                    </div>
                </div>
                <span onclick = "copyMessage(this)" class = "icon material-symbols-outlined">content_copy</span>`;
    const incomingMessageDiv = createmessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv); // append the current chat
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom.
    generateAPIResponse(incomingMessageDiv); // feed the api the message.
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // revert after a second
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;

    if (!userMessage || isResponseGenerating) return; // exit if there is no message

    isResponseGenerating = true;

    const html = `<div class="message-content">
                  <img src="images/profile-picture.jpg" alt="User Image" class="avatar">
                  <p class = "text"></p>
                </div>`;
    const outgoingMessageDiv = createmessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); //clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom.
    document.body.classList.add("hide-header"); // hide the header once chats have started
    setTimeout(showLoadingAnimation, 400); // show the loading animation after the delay
}

// set suggestion to handle outgoing chat when a suggestion is called.
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});

// toggle between themes
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode")
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// delete all chats from the local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all messages?")) {
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
});

// Prevent default form submission.
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
})

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            //when scroll marker comes into view, we can reveal the old text
            chatList.classList.remove("hide-old-text");
        } else {
            // when scroll marker is out of view hide the old text
            chatList.classList.add("hide-olde-text");
        }
    });
}, { threshold: 0});

observer.observe(scrollMarker);

// add styles to hide old messages
document.styleSheets[0].insertRule(
    `chat-list.hide-old-text {
    opactiy: 0.3; 
    pointer-events: none;
    }`
, 0);