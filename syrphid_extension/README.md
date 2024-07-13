# Introduction

## Non-Page-Specific Information

Information that is accessible from within a browser extension with full permissions. Functions to gather this information is defined below.

### Browser Information

- User Agent String: Details about the browser type, version, and operating system.
- Browser Name and Version: Extracted from the user agent or navigator.userAgent.
- Navigator Properties: Additional properties such as navigator.userAgentData, navigator.vendor, navigator.product, etc.
- Browser Language: navigator.language.
- Installed Plugins: List of installed plugins via navigator.plugins.
- Cookies: Access to cookies.
- Local Storage: Data stored in local or session storage.
- Service Workers: Information about registered service workers.
- Web Push Notifications: Subscription details and ability to receive/send notifications.
- Browser Permissions: Current permissions granted to the extension.
- Browser History: Access to browsing history (with permissions).
- Browser Features Support: Information about supported browser features via navigator.
- Incognito Mode Detection: Whether the browser is in incognito/private mode.
- Browser Session Data: Current session data stored in sessionStorage.

### Machine Information

- Operating System: Inferred from the user agent string.
- Processor Architecture: navigator.platform.
- Hardware Concurrency: Number of logical processor cores via navigator.hardwareConcurrency.
- Device Memory: Approximate amount of device memory via navigator.deviceMemory.
- Graphics Card: Information about the graphics card via WebGL (e.g., WEBGL_debug_renderer_info).

### Machine Environment

- Geolocation: Latitude and longitude via the Geolocation API.
- Network Information:
  - Network Type: (e.g., Wi-Fi, cellular).
  - Effective Connection Type: (e.g., 4G, 3G).
  - Downlink Speed: Measured in Mbps.
  - Network Interfaces: Detailed information about network interfaces via WebRTC.
- IP Address: Inferred via WebRTC or external services.
- Battery Status: Battery level, charging status, and time remaining via the Battery Status API.
- Time Zone: Intl.DateTimeFormat().resolvedOptions().timeZone.
- Locale Information: Detailed locale information including navigator.languages (array of preferred languages).

### Screen and Display Information

- Screen Resolution: screen.width and screen.height.
- Viewport Size: window.innerWidth and window.innerHeight.
- Color Depth: screen.colorDepth.
- Pixel Density: Calculated using screen resolution and viewport size.
- Multi-Monitor Setup: Inferred using the Screen API.
- Screen Orientation: Current screen orientation via screen.orientation.
- Available Screen Area: screen.availWidth and screen.availHeight.
- Display Characteristics: Information about HDR support and display color profiles.
- Extended Display Information: Details about all connected monitors, not just the primary one.

### Performance Characteristics

- Navigation Timing: Detailed timing information about the loading of the document via the Navigation Timing API.
- Resource Timing: Timing details for each resource loaded by the document via the Resource Timing API.
- User Timing: Custom timing measurements via the User Timing API.
- Memory Usage: performance.memory (limited availability).
- Paint Timing: Information about first paint and first contentful paint via the Paint Timing API.
- Long Tasks API: Identifying long-running tasks that impact the user experience.
- Network Performance: Details on network latency and jitter via WebRTC.
- Page Load Metrics: Additional metrics from the Performance API (e.g., performance.getEntriesByType("navigation")).

### Audio/Video Capabilities

- Media Devices: List of available media input and output devices via the MediaDevices API.
- Media Capabilities: Detailed media capabilities such as support for different codecs and configurations via the Media Capabilities API.
- WebRTC: Detailed network and media information.
- Audio Context: Details about the audio context if the Web Audio API is used.
- Video Output: Information about connected video output devices.

### User Interaction

- Touch Points: Number of touch points the device supports via navigator.maxTouchPoints.
- Pointer Capabilities: Types of pointers (mouse, touch, pen) the device supports.
- Clipboard Access: Read and write to the clipboard (with permissions).
- Idle Detection: Information about user inactivity via the Idle Detection API.
- Drag and Drop: Details about the drag-and-drop support and events.

### Application and Service Workers

- Service Workers: Registered service workers for the site.
- Web Push Notifications: Ability to send and receive notifications.
- Background Sync: Information about background sync capabilities and registrations.
- Push Manager: Details about the Push Manager and current subscriptions.

### Other APIs

- Bluetooth: Interaction with Bluetooth devices via the Web Bluetooth API.
- USB: Interaction with USB devices via the Web USB API.
- Serial: Interaction with serial devices via the Web Serial API.
- NFC: Interaction with NFC devices via the Web NFC API.
- File System Access: Read and write access to the user's file system (with permissions).
- Storage Quota: Storage usage and quota information via the Storage API.
- Web Share: Ability to share content with other apps via the Web Share API.
- Augmented Reality (AR): Details about AR capabilities and devices via the WebAR API (if available).
- Digital Ink: Interaction with digital ink devices via appropriate APIs.

### Security and Privacy Considerations

- Content Security Policy: Details about the content security policy of the site.
- Referrer Policy: Details about the referrer policy of the site.
- Content Security Policy (CSP) Report: Access to CSP violation reports if the extension has permission.
- Subresource Integrity: Information on subresource integrity for loaded scripts.
- SSL/TLS Details: Information about the security of the connection.
- Security Headers: Information about HTTP security headers used by the site.
- Mixed Content: Detection of mixed content on the page.
- Cross-Origin Requests: Details about cross-origin requests and their statuses.

### Advanced and Experimental APIs

- WebAssembly: Ability to run WebAssembly modules.
- Payment Request: Initiating and managing payment requests via the Payment Request API.
- Credential Management: Access and manage user credentials via the Credential Management API.
- WebGPU: Access to more advanced GPU capabilities via the WebGPU API.
- File System Access (Advanced): More advanced file system capabilities like persistent storage.
- Background Fetch: Details about background fetch operations and capabilities.
- Scheduling API: Information on scheduling tasks using the Scheduling API.

### Miscellaneous

- Gamepad: Information about connected gamepads via the Gamepad API.
- Sensors: Access to device sensors like accelerometer, gyroscope, and magnetometer.
- Ambient Light: Detect ambient light levels via the Ambient Light Sensor API.
- Proximity: Information about nearby objects via the Proximity Sensor API.
- Speech Recognition: Transcribe spoken words into text via the Speech Recognition API.
- Speech Synthesis: Convert text to spoken words via the Speech Synthesis API.
- Virtual Reality: Access to VR devices and environments via the WebVR API.
- WebXR: Access to augmented reality devices and environments via the WebXR API.
- Clipboard API (Advanced): More detailed clipboard access including both read and write capabilities.
- Custom Elements: Information about custom HTML elements used on the page.
- Environmental Sensors: Information from environmental sensors like temperature and humidity.
- Haptics: Information on haptic feedback devices and capabilities.
- Web Locks API: Details about web locks acquired by the site.

### Browser Windows and Tabs

#### Window Information

- Window ID: Unique identifier for each browser window.
- Window Position: Top and left coordinates of the window.
- Window Size: Width and height of the window.
- Window State: Whether the window is maximized, minimized, normal, or fullscreen.
- Window Focus: Whether the window is focused or not.

#### Tab Information

- Tab ID: Unique identifier for each tab.
- Tab URL: URL of the tab.
- Tab Title: Title of the tab.
- Tab Status: Whether the tab is loading, complete, etc.
- Tab Position: The index position of the tab within the window.
- Tab Active State: Whether the tab is active or not.
- Tab Pinned State: Whether the tab is pinned.
- Tab Muted State: Whether the tab is muted.

#### Relationships Between Windows and Tabs

- Tabs in a Window: List of all tabs within a specific window.
- Active Tab in Window: The currently active tab within a specific window.
- Tab Group Information: Information about tab groups and their states.
- Tab Opener Information: Information about the tab that opened a particular tab.

const backgroundEvents = [
// Battery events
{name: "chargingchange", description: "Emitted when the battery charging state changes. Relevant for battery status monitoring in navigator contexts. Never page-specific.", parameters: ["charging"], context: ["battery", "navigator"]},
{name: "chargingtimechange", description: "Emitted when the battery charging time changes. Relevant for battery status monitoring in navigator contexts. Never page-specific.", parameters: ["chargingTime"], context: ["battery", "navigator"]},
{name: "dischargingtimechange", description: "Emitted when the battery discharging time changes. Relevant for battery status monitoring in navigator contexts. Never page-specific.", parameters: ["dischargingTime"], context: ["battery", "navigator"]},
{name: "levelchange", description: "Emitted when the battery level changes. Relevant for battery status monitoring in navigator contexts. Never page-specific.", parameters: ["level"], context: ["battery", "navigator"]},

    // Device sensor events
    {name: "devicelight", description: "Emitted when the ambient light level changes. Relevant for devices with light sensors. Never page-specific.", parameters: ["value"], context: ["device", "navigator"]},
    {name: "devicemotion", description: "Tracks acceleration of the device, triggered by changes in motion. Relevant for motion-sensing applications on devices. Never page-specific.", parameters: ["acceleration", "accelerationIncludingGravity", "rotationRate", "interval"], context: ["device", "window", "screen"]},
    {name: "deviceorientation", description: "Tracks orientation of the device, triggered by orientation changes. Relevant for orientation-sensing applications on devices. Never page-specific.", parameters: ["alpha", "beta", "gamma", "absolute"], context: ["device", "window", "screen"]},
    {name: "deviceorientationabsolute", description: "Tracks absolute orientation of the device, triggered by changes in absolute orientation. Relevant for orientation-sensing applications on devices. Never page-specific.", parameters: ["alpha", "beta", "gamma", "absolute"], context: ["device", "window", "screen"]},
    {name: "deviceproximity", description: "Emitted when a device detects proximity. Relevant for proximity-sensing applications on devices. Never page-specific.", parameters: ["value", "min", "max"], context: ["device", "navigator"]},
    {name: "userproximity", description: "Emitted when a device comes into proximity with a user. Relevant for proximity-sensing applications on devices. Never page-specific.", parameters: ["value", "min", "max"], context: ["device", "navigator"]},
    {name: "orientationchange", description: "Emitted when the screen orientation changes. Relevant for applications adjusting layout based on screen orientation. Never page-specific.", parameters: [], context: ["screen", "window"]},

    // Gamepad/controller events
    {name: "gamepadconnected", description: "Emitted when a gamepad is connected. Relevant for gamepad-specific interactions. Never page-specific.", parameters: ["gamepad"], context: ["gamepad", "navigator"]},
    {name: "gamepaddisconnected", description: "Emitted when a gamepad is disconnected. Relevant for gamepad-specific interactions. Never page-specific.", parameters: ["gamepad"], context: ["gamepad", "navigator"]},
    {name: "gamepadremapping", description: "Emitted when the mapping of a gamepad changes. Relevant for gamepad-specific interactions. Never page-specific.", parameters: ["gamepad"], context: ["gamepad", "navigator"]},
    {name: "controllerchange", description: "Emitted when the controller changes. Relevant for controller-specific interactions. Never page-specific.", parameters: [], context: ["controller", "document"]},

    // Service worker events
    {name: "activate", description: "Emitted when a service worker is activated. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["isUpdate"], context: ["serviceWorker", "navigator"]},
    {name: "fetch", description: "Emitted when a fetch event is intercepted by a service worker. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["request"], context: ["serviceWorker", "window"]},
    {name: "install", description: "Emitted when a service worker installation is attempted. Relevant for service worker-specific interactions. Never page-specific.", parameters: [], context: ["serviceWorker", "navigator"]},
    {name: "message", description: "Emitted when a message is received. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["data", "origin", "lastEventId", "source", "ports"], context: ["serviceWorker", "window", "document"]},
    {name: "push", description: "Emitted when a push notification is received. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["data"], context: ["serviceWorker", "navigator"]},
    {name: "statechange", description: "Emitted when there are state transitions, often related to service workers or other objects. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["state"], context: ["serviceWorker", "navigator"]},
    {name: "sync", description: "Emitted during synchronization. Relevant for service worker-specific interactions. Never page-specific.", parameters: ["tag", "lastChance"], context: ["serviceWorker", "navigator"]},

    // WebSocket events
    {name: "close", description: "Emitted when a WebSocket connection is closed. Relevant for WebSocket-specific interactions. Never page-specific.", parameters: ["code", "reason", "wasClean"], context: ["WebSocket", "network"]},
    {name: "open", description: "Emitted when a WebSocket connection is opened. Relevant for WebSocket-specific interactions. Never page-specific.", parameters: [], context: ["WebSocket", "network"]},

    // Geolocation events
    {name: "getCurrentPosition", description: "Emitted when the current position is requested. Relevant for geolocation-specific interactions. Never page-specific.", parameters: ["position"], context: ["geolocation", "navigator"]},
    {name: "watchPosition", description: "Emitted when the position changes. Relevant for geolocation-specific interactions. Never page-specific.", parameters: ["position"], context: ["geolocation", "navigator"]},

    // WebRTC events
    {name: "icecandidate", description: "Emitted when an ICE candidate is gathered. Relevant for WebRTC-specific interactions. Never page-specific.", parameters: ["candidate"], context: ["RTCPeerConnection", "network"]},
    {name: "iceconnectionstatechange", description: "Emitted when the ICE connection state changes. Relevant for WebRTC-specific interactions. Never page-specific.", parameters: ["iceConnectionState"], context: ["RTCPeerConnection", "network"]},
    {name: "negotiationneeded", description: "Emitted when renegotiation is needed. Relevant for WebRTC-specific interactions. Never page-specific.", parameters: [], context: ["RTCPeerConnection", "network"]},
    {name: "signalingstatechange", description: "Emitted when the signaling state changes. Relevant for WebRTC-specific interactions. Never page-specific.", parameters: ["signalingState"], context: ["RTCPeerConnection", "network"]},

    // Network status events
    {name: "online", description: "Emitted when the network connection is established. Relevant for network-specific interactions. Never page-specific.", parameters: [], context: ["navigator", "window"]},
    {name: "offline", description: "Emitted when the network connection is lost. Relevant for network-specific interactions. Never page-specific.", parameters: [], context: ["navigator", "window"]},
    {name: "networkchange", description: "Emitted when the network status changes. Relevant for network-specific interactions. Never page-specific.", parameters: [], context: ["navigator", "window"]},

];
