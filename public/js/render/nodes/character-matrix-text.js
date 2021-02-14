// Copyright 2018 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import {Material} from '../core/material.js';
import {Node} from '../core/node.js';
import {Primitive, PrimitiveAttribute} from '../core/primitive.js';

// spacing between the letters
const TEXT_KERNING = 2;

class CharacterSegmentMaterial extends Material {
  constructor(options) {
    super();
    
    this._materialColour = options.color || `0.0, 0.0, 0.0`;
  }

  get materialName() {
    return 'CHARACTER_SEGMENT_TEXT';
  }

  get vertexSource() {
    return `
    attribute vec2 POSITION;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      return proj * view * model * vec4(POSITION, 0.0, 1.0);
    }`;
  }

  // color for the text rgba style input - use a string literal
  get fragmentSource() {
    return `
    precision mediump float;
    const vec4 color = vec4(${this._materialColour}, 1.0);

    vec4 fragment_main() {
      return color;
    }`;
  }
}

export class CharacterMatrixText extends Node {
  constructor(options) {
    super();

    this._textColor = options.color;
    this._text = '';
    this._charNodes = [];
  }

  onRendererChanged(renderer) {
    this.clearNodes();
    this._charNodes = [];

    let vertices = [];
    let segmentIndices = {};
    let indices = [];

    const width = 0.5;
    const thickness = 0.25;

    function defineSegment(id, left, top, right, bottom) {
      let idx = vertices.length / 2;
      vertices.push(
          left, top,
          right, top,
          right, bottom,
          left, bottom);

      segmentIndices[id] = [
        idx, idx+2, idx+1,
        idx, idx+3, idx+2,
      ];
    }

    let characters = {};
    function defineCharacter(c, segments) {
      let character = {
        character: c,
        offset: indices.length * 2,
        count: 0,
      };

      for (let i = 0; i < segments.length; ++i) {
        let idx = segments[i];
        let segment = segmentIndices[idx];
        character.count += segment.length;
        indices.push(...segment);
      }

      characters[c] = character;
    }

    /* Segment layout is as follows: 10 x width; 15 x height - 15 as to incorporate tails for (g, y, j, q, p);
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .
    . . . . . . . . . .

    0   1   2   3   4   5   6   7   8   9
    10  11  12  13  14  15  16  17  18  19
    20  21  22  23  24  25  26  27  28  29
    30  31  32  33  34  35  36  37  38  39
    40  41  42  43  44  45  46  47  48  49
    50  51  52  53  54  55  56  57  58  59
    60  61  62  63  64  65  66  67  68  69
    70  71  72  73  74  75  76  77  78  79
    80  81  82  83  84  85  86  87  88  89
    90  91  92  93  94  95  96  97  98  99
    100 101 102 103 104 105 106 107 108 109
    110 111 112 113 114 115 116 117 118 119
    120 121 122 123 124 125 126 127 128 129
    130 131 132 133 134 135 136 137 138 139
    140 141 142 143 144 145 146 147 148 149

    */
    //defineSegment(id, left, top, right, bottom)
    //row one
    defineSegment(0, -1, 1, -0.8, 0.8)
    defineSegment(1, -0.8, 1, -0.6, 0.8)
    defineSegment(2, -0.6, 1, -0.4, 0.8)
    defineSegment(3, -0.4, 1, -0.2, 0.8)
    defineSegment(4, -0.2, 1, -0, 0.8)
    defineSegment(5, -0, 1, 0.2, 0.8)
    defineSegment(6, 0.2, 1, 0.4, 0.8)
    defineSegment(7, 0.4, 1, 0.6, 0.8)
    defineSegment(8, 0.6, 1, 0.8, 0.8)
    defineSegment(9, 0.8, 1, 1, 0.8)
    //row two
    defineSegment(10, -1, 0.8, -0.8, 0.6)
    defineSegment(11, -0.8, 0.8, -0.6, 0.6)
    defineSegment(12, -0.6, 0.8, -0.4, 0.6)
    defineSegment(13, -0.4, 0.8, -0.2, 0.6)
    defineSegment(14, -0.2, 0.8, -0, 0.6)
    defineSegment(15, -0, 0.8, 0.2, 0.6)
    defineSegment(16, 0.2, 0.8, 0.4, 0.6)
    defineSegment(17, 0.4, 0.8, 0.6, 0.6)
    defineSegment(18, 0.6, 0.8, 0.8, 0.6)
    defineSegment(19, 0.8, 0.8, 1, 0.6)
    //row three
    defineSegment(20, -1, 0.6, -0.8, 0.4)
    defineSegment(21, -0.8, 0.6, -0.6, 0.4)
    defineSegment(22, -0.6, 0.6, -0.4, 0.4)
    defineSegment(23, -0.4, 0.6, -0.2, 0.4)
    defineSegment(24, -0.2, 0.6, -0, 0.4)
    defineSegment(25, -0, 0.6, 0.2, 0.4)
    defineSegment(26, 0.2, 0.6, 0.4, 0.4)
    defineSegment(27, 0.4, 0.6, 0.6, 0.4)
    defineSegment(28, 0.6, 0.6, 0.8, 0.4)
    defineSegment(29, 0.8, 0.6, 1, 0.4)
    //row four
    defineSegment(30, -1, 0.4, -0.8, 0.2)
    defineSegment(31, -0.8, 0.4, -0.6, 0.2)
    defineSegment(32, -0.6, 0.4, -0.4, 0.2)
    defineSegment(33, -0.4, 0.4, -0.2, 0.2)
    defineSegment(34, -0.2, 0.4, -0, 0.2)
    defineSegment(35, -0, 0.4, 0.2, 0.2)
    defineSegment(36, 0.2, 0.4, 0.4, 0.2)
    defineSegment(37, 0.4, 0.4, 0.6, 0.2)
    defineSegment(38, 0.6, 0.4, 0.8, 0.2)
    defineSegment(39, 0.8, 0.4, 1, 0.2)
    //row five
    defineSegment(40, -1, 0.2, -0.8, 0)
    defineSegment(41, -0.8, 0.2, -0.6, 0)
    defineSegment(42, -0.6, 0.2, -0.4, 0)
    defineSegment(43, -0.4, 0.2, -0.2, 0)
    defineSegment(44, -0.2, 0.2, -0, 0)
    defineSegment(45, -0, 0.2, 0.2, 0)
    defineSegment(46, 0.2, 0.2, 0.4, 0)
    defineSegment(47, 0.4, 0.2, 0.6, 0)
    defineSegment(48, 0.6, 0.2, 0.8, 0)
    defineSegment(49, 0.8, 0.2, 1, 0)
    //row six
    defineSegment(50, -1, 0, -0.8, -0.2)
    defineSegment(51, -0.8, 0, -0.6, -0.2)
    defineSegment(52, -0.6, 0, -0.4, -0.2)
    defineSegment(53, -0.4, 0, -0.2, -0.2)
    defineSegment(54, -0.2, 0, -0, -0.2)
    defineSegment(55, -0, 0, 0.2, -0.2)
    defineSegment(56, 0.2, 0, 0.4, -0.2)
    defineSegment(57, 0.4, 0, 0.6, -0.2)
    defineSegment(58, 0.6, 0, 0.8, -0.2)
    defineSegment(59, 0.8, 0, 1, -0.2)
    //row seven
    defineSegment(60, -1, -0.2, -0.8, -0.4)
    defineSegment(61, -0.8, -0.2, -0.6, -0.4)
    defineSegment(62, -0.6, -0.2, -0.4, -0.4)
    defineSegment(63, -0.4, -0.2, -0.2, -0.4)
    defineSegment(64, -0.2, -0.2, -0, -0.4)
    defineSegment(65, -0, -0.2, 0.2, -0.4)
    defineSegment(66, 0.2, -0.2, 0.4, -0.4)
    defineSegment(67, 0.4, -0.2, 0.6, -0.4)
    defineSegment(68, 0.6, -0.2, 0.8, -0.4)
    defineSegment(69, 0.8, -0.2, 1, -0.4)
    //row eight
    defineSegment(70, -1, -0.4, -0.8, -0.6)
    defineSegment(71, -0.8, -0.4, -0.6, -0.6)
    defineSegment(72, -0.6, -0.4, -0.4, -0.6)
    defineSegment(73, -0.4, -0.4, -0.2, -0.6)
    defineSegment(74, -0.2, -0.4, -0, -0.6)
    defineSegment(75, -0, -0.4, 0.2, -0.6)
    defineSegment(76, 0.2, -0.4, 0.4, -0.6)
    defineSegment(77, 0.4, -0.4, 0.6, -0.6)
    defineSegment(78, 0.6, -0.4, 0.8, -0.6)
    defineSegment(79, 0.8, -0.4, 1, -0.6)
    //row nine
    defineSegment(80, -1, -0.6, -0.8, -0.8)
    defineSegment(81, -0.8, -0.6, -0.6, -0.8)
    defineSegment(82, -0.6, -0.6, -0.4, -0.8)
    defineSegment(83, -0.4, -0.6, -0.2, -0.8)
    defineSegment(84, -0.2, -0.6, -0, -0.8)
    defineSegment(85, -0, -0.6, 0.2, -0.8)
    defineSegment(86, 0.2, -0.6, 0.4, -0.8)
    defineSegment(87, 0.4, -0.6, 0.6, -0.8)
    defineSegment(88, 0.6, -0.6, 0.8, -0.8)
    defineSegment(89, 0.8, -0.6, 1, -0.8)
    //row ten
    defineSegment(90, -1, -0.8, -0.8, -1)
    defineSegment(91, -0.8, -0.8, -0.6, -1)
    defineSegment(92, -0.6, -0.8, -0.4, -1)
    defineSegment(93, -0.4, -0.8, -0.2, -1)
    defineSegment(94, -0.2, -0.8, -0, -1)
    defineSegment(95, -0, -0.8, 0.2, -1)
    defineSegment(96, 0.2, -0.8, 0.4, -1)
    defineSegment(97, 0.4, -0.8, 0.6, -1)
    defineSegment(98, 0.6, -0.8, 0.8, -1)
    defineSegment(99, 0.8, -0.8, 1, -1)
    //row eleven
    defineSegment(100, -1, -1, -0.8, -1.2)
    defineSegment(101, -0.8, -1, -0.6, -1.2)
    defineSegment(102, -0.6, -1, -0.4, -1.2)
    defineSegment(103, -0.4, -1, -0.2, -1.2)
    defineSegment(104, -0.2, -1, -0, -1.2)
    defineSegment(105, -0, -1, 0.2, -1.2)
    defineSegment(106, 0.2, -1, 0.4, -1.2)
    defineSegment(107, 0.4, -1, 0.6, -1.2)
    defineSegment(108, 0.6, -1, 0.8, -1.2)
    defineSegment(109, 0.8, -1, 1, -1.2)
    //row twelve
    defineSegment(110, -1, -1.2, -0.8, -1.4)
    defineSegment(111, -0.8, -1.2, -0.6, -1.4)
    defineSegment(112, -0.6, -1.2, -0.4, -1.4)
    defineSegment(113, -0.4, -1.2, -0.2, -1.4)
    defineSegment(114, -0.2, -1.2, -0, -1.4)
    defineSegment(115, -0, -1.2, 0.2, -1.4)
    defineSegment(116, 0.2, -1.2, 0.4, -1.4)
    defineSegment(117, 0.4, -1.2, 0.6, -1.4)
    defineSegment(118, 0.6, -1.2, 0.8, -1.4)
    defineSegment(119, 0.8, -1.2, 1, -1.4)
    //row thirteen
    defineSegment(120, -1, -1.4, -0.8, -1.6)
    defineSegment(121, -0.8, -1.4, -0.6, -1.6)
    defineSegment(122, -0.6, -1.4, -0.4, -1.6)
    defineSegment(123, -0.4, -1.4, -0.2, -1.6)
    defineSegment(124, -0.2, -1.4, -0, -1.6)
    defineSegment(125, -0, -1.4, 0.2, -1.6)
    defineSegment(126, 0.2, -1.4, 0.4, -1.6)
    defineSegment(127, 0.4, -1.4, 0.6, -1.6)
    defineSegment(128, 0.6, -1.4, 0.8, -1.6)
    defineSegment(129, 0.8, -1.4, 1, -1.6)
    //row fourteen
    defineSegment(130, -1, -1.6, -0.8, -1.8)
    defineSegment(131, -0.8, -1.6, -0.6, -1.8)
    defineSegment(132, -0.6, -1.6, -0.4, -1.8)
    defineSegment(133, -0.4, -1.6, -0.2, -1.8)
    defineSegment(134, -0.2, -1.6, -0, -1.8)
    defineSegment(135, -0, -1.6, 0.2, -1.8)
    defineSegment(136, 0.2, -1.6, 0.4, -1.8)
    defineSegment(137, 0.4, -1.6, 0.6, -1.8)
    defineSegment(138, 0.6, -1.6, 0.8, -1.8)
    defineSegment(139, 0.8, -1.6, 1, -1.8)
    //row fifteen
    defineSegment(140, -1, -1.8, -0.8, -2)
    defineSegment(141, -0.8, -1.8, -0.6, -2)
    defineSegment(142, -0.6, -1.8, -0.4, -2)
    defineSegment(143, -0.4, -1.8, -0.2, -2)
    defineSegment(144, -0.2, -1.8, -0, -2)
    defineSegment(145, -0, -1.8, 0.2, -2)
    defineSegment(146, 0.2, -1.8, 0.4, -2)
    defineSegment(147, 0.4, -1.8, 0.6, -2)
    defineSegment(148, 0.6, -1.8, 0.8, -2)
    defineSegment(149, 0.8, -1.8, 1, -2)

    // defining numbers 0 - 9
    defineCharacter('0', [
        2, 3, 4, 5, 6, 7,
      11,                18,
      21,                28,
      31,                38,
      41,                48,
      51,                58,
      61,                68,
      71,                78,
      81,                88,
        92,93,94,95,96,97
    ]);

    defineCharacter('1', [
              4,
              14,
              24,
              34,
              44,
              54,
              64,
              74,
              84,
              94
    ]);

    defineCharacter('2', [
         2, 3, 4, 5, 6, 7,
      11,                  18,
                           28,
                        37,
                     46,
                  55,
               64,
            73,
         82,
      91,92,93,94,95,96,97,98
    ]);

    defineCharacter('3', [
         2, 3, 4, 5, 6, 7,
      11,                  18,
                           28,
                           38,
                  45,46,47,
                  55,56,57,
                           68,
                           78,
      81,                  88,
         92,93,94,95,96,97
    ]);

    defineCharacter('4', [
         2,          6,
         12,         16,
         22,         26,
         32,         36,
      41,            46,
      51,52,53,54,55,56,57,58,
                     66,
                     76,
                     86,
                     96
    ]);

    defineCharacter('5', [
      1, 2, 3, 4, 5, 6, 7,
      11,                 
      21,
      31,
      41,42,43,44,45,46,
                        57,           
                          68,
                          78,
      81,               87,
         92,93,94,95,96 
    ]);

    defineCharacter('6', [
           3, 4, 5, 6, 7,
        12,                 
      21,
      31,
      41,42,43,44,45,46,
      51,               57,           
      61,                 68,
      71,                 78,
         82,            87,
            93,94,95,96       
    ]);

    defineCharacter('7', [
      1, 2, 3, 4, 5, 6, 7, 8,
                          18,
                        27,
                        37,
                     46,
                     56,
                  65,
                  75,
               84,
               94
    ]);

    defineCharacter('8', [
        2, 3, 4, 5, 6, 7,
      11,                18,
      21,                28,
      31,                38,
        42,43,44,45,46,47,
      51,                58,
      61,                68,
      71,                78,
      81,                88,
        92,93,94,95,96,97
    ]);

    defineCharacter('9', [
        2, 3, 4, 5, 6, 7,
      11,                18,
      21,                28,
      31,                38,
      41,                48,
        52,53,54,55,56,57,
                         68,
                         78,
                         88,
                         98      
    ]);

    // defining letters Aa-Zz
    defineCharacter('A', [
               4, 5,
           13,      16,
           23,      26,
        32,            37,
        42,            47,
        52,53,54,55,56,57,
      61,                 68,
      71,                 78,
      81,                 88,
      91,                 98,
    ]);

    defineCharacter('a', [
           43,44,45,46,   48,
        52,            57,58,
      61,                 68,
      71,                 78,
        82,            87,88,      
           93,94,95,96,   98  
    ]);

    defineCharacter('B', [
       1, 2, 3, 4, 5, 6,
      11,               17,
      21,                 28,
      31,               37,
      41,42,43,44,45,46,
      51,               57,
      61,                 68,
      71,                 78,
      81,               87,
      91,92,93,94,95,96,
    ]);

    defineCharacter('b', [
      1,
      11,
      21,
      31,
      41,42,43,44,45,46,
      51,               57,
      61,                 68,
      71,                 78,
      81,               87,
      91,92,93,94,95,96,
    ]);

    defineCharacter('C', [
        2, 3, 4, 5, 6, 7,
      11,                18,
      21,
      31,
      41,
      51,
      61,
      71,
      81,                88,
        92,93,94,95,96,97
    ]);

    defineCharacter('c', [
        42,43,44,45,46,
      51,              57,
      61,
      71,
      81,              87,
        92,93,94,95,96
    ]);

    defineCharacter('D', [
      1, 2, 3, 4, 5, 6,
      11,              17,
      21,                 28,
      31,                 38,
      41,                 48,
      51,                 58,
      61,                 68,
      71,                 78,
      81,              87,
      91,92,93,94,95,96
    ]);

    defineCharacter('d', [
                          8,
                          18,
                          28,
                          38,
           43,44,45,46,47,48,
        52,               58,
      61,                 68,
      71,                 78,
        82,               88,
           93,94,95,96,97,98      
    ]);

    defineCharacter('E', [
      1, 2, 3, 4, 5, 6, 7, 8,
      11,
      21,
      31,
      41,42,43,44,45,
      51,
      61,
      71,
      81,
      91,92,93,94,95,96,97,98
    ]);

    defineCharacter('e', [
         42,43,44,45,46,
      51,              57,
      61,62,63,64,65,66,
      71,
      81,             
        92,93,94,95,96,97      
    ]);

    defineCharacter('F', [
      1, 2, 3, 4, 5, 6, 7, 8,
      11,
      21,
      31,
      41,42,43,44,45,
      51,
      61,
      71,
      81,
      91
    ]);

    defineCharacter('f', [
              4,5,6,
            13,     17,
            23,
            33,
            43,
         52,53,54,55,
            63,
            73,
            83,
            93,
    ]);

    defineCharacter('G', [
           3, 4, 5, 6, 7,
        12,              18,
      21,
      31,
      41,
      51,       55,56,57,
      61,                68,
      71,                78,
        82,           87,
           93,94,95,96,
    ]);

    defineCharacter('g', [
        42,43,44,45,46,47,
      51,                 58,
      61,                 68,
      71,                 78,
      81,                 88,
        92,93,94,95,96,97,98,
                          108,
                          118,
                          128,
      131,                138,
      142,143,144,145,146,147
    ]);

    defineCharacter('H', [
      1,                   8,
      11,                  18,
      21,                  28,
      31,                  38,
      41,42,43,44,45,46,47,48,
      51,                  58,
      61,                  68,
      71,                  78,
      81,                  88,
      91,                  98
    ]);

    defineCharacter('h', [
      1,
      11,
      21,
      31,
      41,   43,44,45,
      51,52,         56,
      61,               67,
      71,               77,
      81,               87,
      91,               97
    ]);

    defineCharacter('I', [
      1, 2, 3, 4, 5, 6, 7,
               14,
               24,
               34,
               44,
               54,
               64,
               74,
               84,
      91,92,93,94,95,96,97
    ]);

    defineCharacter('i', [
               34,
               
               54,
               64,
               74,
               84,
               94,
    ]);

    defineCharacter('J', [
      1, 2, 3, 4, 5, 6, 7, 8,
                 15,
                 25,
                 35,
                 45,
                 55,
                 65,
                 75,
        81,      85,
          92,93,94,
    ]);

    defineCharacter('j', [
                 35,             
                 
                 55,
                 65,
                 75,
                 85,
                 95,
                 105,
                 115,
                 125,
      131,       135,
        142,143,144,      
    ]);

    defineCharacter('K', [
      1,              6,
      11,          15,
      21,       24,
      31,    33,
      41,  42,
      51,52,
      61,   63,
      71,      74,
      81,         85,
      91,            96,
    ]);

    defineCharacter('k', [
      1,             
      11,          15,
      21,       24,
      31,    33,
      41,  42,
      51,52,
      61,   63,
      71,      74,
      81,         85,
      91,            96,
    ]);

    defineCharacter('L', [
      1,
      11,
      21,
      31,
      41,
      51,
      61,
      71,
      81,
      91,92,93,94,95,96,97
    ]);

    defineCharacter('l', [
               4,
               14,
               24,
               34,
               44,
               54,
               64,
               74,
               84,
               94
    ]);

    defineCharacter('M', [
        2, 3,         7, 8,
      11,    14,   16,     19,
      21,       25,        29, 
      31,       35,        39,
      41,       45,        49,
      51,       55,        59,
      61,                  69,
      71,                  79,
      81,                  89,
      91,                  99
    ]);

    defineCharacter('m', [
        42, 43,      47, 48,
      51,    54,   56,     59,
      61,       65,        69, 
      71,       75,        79,
      81,       85,        89,
      91,       95,        99,
    ]);

    defineCharacter('N', [
       1, 2,               8,
      11,   13,           18,
      21,     23,         28, 
      31,       34,       38,
      41,       44,       48,
      51,         55,     58,
      61,         65,     68,
      71,           76,   78,
      81,           86,   88,
      91,              97,98
    ]);

    defineCharacter('n', [
      41,   43,44,45,
      51,52,        56,  
      61,             67,
      71,             77,
      81,             87,
      91,             97
    ]);

    defineCharacter('O', [
           3, 4, 5, 6,
        12,           17,
      21,               28,
      31,               38,
      41,               48,
      51,               58,
      61,               68,
      71,               78,
        82,           87,
          93,94,95,96,
    ]);

    defineCharacter('o', [
         43,44,45,
      52,         56,
    61,              67,
    71,              77,
      82,         86,     
         93,94,95,   
    ]);

    defineCharacter('P', [
      1, 2, 3, 4, 5, 6,
      11,              17,
      21,                 28,
      31,                 38,
      41,              47,
      51,52,53,54,55,56,
      61,
      71,
      81,
      91
    ]);

    defineCharacter('p', [
      41,42,43,44,45,46,
      51,              57,
      61,                 68,
      71,                 78,
      81,              87,
      91,92,93,94,95,96,
      101,
      111,
      121,
      131,
      141
    ]);

    defineCharacter('Q', [
         3, 4, 5, 6,
      12,           17,
    21,               28,
    31,               38,
    41,               48,
    51,               58,
    61,               68,
    71,          76,  78,
      82,           87,
        93,94,95,96,  98
    ]);

    defineCharacter('q', [
           43,44,45,46,47,48,
        52,               58,
      61,                 68,
      71,                 78,
        82,               88,
           93,94,95,96,97,98,
                          108,
                          118,
                          128,
                          138,
                          148
    ]);

    defineCharacter('R', [
      1, 2, 3, 4, 5, 6,
      11,              17,
      21,                 28,
      31,                 38,
      41,              47,
      51,52,53,54,55,56,
      61,            66,
      71,              77,
      81,                88,
      91,                98
    ]);

    defineCharacter('r', [
      41,   43,44,45,
      51,52,        56,  
      61,             
      71,             
      81,             
      91,             
    ]);

    defineCharacter('S', [
         3, 4, 5, 6,
      12,            17,
    21,                 28,
    31,
      42,43,44,45,46,
                     57,
                        68,
    71,                 78,
      82,            87,     
         93,94,95,96,  
    ]);

    defineCharacter('s', [
       42,43,44,45,
    51,           56,
      62,63,             
            74,75,
    81,           86,     
      92,93,94,95,  
    ]);

    defineCharacter('T', [
      1, 2, 3, 4, 5, 6, 7,
               14,
               24,
               34,
               44,
               54,
               64,
               74,
               84,
               94
    ]);

    defineCharacter('t', [
              4,
              14,
              24,
        32,33,34,35,36,
              44,
              54,
              64,
              74,
              84,
              94
    ]);

    defineCharacter('U', [
      1,                8,
      11,               18,
      21,               28,
      31,               38,
      41,               48,
      51,               58,
      61,               68,
      71,               78,
        82,           87,
          93,94,95,96,
    ]);

    defineCharacter('u', [
    41,                 48,
    51,                 58,
    61,                 68,
    71,                 78,
      82,            87,88,
         93,94,95,96,   98 
    ]);

    defineCharacter('V', [
    1,              9,
    11,             19,
      22,         28,
      32,         38,
        43,     47,
        53,     57,
          64, 66,
          74, 76,
            85,
            95,
    ]);

    defineCharacter('v', [
        43,     47,
        53,     57,
          64, 66,
          74, 76,
            85,
            95,
    ]);

    defineCharacter('W', [
       1,                   9,
      11,                   19,
      21,                   29, 
      31,                   39,
      41,        45,        49,
      51,        55,        59,
      61,        65,        69,
      71,        75,        79,
      81,     84,   86,     89,
        92,93,         97,98
    ]);

    defineCharacter('w', [
      41,                   49,
      51,        55,        59,
      61,        65,        69,
      71,        75,        79,
      81,     84,   86,     89,
        92,93,         97,98
    ]);

    defineCharacter('X', [
      1,            6,
      11,           16,
         22,      25,
         32,      35,
            43, 44,
            53, 54,
         62,      65,
         72,      75,
      81,            86,
      91,            96
    ]);

    defineCharacter('x', [
      41,            46,
         52,      55,
            63,64,
            73,74,
         82,      85,
      91,            96,
    ]);

    defineCharacter('Y', [
      1,                    9,
        12,              18,
           23,        27,
              34,  36,
                 45,
                 55,
                 65,
                 75,
                 85,
                 95
    ]);

    defineCharacter('y', [
      41,                 48,
      51,                 58,
      61,                 68,
      71,                 78,
      81,                 88,
        92,93,94,95,96,97,98,
                          108,
                          118,
                          128,
      131,                138,
      142,143,144,145,146,147
    ]);

    defineCharacter('Z', [
      1, 2, 3, 4, 5, 6, 7, 8,
                          18,
                        27,
                     36,
                  45,
               54,
            63,
         72,
      81,
      91,92,93,94,95,96,97,98
    ]);

    defineCharacter('z', [
      
      41,42,43,44,45,46,
                  55,
               64,
            73,
         82,
      91,92,93,94,95,96
    ]);

    // spacebar defined
    defineCharacter(' ', []);

    let gl = renderer.gl;
    let vertexBuffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
    let indexBuffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

    let vertexAttribs = [
      new PrimitiveAttribute('POSITION', vertexBuffer, 2, gl.FLOAT, 8, 0),
    ];

    let primitive = new Primitive(vertexAttribs, indices.length);
    primitive.setIndexBuffer(indexBuffer);

    let material = new CharacterSegmentMaterial({color: this._textColor});

    this._charPrimitives = {};
    for (let char in characters) {
      let charDef = characters[char];
      primitive.elementCount = charDef.count;
      primitive.indexByteOffset = charDef.offset;
      this._charPrimitives[char] = renderer.createRenderPrimitive(primitive, material);
    }

    this.text = this._text;
  }

  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value;

    let i = 0;
    let charPrimitive = null;
    for (; i < value.length; ++i) {
      if (value[i] in this._charPrimitives) {
        charPrimitive = this._charPrimitives[value[i]];
      } else {
        charPrimitive = this._charPrimitives['_'];
      }

      if (this._charNodes.length <= i) {
        let node = new Node();
        node.addRenderPrimitive(charPrimitive);
        let offset = i * TEXT_KERNING; //sort out spacing for individual letters here
        node.translation = [offset, 0, 0];
        this._charNodes.push(node);
        this.addNode(node);
      } else {
        // This is sort of an abuse of how these things are expected to work,
        // but it's the cheapest thing I could think of that didn't break the
        // world.
        this._charNodes[i].clearRenderPrimitives();
        this._charNodes[i].addRenderPrimitive(charPrimitive);
        this._charNodes[i].visible = true;
      }
    }

    // If there's any nodes left over make them invisible
    for (; i < this._charNodes.length; ++i) {
      this._charNodes[i].visible = false;
    }
  }
}