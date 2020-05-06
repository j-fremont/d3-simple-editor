import React from 'react';
import '../css/editor.css';

const style = {
  'width': '100%'
};

export default class MySchema extends React.Component {
  render() {
    return (
            <svg height="800" width="1200" style={style}>
              <defs>
                <linearGradient id="FirstGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#086A87"/>
                  <stop offset="100%" stop-color="#0B4C5F"/>
                </linearGradient>
                <linearGradient id="SecondGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#B40431"/>
                  <stop offset="100%" stop-color="#8A0829"/>
                </linearGradient>
                <linearGradient id="ThirdGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#86B404"/>
                  <stop offset="100%" stop-color="#688A08"/>
                </linearGradient>

                <g id="icon-1" class="style1">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="40" />
                  <line x1="40" y1="10" x2="10" y2="40" />
                </g>
                <g id="icon-2" class="style1">
                  <circle cx="25" cy="25" r="25" />
                  <circle cx="25" cy="25" r="10" fill="none" />
                </g>
                <g id="icon-3" class="style1">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="10" />
                  <line x1="40" y1="10" x2="25" y2="40" />
                  <line x1="25" y1="40" x2="10" y2="10" />
                </g>
                <g id="icon-4" class="style1">
                  <rect width="50" height="50" />
                  <rect x="10" y="10" width="30" height="30" fill="none" />
                </g>

                <g id="icon-5" class="style2">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="40" />
                  <line x1="40" y1="10" x2="10" y2="40" />
                </g>
                <g id="icon-6" class="style2">
                  <circle cx="25" cy="25" r="25" />
                  <circle cx="25" cy="25" r="10" fill="none" />
                </g>
                <g id="icon-7" class="style2">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="10" />
                  <line x1="40" y1="10" x2="25" y2="40" />
                  <line x1="25" y1="40" x2="10" y2="10" />
                </g>
                <g id="icon-8" class="style2">
                  <rect width="50" height="50" />
                  <rect x="10" y="10" width="30" height="30" fill="none" />
                </g>

                <g id="icon-9" class="style3">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="40" />
                  <line x1="40" y1="10" x2="10" y2="40" />
                </g>
                <g id="icon-10" class="style3">
                  <circle cx="25" cy="25" r="25" />
                  <circle cx="25" cy="25" r="10" fill="none" />
                </g>
                <g id="icon-11" class="style3">
                  <rect width="50" height="50" />
                  <line x1="10" y1="10" x2="40" y2="10" />
                  <line x1="40" y1="10" x2="25" y2="40" />
                  <line x1="25" y1="40" x2="10" y2="10" />
                </g>
                <g id="icon-12" class="style3">
                  <rect width="50" height="50" />
                  <rect x="10" y="10" width="30" height="30" fill="none" />
                </g>

              </defs>
              <g id="palette"/>
              <g id="paths"/>
              <g id="icons"/>
            </svg>

    );
  }
};
