import {WebXRButton} from '/assets/js/util/webxr-button.js';
import {Scene} from '/assets/js/render/scenes/scene.js';
import {Renderer, createWebGLContext} from '/assets/js/render/core/renderer.js';
import {InlineViewerHelper} from '/assets/js/util/inline-viewer-helper.js';
//VR player options
import {ButtonNode} from '/assets/js/render/nodes/button.js';
import {UrlTexture} from '/assets/js/render/core/texture.js';
import {mat4} from '/assets/js/render/math/gl-matrix.js';

export class WebXR {
  constructor(options) {
    // Application options and defaults
    if (!options) { options = {}; }

    this.options = {
      inline: 'inline' in options ? options.inline : true,
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || 'local',
      defaultInputHandling: 'defaultInputHandling' in options ? options.defaultInputHandling : true
    };

    this.account = options.account;
    this.gl = null;
    this.renderer = null;
    this.scene = new Scene();
    this.mobile_vr = true;
    this.session = null;
    this.XRFrame = options.XRFrame || null;
    this.pointer = options.pointer || null;

    //player options
    // player controls
    this.BUTTON_PER_ROW = 4;
    this.BUTTON_ROW_ARC = Math.PI * 0.3;
    this.BUTTON_ROW_HEIGHT = 0.32;
    this.BUTTON_GRID_HEIGHT = 0.5;
    this.BUTTON_GRID_DISTANCE = 2.0;
    this.controls = [];
    this.rotation = 0;
    this.options_visibility = true;

    this.xrButton = new WebXRButton({
      onRequestSession: () => { return this.onRequestSession(); },
      onEndSession: (session) => { this.onEndSession(session); }
    });

    this.immersiveRefSpace = null;
    this.inlineViewerHelper = null;

    this.frameCallback = (time, frame) => {
      let session = frame.session;
      let refSpace = this.getSessionReferenceSpace(session);
      session.requestAnimationFrame(this.frameCallback);
      this.scene.startFrame();
      this.onXRFrame(time, frame, refSpace)
      this.scene.endFrame();
    };
  }

  getSessionReferenceSpace(session) {
    return session.isImmersive ? this.immersiveRefSpace : this.inlineViewerHelper.referenceSpace;
  }

  run() {
    this.onInitXR();
  }

  onInitXR() {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        this.xrButton.enabled = supported;
      });

      // Request an inline session if needed.
      if (this.options.inline) {
        navigator.xr.requestSession('inline').then((session) => {
          this.onSessionStarted(session);
        });
      }
    }
  }

  onCreateGL() {
    return createWebGLContext({
      xrCompatible: true
    });
  }

  onInitRenderer() {
    
    if (this.gl)
      return;

    this.gl = this.onCreateGL();

    if(this.gl) {
      let canvas = this.gl.canvas;
      canvas.setAttribute("id", "main_canvas");
      if (canvas instanceof HTMLCanvasElement) {
        document.body.append(this.gl.canvas);
        function onResize() {
          canvas.width = canvas.clientWidth * window.devicePixelRatio;
          canvas.height = canvas.clientHeight * window.devicePixelRatio;
        }
        window.addEventListener('resize', onResize);
        onResize();
      }

      this.renderer = new Renderer(this.gl);
      this.scene.setRenderer(this.renderer);
    }
  }

  onRequestSession() {
    // Called when the VR button gets clicked. Requests an immersive session.
    return navigator.xr.requestSession(this.options.immersiveMode, {
        requiredFeatures: [this.options.referenceSpace]
    }).then((session) => {
      this.xrButton.setSession(session);
      session.isImmersive = true;
      this.onSessionStarted(session);
    });
  }

  onEndSession(session) {
    session.end();
  }

  onSessionStarted(session) {
    session.addEventListener('end', (event) => {
      this.onSessionEnded(event.session);
    });

    if(this.account && window.location.pathname === "/Tour") {session.addEventListener('select', this.pointer)};

    // enable for button responses
    session.addEventListener('select', (event) => {
      let refSpace = this.getSessionReferenceSpace(event.frame.session);
      this.scene.handleSelect(event.inputSource, event.frame, refSpace);
    });

    this.onInitRenderer();

    this.scene.inputRenderer.useProfileControllerMeshes(session);

    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, this.gl)
    });

    this.onRequestReferenceSpace(session).then((refSpace) => {
      if (session.isImmersive) {
        this.immersiveRefSpace = refSpace;
      } else {
        this.inlineViewerHelper = new InlineViewerHelper(this.gl.canvas, refSpace);
        if (this.options.referenceSpace == 'local-floor' ||
            this.options.referenceSpace == 'bounded-floor') {
          this.inlineViewerHelper.setHeight(1.6);
        }
      }

      session.requestAnimationFrame(this.frameCallback);
    });
  }

  onRequestReferenceSpace(session) {
    if (this.options.referenceSpace && session.isImmersive) {
      return session.requestReferenceSpace(this.options.referenceSpace);
    } else {
      return session.requestReferenceSpace('viewer');
    }
  }

  onSessionEnded(session) {
    this.mobile_vr = false;
    if (session == this.xrButton.session) {
      this.xrButton.setSession(null);
    }
  }

  // Override to customize frame handling
  onXRFrame(time, frame, refSpace) {
    let pose = frame.getViewerPose(refSpace);
    if (this.options.defaultInputHandling) {
      this.scene.updateInputSources(frame, refSpace);
    }

    //updating the matrix for player controls
    for(let control of this.controls) {
      let node = control.node;
      let rotation = parseFloat($("#lookYaw").text());
      // using coordinates of a point on a cirle always maintain 2.0 spacing between
      // player buttons and user
      control.position = [
        -this.BUTTON_GRID_DISTANCE*Math.sin(rotation), 
        0, 
        -this.BUTTON_GRID_DISTANCE*Math.cos(rotation)];

      mat4.identity(node.matrix);
      mat4.translate(node.matrix, node.matrix, [0, node.yOffset, 0]); // set height before adjusting
      mat4.rotateY(node.matrix, node.matrix, node.yAngle); // set individual angles before moving
      mat4.translate(node.matrix, node.matrix, control.position);
      mat4.rotateY(node.matrix, node.matrix, rotation);
    }
    
    this.scene.drawXRFrame(frame, pose);
  }

  addPermissionButton(iconUrl, callback, yAngle, yOffset) {
    let button = new ButtonNode(new UrlTexture(iconUrl), () => {
      callback(
        () => { button.iconTexture = checkTexture; }, // Success callback
        () => { button.iconTexture = xTexture; }, // Failure callback
      )
    });
    mat4.identity(button.matrix);
    mat4.translate(button.matrix, button.matrix, [0, yOffset, 0]); // x, y, z
    mat4.rotateY(button.matrix, button.matrix, yAngle);
    mat4.translate(button.matrix, button.matrix, [0, 0, -this.BUTTON_GRID_DISTANCE]);
    button.name = "button";
    button.yOffset = yOffset;
    button.yAngle = yAngle;
    let control = {
      name: "button",
      type: "button",
      node: button,
    }
    this.controls.push(control); //use later to move the controls as user changes Yaw
    this.scene.addNode(button);
  }
  
  // Builds a cylindrical grid of buttons
  addPermissionButtons(buttonList) {
    let count = buttonList.length;
    let rows = Math.ceil(count / this.BUTTON_PER_ROW);
    let firstRowOffset = (rows / 2) * this.BUTTON_ROW_HEIGHT;
    let anglePerButton = this.BUTTON_ROW_ARC / this.BUTTON_PER_ROW;
    let rowAngleOffset = (this.BUTTON_ROW_ARC * 0.5) - (anglePerButton * 0.5)
  
    for (let i = 0; i < count; ++i) {
      let button = buttonList[i];
      let yAngle = rowAngleOffset - ((i % this.BUTTON_PER_ROW) * anglePerButton);
      let row = Math.floor(i / this.BUTTON_PER_ROW);
      let yOffset = this.BUTTON_GRID_HEIGHT + (firstRowOffset - (row * this.BUTTON_ROW_HEIGHT));
      this.addPermissionButton(button.icon, button.callback, yAngle, yOffset);
    }
  }

  // toggle fullscreen mode
  toggleFullScreen() {
    let vr_button = $('#VRButton');
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
      vr_button.toggle();
      if (document.documentElement.requestFullScreen) {  
        document.documentElement.requestFullScreen();  
      } else if (document.documentElement.mozRequestFullScreen) {  
        document.documentElement.mozRequestFullScreen();  
      } else if (document.documentElement.webkitRequestFullScreen) {  
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
      }  
    } else {  
      vr_button.toggle();
      if (document.cancelFullScreen) {  
        document.cancelFullScreen();  
      } else if (document.mozCancelFullScreen) {  
        document.mozCancelFullScreen();  
      } else if (document.webkitCancelFullScreen) {  
        document.webkitCancelFullScreen();  
      }  
    }  
  }

  // add the fullscreen icon onto the screen
  createIcon(path, id) {
    let img = document.createElement("IMG");
    img.src = "/assets/media/buttons/" + path; //fullscreen.png
    img.setAttribute("id", id); //fullscreen_toggle
    return img;
  }

  // hiding the player buttons
  toggleOptions() {
    this.controls.forEach(control => {
      this.options_visibility ? this.scene.removeNode(control.node) : this.scene.addNode(control.node);
    });
    this.options_visibility = !this.options_visibility;
  }
}