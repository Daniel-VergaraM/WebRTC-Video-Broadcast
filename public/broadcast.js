const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const cameraName = "droidcam"; 
// Cambia esto al nombre de la cámara que quieras usar (el nombre tiene que estar en minusculas)

const socket = io.connect(window.location.origin);

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", (id) => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  // Use the global stream from the selected camera
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

// Get the video element from the HTML
const videoElement = document.querySelector("video");

getStream();

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      const camera = devices.find(
        (device) =>
          device.kind === "videoinput" &&
          device.label.toLowerCase().includes(cameraName)
      );

      if (!camera) {
        throw new Error("Camera not found.");
      }

      const audioDevice = devices.find(
        (device) => device.kind === "audioinput"
      );

      const constraints = {
        audio: audioDevice
          ? { deviceId: { exact: audioDevice.deviceId } }
          : true,
        video: { deviceId: { exact: camera.deviceId } },
      };

      console.log("Using video device:", camera.label);
      if (audioDevice) {
        console.log("Using audio device:", audioDevice.label);
      } else {
        console.log("No audio input device found, using default audio.");
      }

      return navigator.mediaDevices.getUserMedia(constraints);
    })
    .then(gotStream)
    .catch(handleError);
}

function gotStream(stream) {
  window.stream = stream;
  videoElement.srcObject = stream;
  socket.emit("broadcaster");
}

function handleError(error) {
  console.error("Error: ", error);
}
