import React, { Component } from 'react';
import './style/App.css';
import NoteFlake from './components/NoteFlake3';
import MidiTracks from './components/MidiTracks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import MidiParser from 'midi-parser-js';
import { preprocessMidiFileData } from 'musicvis-lib';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewSize: {
        outerWidth: 800,
        outerHeight: 600
      },
      midiFileData: [],
      notes: [],
    };
  }

  componentDidMount() {
    // Scale layout to current screen size
    window.addEventListener('resize', this.onResize, false);
    this.onResize();

    const source = document.getElementById('filereader');
    MidiParser.parse(source, (obj) => {
      try {
        const parsed = preprocessMidiFileData(obj);
        const parts = parsed.parts.map(d => d.noteObjs);
        this.setState({
          midiFileData: parts,
          notes: parts[0]
        });
      } catch (e) {
        alert('Invalid MIDI file or wrong format!');
      }
    });
  }

  /**
   * Updates the size state when the window size changes
   * so views can react and redraw
   */
  onResize = () => {
    this.setState({
      viewSize: {
        outerWidth: Math.floor(window.innerWidth - 20),
        outerHeight: Math.floor(window.innerHeight - 200)
      }
    });
  };

  render() {
    const s = this.state;
    return (
      <div className={`App dark`} >
        <div>
          <label>
            Open a MIDI file
            <input
              className='fileInput'
              type='file'
              id='filereader'
              accept='.midi,.mid'
            />
          </label>
        </div>
        <MidiTracks
          viewSize={s.viewSize}
          tracks={s.midiFileData}
        />
        <NoteFlake
          viewSize={s.viewSize}
          notes={s.notes}
        />
        <div className='githubLink'>
          <a
            href='https://github.com/fheyen/visual-music-art'
            target='blank'
          >
            <FontAwesomeIcon icon={faGithub} />&nbsp;
              https://github.com/fheyen/visual-music-art
          </a>
        </div>
      </div >
    );
  }
}
