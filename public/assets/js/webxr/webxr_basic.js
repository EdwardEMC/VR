import {WebXR} from '/assets/js/webxr/webxr.js';
import {QueryArgs} from '/assets/js/util/query-args.js';
import {VideoSkybox} from '/assets/js/render/nodes/video-skybox.js';

// If requested, use the polyfill to provide support for mobile devices
// and devices which only support WebVR.
import WebXRPolyfill from '/assets/js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
if (QueryArgs.getBool('usePolyfill', true)) {
  let polyfill = new WebXRPolyfill();
}

// home scene video node set up
const video = document.getElementById("video_stream");
//const video = document.createElement('video');
//video.setAttribute("id", "video_360_stream");
// video.setAttribute("class", "hide");
// video.style.display = "none";
// video.autoplay = true;
// video.loop = true;
// video.muted = true;
video.src = "assets/media/video/sample.mp4";

// WebXR setup
let app = new WebXR({referenceSpace: 'local-floor'});

// Fullscreen icon
let imgFull = app.createIcon("fullscreen-button.png", "fullscreen_toggle");
imgFull.onclick = function() { app.toggleFullScreen() };

// Options icon
let imgOptions = app.createIcon("options-button.png", "options_toggle");
imgOptions.onclick = function() { app.toggleOptions() };

// Load local video file
//app.localFileVideoPlayer(video);

document.getElementById("input").addEventListener('change', e => {
  openFile(e);
});

let openFile = function(e) {
  var input = e.target.files;
  let file = input[0];

  var reader = new FileReader();
  reader.onload = (function(f) {
  return function(e) {
      console.log(this.result);
      var dataURL = reader.result;
      video.src = dataURL;
  };
  })(file);
  reader.readAsDataURL(file);
};

// Page setup
let videoSkybox = new VideoSkybox({video: video});
document.body.append(video, imgFull, imgOptions);
document.getElementById('vr_button').appendChild(app.xrButton.domElement);
app.addPermissionButtons([
  {
    icon: '/assets/media/buttons/play-button.png',
    callback: (success, fail) => {
      video.play();
    }
  },
  {
    icon: '/assets/media/buttons/pause-button.png',
    callback: (success, fail) => {
      video.pause();
    }
  },
  {
    icon: '/assets/media/buttons/mic-button.png',
    callback: (success, fail) => {
      video.muted ? video.muted = false : video.muted = true;
    }
  },
  {
    icon: '/assets/media/buttons/restart-button.png',
    callback: (success, fail) => {
      video.currentTime = 0;
    }
  }
]);

app.scene.addNode(videoSkybox); //add home scene here

// Start the XR application.
app.run();