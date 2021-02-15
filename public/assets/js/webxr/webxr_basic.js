import {WebXR} from '/assets/js/webxr/webxr.js';
import {QueryArgs} from '/assets/js/util/query-args.js';
import {VideoSkybox} from '/assets/js/render/nodes/video-skybox.js';

// If requested, use the polyfill to provide support for mobile devices
// and devices which only support WebVR.
import WebXRPolyfill from '/assets/js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
if (QueryArgs.getBool('usePolyfill', true)) {
  let polyfill = new WebXRPolyfill();
}

// WebXR setup
let app = new WebXR({referenceSpace: 'local-floor'});

// home scene video node set up
const video = document.createElement('video');
video.setAttribute("id", "video_360_stream");
video.setAttribute("class", "hide");
video.style.display = "none";
video.autoplay = true;
video.loop = true;
video.src = "assets/media/video/sample.mp4";

// Fullscreen icon
let imgFull = app.createIcon("fullscreen.png", "fullscreen_toggle");
imgFull.onclick = function() { app.toggleFullScreen() };

// Options icon
let imgOptions = app.createIcon("options-button.png", "options_toggle");
imgOptions.onclick = function() { app.toggleOptions() };

// Load local video file
app.localFileVideoPlayer(video);

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