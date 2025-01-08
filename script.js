const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");

let userMessage = null;
API_KEY = "AIzaSyAcDhEtVq2aKHLVlutOLlMxZSmv8o--HKk"
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Create a new message element and return it 
const createmessageElement = (content, ...className) => {
    const div = document.createElement("div");
    div.classList.add("message", ...className);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement) => {
    const words = text.split(' ');

    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];


        // if all words are displayed
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
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
        

        // get api response text
        const apiResponse = data?.candidates[0].content.parts[0].text;
        showTypingEffect(apiResponse, textElement);
    } catch (error) {
        console.log(error);
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
    chatList.appendChild(incomingMessageDiv); 

    generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // revert after a second
}

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim();

    if (!userMessage) return; // exit if there is no message
    
    const html = `<div class="message-content">
                  <img src="images/profile-picture.jpg" alt="User Image" class="avatar">
                  <p class = "text"></p>
                </div>`;
    const outgoingMessageDiv = createmessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); //clear input field
    setTimeout(showLoadingAnimation, 400); // show the loading animation after the delay
}

// toggle between themes
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});


// Prevent default form submission.
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
})