const socket = io();

// Elements
const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationFormButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = function() {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far down has the user scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    user: message.username,
    createdAt: moment(message.createdAt).format("hh:mm A"),
    message: message.text,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (locationObject) => {
  console.log(locationObject);
  const html = Mustache.render(locationMessageTemplate, {
    username: locationObject.username,
    createdAt: moment(locationObject.createdAt).format("hh:mm A"),
    url: locationObject.url,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", (data) => {
  const html = Mustache.render(sidebarTemplate, {
    room: data.room,
    users: data.users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", e.target.elements.message.value, (status) => {
    console.log("Sending message. Status:", status);
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});

$locationFormButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationFormButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {};
    location.latitude = position.coords.latitude;
    location.longitude = position.coords.longitude;

    socket.emit(
      "sendLocation",
      `https://google.com/maps?q=${location.latitude},${location.longitude}`,
      (status) => {
        console.log(status);
        $locationFormButton.removeAttribute("disabled");
      },
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
