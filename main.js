const socket = io("https://webrtc-midterm.herokuapp.com/");
let usernameRemote;

$("#main-content").hide();

socket.on("DANH_SACH_ONLINE", (arrUserInfo) => {
  $("#main-content").show();
  $("#register").hide();
  arrUserInfo.forEach((user) => {
    const { username, id } = user;
    $("#ulUser").append(`<li id=${id}>${username}</li>`);
  });

  socket.on("CO_NGUOI_DUNG_MOI", (user) => {
    const { username, id } = user;
    $("#ulUser").append(`<li id=${id}>${username}</li>`);
  });

  socket.on("AI_DO_VUA_NGAT_KET_NOI", (peerId) => {
    $(`#${peerId}`).remove();
  });
});

socket.on("DANG_KY_THAT_BAI", () => alert("This username is already exist"));

function openStream() {
  const config = { audio: true, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}

// {
//   // key: "peerjs",
//   // host: "https://webrtc-midterm.herokuapp.com/",
//   // secure: true,
//   // port: 443,
// }
const peer = new Peer();
peer.on("open", (id) => {
  $("#my-peer").append(id);
  $("#btnSignup").click(() => {
    const username = $("#txtUsername").val();
    if (username === "") {
      return alert("Please choose a name");
    }
    $("#usernameLocal").append(username);
    socket.emit("NGUOI_DUNG_DANG_KY", { username, id });
  });
});
$("#usernameLocal").hide();
$("#usernameRemote").hide();
// caller
$("#btnCall").click(() => {
  const id = $("#remoteId").val();
  openStream().then((stream) => {
    playStream("localStream", stream);
    const call = peer.call(id, stream);
    call.on("stream", (remoteStream) => {
      $("#usernameLocal").show();

      playStream("remoteStream", remoteStream);
    });
  });
});

// Receiver

peer.on("call", (call) => {
  openStream().then((stream) => {
    console.log(call.peer);
    call.answer(stream);
    playStream("localStream", stream);
    call.on("stream", (remoteStream) => {
      // console.log(remoteStream);

      // console.log($(`#${remoteStream.id}`).val());
      $("#usernameRemote").append($(`#${call.peer}`).text());

      // $("#usernameRemote").append(socket.usernameRemote);
      playStream("remoteStream", remoteStream);
    });

    $("#usernameRemote").show();
    $("#usernameLocal").show();
  });
});

$("#ulUser").on("click", "li", function () {
  const id = $(this).attr("id");
  const username = $(this).text();
  socket.usernameRemote = username;
  $("#usernameRemote").append(username);

  openStream().then((stream) => {
    playStream("localStream", stream);

    const call = peer.call(id, stream);
    call.on("stream", (remoteStream) => {
      $("#usernameLocal").show();
      $("#usernameRemote").show();
      playStream("remoteStream", remoteStream);
    });
  });
});

let mic_switch = true;
let video_switch = true;

// function toggleVideo(localStream) {
//   if (localStream != null && localStream.getVideoTracks().length > 0) {
//     video_switch = !video_switch;

//     localStream.getVideoTracks()[0].enabled = video_switch;
//   }
// }

// function toggleMic() {
//   if (localStream != null && localStream.getAudioTracks().length > 0) {
//     mic_switch = !mic_switch;

//     localStream.getAudioTracks()[0].enabled = mic_switch;
//   }
// }

function stopStreamedVideo(videoElem) {
  const stream = videoElem.srcObject;
  const videoTracks = stream.getVideoTracks();

  if (videoTracks != null && videoTracks.length > 0) {
    video_switch = !video_switch;

    videoTracks[0].enabled = video_switch;
  }

  // tracks.forEach((track) => {
  //   track.stop();
  // });

  // videoElem.srcObject = null;
}
function toggleMic(videoElem) {
  const stream = videoElem.srcObject;
  const audioTracks = stream.getAudioTracks();

  if (audioTracks != null && audioTracks.length > 0) {
    mic_switch = !mic_switch;

    audioTracks[0].enabled = mic_switch;
  }

  // tracks.forEach((track) => {
  //   track.stop();
  // });

  // videoElem.srcObject = null;
}

// create a button to toggle video
var button = document.createElement("button");
button.appendChild(document.createTextNode("Toggle Hold"));

$("#stopCameraLocal").click(function () {
  const video = document.getElementById("localStream");
  stopStreamedVideo(video);
  $("#localStream").addClass("stop");
});
$("#stopAudioLocal").click(function () {
  const video = document.getElementById("localStream");
  toggleMic(video);
  // $("#localStream").addClass("stop");
});
