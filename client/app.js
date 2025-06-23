console.clear();
window.onload = async () => {
  const
      chat = document.querySelector("#chat"),
      video = document.querySelector("#video"),
      status = document.querySelector("#status"),
      peerId = document.querySelector("#peerId"),
      callBtn = document.querySelector("#callBtn"),
      chatInput = document.querySelector("#chatInput"),
      connection = document.querySelector("#connection"),
      connectBtn = document.querySelector("#connectBtn");

  let mediaRecorder;
  let recordedChunks = [];

  function setupCombinedRecording(localStream, remoteStream) {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    if (localStream.getAudioTracks().length > 0) {
      const localSource = audioContext.createMediaStreamSource(localStream);
      localSource.connect(destination);
    }

    if (remoteStream.getAudioTracks().length > 0) {
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);
      remoteSource.connect(destination);
    }

    recordedChunks = [];

    // MODIFICATION 1 : Spécifier le débit binaire audio (audioBitsPerSecond)
    // 64000 = 64 kbps (bon équilibre pour la voix)
    // Pour des fichiers encore plus petits, vous pouvez essayer 32000 (32 kbps)
    const options = {
      mimeType: 'audio/webm;codecs=opus', // Opus est très efficace pour la voix
      audioBitsPerSecond: 32000
    };

    mediaRecorder = new MediaRecorder(destination.stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = `appel_audio_${Date.now()}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
    };
    mediaRecorder.start();
  }

  // MODIFICATION 2 : Ajouter des contraintes pour un audio plus léger à la source
  const audioConstraints = {
    video: false,
    audio: {
      sampleRate: 16000, // Fréquence d'échantillonnage pour la voix
      channelCount: 1     // Audio en mono
    }
  };

  const audio = await navigator.mediaDevices.getUserMedia(audioConstraints);
  const response = await fetch("https://fulldroper.metered.live/api/v1/turn/credentials?apiKey=20b057434f2dba67cce42dbf43a66658ba5d");
  const servers = await response.json()
  const peer = new Peer({
    config: { 'iceServers': servers },
    timeout: 120000
  });

  peer.on('open', id => {
    status.innerHTML = "Online";
    peerId.innerHTML = id;
    let call;
    const chatHandler = function (conn) {
      status.innerHTML = "Connected to remote";
      connection.style.display = "none";
      connectBtn.style.display = "none";
      chatInput.style.visibility = "visible";
      callBtn.style.display = "block";

      const endCall = function (e) {
        status.innerHTML = "Connected to remote";
        callBtn.innerHTML = "Voice Call";
        console.log(e)
        callBtn.onclick = makeCall;
        call?.close();
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }
      const makeCall = function ({ target }) {
        target.innerHTML = "End call";
        call = peer.call(conn.peer, audio);

        call.on('stream', function (stream) {
          status.innerHTML = "Connected to voice";
          video.srcObject = stream;
          video.play();
          setupCombinedRecording(audio, stream);
          callBtn.onclick = endCall;
          call.on('close', endCall);
          call.on('error', endCall);
        })
      }

      callBtn.onclick = makeCall;

      conn.on('data', function (data) {
        const msg = document.createElement("li");
        msg.innerHTML = 'Remote: ' + data;
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
      });

      conn.on('close', function () {
        status.innerHTML = "Disconnected from remote";
        connection.style.display = "block";
        connectBtn.style.display = "block";
        chatInput.style.visibility = "collapse";
        callBtn.style.display = "none";
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      })

      conn.on('error', function (e) {
        status.innerHTML = "Disconnected from remote with error";
        connection.style.display = "block";
        connectBtn.style.display = "block";
        chatInput.style.visibility = "collapse";
        callBtn.style.display = "none";
        console.log(e);
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      })

      chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          if (!chatInput.value) return;
          conn.send(chatInput.value)
          const msg = document.createElement("li");
          msg.innerHTML = 'You: ' + chatInput.value;
          chat.appendChild(msg);
          chatInput.value = "";
          chat.scrollTop = chat.scrollHeight;
        }
      });
    }

    function connectToPeer() {
      if (!connection.value) return;
      const c = peer.connect(connection.value.trim())
      c.on('open', () => chatHandler(c))
      connection.value = "";
      connection.style.display = "none";
    }

    connection.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        connectToPeer();
      }
    });

    connectBtn.addEventListener("click", function() {
      connectToPeer();
    });

    peer.on('connection', c => c.on('open', () => chatHandler(c)))

    peer.on('close', () => {
      status.innerHTML = "Offline";
    })
    peer.on('error', (e) => {
      status.innerHTML = "Error " + e.type;
    })

    peer.on('call', call => {
      call.answer(audio);

      call.on('stream', function (stream) {
        status.innerHTML = "Connected to voice";
        callBtn.innerHTML = "End call";
        video.srcObject = stream;
        video.play();
        setupCombinedRecording(audio, stream);
        callBtn.onclick = endCall;
        call.on('close', endCall);
        call.on('error', endCall);
      })

      const endCall = function (e) {
        status.innerHTML = "Connected to remote";
        callBtn.innerHTML = "Voice Call";
        callBtn.onclick = makeCall;
        console.log(e)
        call?.close();
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }
      const makeCall = function ({ target }) {
        status.innerHTML = "Connected to voice";
        target.innerHTML = "End call";

        call.on('stream', function (stream) {
          video.srcObject = stream;
          video.play();
          callBtn.onclick = endCall;
          call.on('close', endCall);
          call.on('error', endCall);
        })
      }

      callBtn.onclick = endCall;
    });
  });
}