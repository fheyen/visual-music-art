import React from 'react';
import { schemeCategory10, scaleLinear, max, extent } from 'd3';
import View from '../lib/ui/View';
import { Canvas } from 'musicvis-lib';


export default class MidiTracks extends View {

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
        const { viewWidth, viewHeight, } = this.state;
        const { tracks } = this.props;

        const maxTime = max(tracks, notes => max(notes, n => n.end));
        const pitchExt = extent(tracks.flatMap(t => t.map(n => n.pitch)));

        const wholeSize = 0.35 * Math.max(viewWidth, viewHeight);
        const radius = Math.min(wholeSize / maxTime / 2, 5);

        const noteScale = scaleLinear()
            .domain([0, maxTime])
            .range([wholeSize / 10, wholeSize]);
        const pitchRange = radius * (pitchExt[1] - pitchExt[0]) / 2;
        const pitchScale = scaleLinear()
            .domain(pitchExt)
            .range([-pitchRange, pitchRange]);

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, viewWidth, viewHeight);

        const cx = viewWidth / 2;
        const cy = viewHeight / 2;

        for (let i = 0; i < tracks.length; i++) {
            ctx.fillStyle = schemeCategory10[i % 10];
            for (let note of tracks[i]) {
                const x = cx + noteScale(note.start);
                const y = cy - pitchScale(note.pitch);
                const r = this.getRotatedPosition(x, y, cx, cy, i, tracks.length);
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
    getRotatedPosition(px, py, cx, cy, index, rayCount) {
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
        const rotationAngle = 360 / rayCount;
        const angle = (rotationAngle * index) / 180 * Math.PI + startAngle;
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
};
