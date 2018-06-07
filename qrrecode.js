/**
 * @param  {String} message
 */
function log ( message, value ) {
    console.warn(`[QRRecode]:${ message }`, value);
}

/**
 * Create a transition animation when reload a new qrcode
 * @param  {HTMLCanvasElement} backgroundCanvas The original canvas and it will be redrawed
 * @param  {HTMLCanvasElement} foregroundCanvas The new canvas with the new qrcode
 * @param  {Object} options Including animation specific options
 * @return {Promise} Resolved when animation is done
 */
function QRRecode ( backgroundCanvas, foregroundCanvas, options ) {
    /**
     * Arguments type checking
     */
    if (!(backgroundCanvas instanceof HTMLCanvasElement)) {
        log('<HTMLCanvasElement>backgroundCanvas', backgroundCanvas);
        return Promise.resolve();
    }
    if (!(foregroundCanvas instanceof HTMLCanvasElement)) {
        log('<HTMLCanvasElement>foregroundCanvas', foregroundCanvas);
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
     * Clear destinationCanvas
     */
    function clear () {
        destinationContext.clearRect(0, 0, destinationWidth, destinationHeight);
    }

    /**
     * Output the last frame
     * @return {Promise} Resolved when animation is done
     */
    function done () {
        clear();
        destinationContext.drawImage(
            foregroundCanvas,
            0, 0, foregroundWidth, foregroundHeight,
            0, 0, destinationWidth, destinationHeight,
        );
        return Promise.resolve();
    }

    if (!options) {
        /**
         * No animation without options
         */
        log('<Object>options', options);
        return done();
    }

    /**
     * @type {Number} duration Animation duration
     */
    const duration = +options.duration || 0;

    if (!duration) {
        /**
         * No animation without duration
         */
        log('<Number>options.duration', duration);
        return done();
    }

    /**
     * @type {String} type Animation name, enum
     */
    const type = `${ options.type }`;

    /**
     * @type {Function} callback A progress callback
     */
    const { callback } = options;

    /**
     * @type {Number} startTime, endTime
     */
    const startTime = +new Date;
    const endTime = startTime + duration;

    {
        /**
         * @type {HTMLCanvasElement} backgroundCanvas Clone of destinationCanvas
         */
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.getContext('2d').drawImage(
            destinationCanvas,
            0, 0, destinationWidth, destinationHeight,
        );

        /**
         * @type {Object} closure Save variable
         */
        const closure = {};

        if (!fn.hasOwnProperty(type)) {
            log('<Function>fn[type]', fn);
            return Promise.resolve();
        }

        /**
         * Proceed the animation
         * @return {Promise} Resolved when animation is done
         */
        return new Promise(( resolve ) => {
            const payload = {
                closure,
                options,

                backgroundWidth,
                backgroundHeight,
                backgroundCanvas,

                foregroundWidth,
                foregroundHeight,
                foregroundCanvas,

                destinationWidth,
                destinationHeight,
                destinationCanvas,
                destinationContext,
            };
            function next () {
                clear();
                const now = +new Date;
                const percentage = Math.max(0, Math.min((now - startTime) / (endTime - startTime), 1));
                const call = ( type ) => fn[type].call(payload, percentage, call);
                call(type);
                if (callback) {
                    callback(percentage);
                }
                if (percentage >= 1) {
                    resolve();
                } else {
                    requestAnimationFrame(next);
                }
            }
            requestAnimationFrame(next);
        });
    }
};

/**
 * @type {Object} fn Save animation methods
 */
const fn = QRRecode.fn = {};

QRRecode.add = function ( type, method ) {
    fn[type] = method;
};

/**
 * @option type : 'smooth-fade'
 */
QRRecode.add('smooth-fade', function ( percentage, call ) {
    const {
        backgroundWidth,
        backgroundHeight,
        backgroundCanvas,

        foregroundWidth,
        foregroundHeight,
        foregroundCanvas,

        destinationWidth,
        destinationHeight,
        destinationContext,
    } = this;
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
});

/**
 * @option type : 'smooth-blur'
 * @option blur ?: Number = 5
 * @extends smooth-fade
 */
QRRecode.add('smooth-blur', function ( percentage, call ) {
    const {
        options,
        destinationContext,
    } = this;
    const { blur = 5 } = options;
    destinationContext.filter = `blur(${ (1 - Math.abs(percentage * 2 - 1)) * blur }px)`;
    call('smooth-fade');
    destinationContext.filter = '';
});

// Waiting for your pull requests
QRRecode.add('any-good-animation-idea', function ( percentage, call ) {
    const {
        closure,
        options,

        backgroundWidth,
        backgroundHeight,
        backgroundCanvas,

        foregroundWidth,
        foregroundHeight,
        foregroundCanvas,

        destinationWidth,
        destinationHeight,
        destinationCanvas,
        destinationContext,
    } = this;
    // your code
});

export default QRRecode;
