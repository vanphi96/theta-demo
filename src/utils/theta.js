import DigestClient from "./digest-fetch-src";
/* Constants */
const CORS_ANYWHERE = "http://127.0.0.1:8080"; // Address for CORS reverse proxy
const RERENDER_EVENT = "new_frame_loaded"; // name for the rerender event
const STREAM_STOPPED_EVENT = "stream_stopped";
const STREAM_STARTED_EVENT = "stream_started";
const SKYBOX_ID = "preview_image"; // id of <a-sky> element to render stream to
const THETA_IP = 'http://191.168.1.1:80'


/* SETTINGS */
var settings = {
    theta_ip: "192.168.1.1", // IP of the theta
    theta_user: "THETAYP20117373", // Username for the theta (aka serial #)
    theta_pass: "20117373", // Password for the theta (last part of serial #)
    theta_res_x: 1024, // horizontal resolution of the stream
    theta_res_y: 512, // vertical resolution of the stream
    theta_fps: 30, // fps of the stream
    record_locally: false, // record the video locally (maybe shouldn't be here?)
    record_dir: "" // where to record the video locally
};

/* STATUS */
var thetaStatus = {
    streamingInternal: false,
    streamingListener: function(val) {},
    set streaming(val) {
        this.streamingInternal = val;
        this.streamingListener(val);
    },
    get streaming() {
        return this.streamingInternal;
    },
    registerListener: function(listener) {
        this.streamingListener = listener;
    }
}


export default getThetaLivePreview = () => {
    const endpoint = "/osc/commands/execute";
    const url = THETA_IP + endpoint;
    const postData = { name: "camera.getLivePreview" };

    const SOI = new Uint8Array(2);
    SOI[0] = 0xFF;
    SOI[1] = 0xD8;
    const CONTENT_LENGTH = 'Content-Length';
    const TYPE_JPEG = 'image/jpeg';

    // Use digest fetch
    const digestOptions = {
        cnonceSize: 16, // length of cnonce, default: 32
        logger: console, // logger for debug, default: none
        algorithm: 'MD5' // only 'MD5' is supported now
    }
    console.log('philv getThetaLivePreview');
    const client = new DigestClient(settings.theta_user, settings.theta_pass, digestOptions)
    console.log('fetch start');
    client.fetch(url, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            console.log('fetch error 1');
            throw Error(response.status + ' ' + response.statusText)
        }

        if (!response.body) {
            console.log('fetch error 2');
            throw Error('ReadableStream not yet supported in this browser.')
        }

        console.log('fetch ok ok ');


        const reader = response.body.getReader();

        let headers = '';
        let contentLength = -1;
        let imageBuffer = null;
        let bytesRead = 0;
        let lastFrameImgUrl = null;

        // // Signal that we have started streaming
        // var startEvent = new Event(STREAM_STARTED_EVENT);
        // document.dispatchEvent(startEvent);

        // // Stop when the stream stops
        // document.addEventListener(STREAM_STOPPED_EVENT, function(e) { return; }, false);

        // calculating fps and mbps. TODO: implement a floating window function.
        let frames = 0;
        let bytesThisSecond = 0;
        setInterval(() => {
            var mbps = (bytesThisSecond / (1000000 / 8)).toFixed(3);
            console.log("fps : " + frames + " @ " + mbps + " Mbps");
            bytesThisSecond = 0;
            frames = 0;
        }, 1000)


        const read = () => {

            reader.read().then(({ done, value }) => {
                if (done) {
                    return;
                }

                for (let index = 0; index < value.length; index++) {

                    // Start of the frame, everything we've till now was header
                    if (value[index] === SOI[0] && value[index + 1] === SOI[1]) {
                        contentLength = getLength(headers);
                        imageBuffer = new Uint8Array(
                            new ArrayBuffer(contentLength));
                    }
                    // we're still reading the header.
                    if (contentLength <= 0) {
                        headers += String.fromCharCode(value[index]);
                    }
                    // we're now reading the jpeg. 
                    else if (bytesRead < contentLength) {
                        imageBuffer[bytesRead++] = value[index];
                        bytesThisSecond++;
                    }
                    // we're done reading the jpeg. Time to render it. 
                    else {
                        //console.log("jpeg read with bytes : " + bytesRead);

                        // Generate blob of the image and emit event
                        lastFrameImgUrl = URL.createObjectURL(
                            new Blob([imageBuffer], { type: TYPE_JPEG }));
                        console.log('philv');
                        console.log(lastFrameImgUrl);
                        // var reRenderEvent = new CustomEvent(RERENDER_EVENT, { detail: lastFrameImgUrl });
                        // document.dispatchEvent(
                        //     reRenderEvent);

                        // Reset for the frame
                        frames++;
                        contentLength = 0;
                        bytesRead = 0;
                        headers = '';
                    }
                }

                read();
            }).catch(error => {
                console.error(error);
            })
        }

        read();

    }).catch(error => {
        //thetaStatus.streaming = false;  // we are no longer connected
        // var stopEvent = new Event(STREAM_STOPPED_EVENT);
        // document.dispatchEvent(stopEvent);
        // console.error(error);
    })

    // Gets the length of an MJPEG chunk from the headers of a stream
    const getLength = (headers) => {
        let contentLength = -1;
        headers.split('\n').forEach((header, _) => {
            const pair = header.split(':');
            if (pair[0] === CONTENT_LENGTH) {
                contentLength = pair[1];
            }
        })
        return contentLength;
    };
}