import {Material} from '../core/material.js';
import {Node} from '../core/node.js';
import {Primitive, PrimitiveAttribute} from '../core/primitive.js';
import {CharacterMatrixText} from './character-matrix-text.js';

class TextMaterial extends Material {
  get materialName() {
    return 'STATS_VIEWER';
  }

  get vertexSource() {
    return `
    attribute vec3 POSITION;
    attribute vec3 COLOR_0;
    varying vec4 vColor;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vColor = vec4(COLOR_0, 1.0);
      return proj * view * model * vec4(POSITION, 1.0);
    }`;
  }

  get fragmentSource() {
    return `
    precision mediump float;
    varying vec4 vColor;

    vec4 fragment_main() {
      return vColor;
    }`;
  }
}

// using the stat viewer basics to construct a background node for text to be placed on
export class TextDisplay extends Node {
  constructor(options) {
    super();

    this._text = options.text;
    this._textColor = options.color || null;
    this._backgoundNode = null;

    this._characterSegmentNode = new CharacterMatrixText({color: this._textColor});
    // Hard coded because it doesn't change:
    // Scale by 0.075 in X and Y
    // Translate into upper left corner w/ z = 0.02
    this._characterSegmentNode.matrix = new Float32Array([
      0.075, 0, 0, 0,
      0, 0.075, 0, 0,
      0, 0, 1, 0,
      -0.3625, 0.3625, 0.02, 1,
    ]);
  }

  onRendererChanged(renderer) {
    this.clearNodes();

    let gl = renderer.gl;

    let fpsVerts = [];
    let fpsIndices = [];

    function addBGSquare(left, bottom, right, top, z, r, g, b) {
      let idx = fpsVerts.length / 6;

      fpsVerts.push(left, bottom, z, r, g, b);
      fpsVerts.push(right, top, z, r, g, b);
      fpsVerts.push(left, top, z, r, g, b);
      fpsVerts.push(right, bottom, z, r, g, b);

      fpsIndices.push(idx, idx+1, idx+2,
                      idx, idx+3, idx+1);
    }

    // Panel Background
    // can change size and color of background here
    addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 255.0, 255.0, 255.0);

    // FPS Background
    //addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);

    // 30 FPS line
    //addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);

    // 60 FPS line
    //addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);

    this._fpsVertexBuffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.DYNAMIC_DRAW);
    let fpsIndexBuffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices));

    let fpsAttribs = [
      new PrimitiveAttribute('POSITION', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 0),
      new PrimitiveAttribute('COLOR_0', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 12),
    ];

    let fpsPrimitive = new Primitive(fpsAttribs, fpsIndices.length);
    fpsPrimitive.setIndexBuffer(fpsIndexBuffer);
    fpsPrimitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);

    this._fpsRenderPrimitive = renderer.createRenderPrimitive(fpsPrimitive, new TextMaterial());
    this._backgoundNode = new Node();
    this._backgoundNode.addRenderPrimitive(this._fpsRenderPrimitive);

    this.addNode(this._backgoundNode);
    this.addNode(this._characterSegmentNode);

    // Add text here through dynamic loading
    this._characterSegmentNode.text = `${this._text}`;
  }
}
