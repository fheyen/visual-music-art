import React from 'react';
import { scaleLinear } from 'd3';
import View from '../lib/ui/View';
import { Canvas } from 'musicvis-lib';


export default class NoteFlake extends View {


    componentDidMount = () => this.initialize();

    onResize = () => {
        this.initialize();
    };

    componentDidUpdate() {
        this.resizeComponent();
        this.draw();
    }

    initialize = () => {
        // Setup canvas rescaled to device pixel ratio
        Canvas.setupCanvas(this.canvas);
        this.setState(
            { initialized: true }
        );
    };

    /**
     * Main draw function, sets scale domains and controls drawing of each
     * component
     */
    draw = () => {
        const { viewWidth, viewHeight } = this.state;
        const { notes } = this.props;
        console.log(notes);


        const noteScale = scaleLinear()
            .domain([0, notes.length])
            .range([20, 0.3 * Math.max(viewWidth, viewHeight)]);

        // Draw foreground (changes all the time)
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

        const cx = viewWidth / 2;
        const cy = viewHeight / 2;

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const pos = noteScale(i);
            const x = cx + pos;
            const noteLetter = note.pitch % 12;
            const noteOct = Math.floor(note.pitch / 12) - 4;
            const rotated = this.getRotatedPosition(x, cy - noteOct * 10, cx, cy, noteLetter);
            Canvas.drawFilledCircle(ctx, rotated.x, rotated.y, 2);

        }
    };

    /**
     * For a point px, py at angle 0, returns all other points at rotated positions.
     *
     *                                (px, py)
     *                                   |
     *    (cx, xy) -----------------------
     *
     * @param {*} px
     * @param {*} py
     * @param {*} cx
     * @param {*} cy
     */
    getRotatedPosition(px, py, cx, cy, index) {
        // Start angle between hypotenuse and horizontal
        let startAngle = 0;
        if (py !== cy) {
            const dx = px - cx;
            const dy = py - cy;
            startAngle = Math.atan(dy / dx);
        }
        // Radius
        const r = Math.hypot((px - cx), (py - cy));
        // Get position
        const angle = (30 * index) / 180 * Math.PI + startAngle;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return { x, y };
    }

    render() {
        const { viewWidth, viewHeight } = this.state;
        // Only draw data after chart has been initialized
        if (this.canvas) {
            this.draw();
        }
        // HTML
        return (
            <div className='NoteFlake'>
                <canvas
                    className='ViewCanvas'
                    ref={n => this.canvas = n}
                    style={{ width: viewWidth, height: viewHeight }}
                />
            </div>
        );
    }
}
