/**
 * Create a transition animation when reload a new qrcode
 * @param  {HTMLCanvasElement} backgroundCanvas The original canvas and it will be redrawed
 * @param  {HTMLCanvasElement} foregroundCanvas The new canvas with the new qrcode
 * @param  {Object} options Including animation specific options
 * @return {Promise} Resolved when animation done
 */
export default function ( backgroundCanvas, foregroundCanvas, options ) {

    /**
     * Arguments type checking
     */
    if (!(backgroundCanvas instanceof HTMLCanvasElement)) {
        return Promise.resolve();
    }
    if (!(foregroundCanvas instanceof HTMLCanvasElement)) {
        return Promise.resolve();
    }

    /**
     * @type {Number} backgroundWidth, backgroundHeight, foregroundWidth, foregroundHeight, destinationWidth, destinationHeight
     */
    const { width : backgroundWidth, height : backgroundHeight } = backgroundCanvas;
    const { width : foregroundWidth, height : foregroundHeight } = foregroundCanvas;

    const destinationWidth = backgroundWidth;
    const destinationHeight = backgroundHeight;

    /**
     * @type {HTMLCanvasElement} destinationCanvas Point to backgroundCanvas
     */
    const destinationCanvas = backgroundCanvas;
    const destinationContext = destinationCanvas.getContext('2d');

    /**
     * clear destinationCanvas
     */
    function clear () {
        destinationContext.clearRect(0, 0, destinationWidth, destinationHeight);
    }

    {
        /**
         * @type {HTMLCanvasElement} backgroundCanvas Clone of destinationCanvas
         */
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.getContext('2d').drawImage(
            destinationCanvas,
            0, 0, destinationWidth, destinationHeight,
        );

        if (!options) {
            /**
             * No animation without options
             */
            clear();
            destinationContext.drawImage(
                foregroundCanvas,
                0, 0, foregroundWidth, foregroundHeight,
                0, 0, destinationWidth, destinationHeight,
            );
            return Promise.resolve();
        }

        const type = `${ options.type }`;
        const duration = +options.duration || 0;

        const startTime = +new Date;
        const endTime = startTime + duration;

        let size = -1;

        function draw ( percentage ) {
            clear();

            if (type == 'smooth-fade') {
                destinationContext.globalAlpha = 1 - percentage;
                destinationContext.drawImage(
                    backgroundCanvas,
                    0, 0, backgroundWidth, backgroundHeight,
                    0, 0, destinationWidth, destinationHeight,
                );
                destinationContext.globalAlpha = percentage;
                destinationContext.drawImage(
                    foregroundCanvas,
                    0, 0, foregroundWidth, foregroundHeight,
                    0, 0, destinationWidth, destinationHeight,
                );
                destinationContext.globalAlpha = 1;
                return;
            }

            if (type == 'smooth-blur') {
                destinationContext.filter = `blur(${ (1 - Math.abs(percentage * 2 - 1)) * 5 }px)`;
                destinationContext.globalAlpha = 1 - percentage;
                destinationContext.drawImage(
                    backgroundCanvas,
                    0, 0, backgroundWidth, backgroundHeight,
                    0, 0, destinationWidth, destinationHeight,
                );
                destinationContext.globalAlpha = percentage;
                destinationContext.drawImage(
                    foregroundCanvas,
                    0, 0, foregroundWidth, foregroundHeight,
                    0, 0, destinationWidth, destinationHeight,
                );
                destinationContext.globalAlpha = 1;
                destinationContext.filter = '';
                return;
            }

            if (type == 'test') {
                // todo

                if (size == -1) {
                    size = 0;
                    function getPixelSize ( canvas ) {
                        const context = canvas.getContext('2d');
                        const { width, height } = canvas;
                        let size = 1;
                        while (true) {
                            const { data } = context.getImageData(size, size, 1, 1);
                            const color = [];
                            [].push.apply(color, data);
                            const [ r, g, b ] = color;
                            if (r === g && g === b && b === 255) {
                                return size;
                            }
                            size++;
                            if (size > width) {
                                return 0;
                            }
                            if (size > height) {
                                return 0;
                            }
                        }
                    }
                    size = Math.min(getPixelSize(backgroundCanvas), getPixelSize(foregroundCanvas));
                }

                if (size > 0) {
                    const total = destinationWidth / size;
                    for (let x = 0; x < total; x++) {
                        for (let y = 0; y < total; y++) {
                            const dx = total - 2 * x;
                            const dy = total - 2 * y;
                            destinationContext.globalAlpha = 1 - percentage;
                            destinationContext.drawImage(
                                backgroundCanvas,
                                size * x, size * y, size, size,
                                size * (x + dx * percentage), size * (y + dy * percentage), size, size,
                            );
                            destinationContext.globalAlpha = percentage;
                            destinationContext.drawImage(
                                foregroundCanvas,
                                size * x, size * y, size, size,
                                size * x, size * y, size, size,
                            );
                            destinationContext.globalAlpha = 1;
                        }
                    }
                }

                return;
            }

            // Waiting for your pull requests
            // if (type == 'any good animation idea') {
            // your code
            // }

            destinationContext.drawImage(
                foregroundCanvas,
                0, 0, foregroundWidth, foregroundHeight,
                0, 0, destinationWidth, destinationHeight,
            );
        }

        return new Promise(( resolve ) => {
            function loop () {

                const now = +new Date;
                const percentage = (now - startTime) / (endTime - startTime);

                if (percentage >= 1) {
                    resolve();
                } else {
                    draw(percentage);
                    requestAnimationFrame(loop);
                }
            }
            requestAnimationFrame(loop);
        });
    }

};
