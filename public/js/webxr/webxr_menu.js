import {WebXR} from '/assets/js/webxr/webxr.js';
import {UrlTexture} from '/assets/js/render/core/texture.js';
import {ButtonNode} from '/assets/js/render/nodes/button.js';
import {mat4} from '/assets/js/render/math/gl-matrix.js';
import {QueryArgs} from '/assets/js/util/query-args.js';
import {VideoSkybox} from '/assets/js/render/nodes/video-skybox.js';

// If requested, use the polyfill to provide support for mobile devices
// and devices which only support WebVR.
import WebXRPolyfill from '/assets/js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
if (QueryArgs.getBool('usePolyfill', true)) {
  let polyfill = new WebXRPolyfill();
}

// determine which account is loading
const teacher = document.getElementById("socket_trigger");
// home scene video node set up
const video = document.createElement('video');
video.setAttribute("id", "video_360_stream");
video.setAttribute("class", "hide");
video.autoplay = true;
video.loop = true;
video.src = "assets/media/videos/home.mp4";

const BUTTON_PER_ROW = 4;
const BUTTON_ROW_ARC = Math.PI * 0.4;
const BUTTON_ROW_HEIGHT = 0.32;
const BUTTON_GRID_HEIGHT = 1.5;
const BUTTON_GRID_DISTANCE = 1.0;

// WebXR setup
let app = new WebXR({referenceSpace: 'local-floor'});
let videoSkybox = new VideoSkybox({video: video});
//document.getElementById('VRButton').appendChild(app.xrButton.domElement);
document.body.append(video);

app.scene.addNode(videoSkybox); //add home scene here

let checkTexture = new UrlTexture('/assets/media/buttons/check-button.png');
let xTexture = new UrlTexture('/assets/media/buttons/x-button.png');
function addPermissionButton(iconUrl, callback, yAngle, yOffset) {
  let button = new ButtonNode(new UrlTexture(iconUrl), () => {
    callback(
      () => { button.iconTexture = checkTexture; }, // Success callback
      () => { button.iconTexture = xTexture; } // Failure callback
    )
  });
  mat4.identity(button.matrix);
  mat4.translate(button.matrix, button.matrix, [0, yOffset, 0]);
  mat4.rotateY(button.matrix, button.matrix, yAngle);
  mat4.translate(button.matrix, button.matrix, [0, 0, -BUTTON_GRID_DISTANCE]);
  app.scene.addNode(button);
}

// Builds a cylindrical grid of buttons
function addPermissionButtons(buttonList) {
  let count = buttonList.length;
  let rows = Math.ceil(count / BUTTON_PER_ROW);
  let firstRowOffset = (rows / 2) * BUTTON_ROW_HEIGHT;
  let anglePerButton = BUTTON_ROW_ARC / BUTTON_PER_ROW;
  let rowAngleOffset = (BUTTON_ROW_ARC * 0.5) - (anglePerButton * 0.5)

  for (let i = 0; i < count; ++i) {
    let button = buttonList[i];
    let yAngle = rowAngleOffset - ((i % BUTTON_PER_ROW) * anglePerButton);
    let row = Math.floor(i / BUTTON_PER_ROW);
    let yOffset = BUTTON_GRID_HEIGHT + (firstRowOffset - (row * BUTTON_ROW_HEIGHT));
    addPermissionButton(button.icon, button.callback, yAngle, yOffset);
  }
}

if(teacher) {
  addPermissionButtons([
    {
      icon: '/assets/media/buttons/play-button.png',
      callback: (success, fail) => {
        $("#teacher_home_modal").toggle("hide");
      }
    },
    {
      icon: '/assets/media/buttons/upload-button.png',
      callback: (success, fail) => {
        $("#teacher_tour_modal").toggle("hide");
      }
    },
    {
      icon: '/assets/media/buttons/settings-button.png',
      callback: (success, fail) => {
        $("#teacher_manage_modal").toggle("hide");
      }
    },
    {
      icon: '/assets/media/buttons/mic-button.png',
      callback: (success, fail) => {
        video.muted ? video.muted = false : video.muted = true;
      }
    }
    // {
    //   icon: '/assets/media/buttons/usb-button.png',
    //   callback: (success, fail) => {
    //     navigator.usb.requestDevice({filters: [{}]})
    //     .then(success, fail);
    //   }
    // },
    // {
    //   icon: '/assets/media/buttons/camera-button.png',
    //   callback: (success, fail) => {
    //     navigator.getUserMedia({ video: true }, success, fail);
    //   }
    // },
    // {
    //   icon: '/assets/media/buttons/mic-button.png',
    //   callback: (success, fail) => {
    //     navigator.getUserMedia({ audio: true }, success, fail);
    //   }
    // },
    // {
    //   icon: '/assets/media/buttons/location-button.png',
    //   callback: (success, fail) => {
    //     navigator.geolocation.getCurrentPosition(success, fail);
    //   }
    // },
    // {
    //   icon: '/assets/media/buttons/bluetooth-button.png',
    //   callback: (success, fail) => {
    //     navigator.bluetooth.requestDevice({
    //       // filters: [...] <- Prefer filters to save energy & show relevant devices.
    //       // acceptAllDevices here ensures dialog can populate, we don't care with what.
    //       acceptAllDevices:true
    //     })
    //     .then(device => device.gatt.connect())
    //     .then(success, fail);
    //   }
    // },
  ]);
}

// Start the XR application.
app.run();