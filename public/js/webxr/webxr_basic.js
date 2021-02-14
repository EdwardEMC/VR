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
const video = document.createElement('video');
video.setAttribute("id", "video_360_stream");
video.setAttribute("class", "hide");
video.autoplay = true;
video.loop = true;
video.src = "assets/media/videos/sample.mp4";

// WebXR setup
let app = new WebXR({referenceSpace: 'local-floor'});
let videoSkybox = new VideoSkybox({video: video});
document.body.append(video);

app.scene.addNode(videoSkybox); //add home scene here

// Start the XR application.
app.run();