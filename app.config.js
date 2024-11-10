module.exports = {
    "expo": {
        "name": "PBApp",
        "slug": "PBApp",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/icon.png",
        "userInterfaceStyle": "light",
        "splash": {
            "image": "./assets/splash.png",
            "backgroundColor": "#ffffff"
        },
        "ios": {
            "supportsTablet": true
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            }
        },
        "web": {
            "favicon": "./assets/favicon.png"
        },
        "extra": {
            "API_URL": process.env.API_URL || "http://localhost:5000/api"
        }
    }
};

