import {WebXRButton} from '/assets/js/util/webxr-button.js';
import {Scene} from '/assets/js/render/scenes/scene.js';
import {Renderer, createWebGLContext} from '/assets/js/render/core/renderer.js';
import {InlineViewerHelper} from '/assets/js/util/inline-viewer-helper.js';

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

      // determine if running the menu scene or the tour scene
      window.location.pathname === "/Tour" ? this.XRFrame(time, frame, refSpace) : this.onXRFrame(time, frame, refSpace)

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

    // enable selecton of icons for home page
    //if(this.options.defaultInputHandling) {
      session.addEventListener('select', (event) => {
        let refSpace = this.getSessionReferenceSpace(event.frame.session);
        this.scene.handleSelect(event.inputSource, event.frame, refSpace);
      });
    //}

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
    this.scene.drawXRFrame(frame, pose);
  }
}