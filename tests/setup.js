// jsdom has no canvas; sprites only need a context that accepts fillRect.
HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {}, set fillStyle(v) {} });
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
