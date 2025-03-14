const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const cameraName = "uvc";
// Cambia esto al nombre de la cámara que quieras usar (el nombre tiene que estar en minúsculas)

const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", (id) => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = window.stream;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", (id) => {
  if (peerConnections[id]) {
    peerConnections[id].close();
    delete peerConnections[id];
  }
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

const videoElement = document.querySelector("video");
// const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

//  audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getDevices().then(gotDevices).then(getStream);

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  window.deviceInfos = deviceInfos;
  videoSelect.innerHTML = "";

  for (const deviceInfo of deviceInfos) {
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label;
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);

      // Auto-select the camera based on `cameraName`
      if (deviceInfo.label.toLowerCase().includes(cameraName)) {
        videoSelect.value = deviceInfo.deviceId;
      }
    }
  }
}

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => track.stop());
  }

  //const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;

  const constraints = {
    audio: false, // audioSource ? { deviceId: { exact: audioSource } } : true,
    video: videoSource ? { deviceId: { exact: videoSource } } : true,
  };

  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  videoElement.srcObject = stream;

  // Update selected indices in dropdowns
  /* audioSelect.selectedIndex = [...audioSelect.options].findIndex(
    option => option.value === stream.getAudioTracks()[0]?.getSettings()?.deviceId
  ); */
  videoSelect.selectedIndex = [...videoSelect.options].findIndex(
    (option) =>
      option.value === stream.getVideoTracks()[0]?.getSettings()?.deviceId
  );

  socket.emit("broadcaster");
}

function handleError(error) {
  console.error("Error: ", error);
}
