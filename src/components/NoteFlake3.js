import React from 'react';
import { scaleLinear, max, extent } from 'd3';
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

        const maxTime = max(notes, n => n.end);
        const pitchExt = extent(notes, n => n.pitch);

        const wholeSize = 0.3 * Math.max(viewWidth, viewHeight);
        const radius = Math.min(wholeSize / maxTime / 2, 5);


        const noteScale = scaleLinear()
            .domain([0, maxTime])
            .range([12 * radius, wholeSize]);
        const pitchScale = scaleLinear()
            .domain(pitchExt)
            .range([radius, radius * (pitchExt[1] - pitchExt[0])]);

        // Draw foreground (changes all the time)
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

        const cx = viewWidth / 2;
        const cy = viewHeight / 2;

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            const x = cx + noteScale(note.start);
            const y = cy + pitchScale(note.pitch);
            const rotated = this.getRotatedPositions(x, y, cx, cy);
            for (const r of rotated) {
                Canvas.drawFilledCircle(ctx, r.x, r.y, radius);
            }
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
    getRotatedPositions(px, py, cx, cy) {
        const points = [];
        // Start angle between hypotenuse and horizontal
        let startAngle = 0;
        if (py !== cy) {
            const dx = px - cx;
            const dy = py - cy;
            startAngle = Math.atan(dy / dx);
        }
        // Radius
        const r = Math.hypot((px - cx), (py - cy));
        // Get positions
        for (let i = 0; i < 6; i++) {
            const angle = (60 * i) / 180 * Math.PI + startAngle;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            points.push({ x, y });
            // Mirror if startangle !== 0
            if (startAngle !== 0) {
                const y2 = cy - Math.sin(angle) * r;
                points.push({ x, y: y2 });
            }
        }
        return points;
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
