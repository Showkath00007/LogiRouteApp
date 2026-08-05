import os

class MobileConfig:
    APPIUM_SERVER_URL = os.environ.get("APPIUM_SERVER_URL", "http://127.0.0.1:4723/wd/hub")
    PLATFORM_NAME = "Android"
    DEVICE_NAME = os.environ.get("DEVICE_NAME", "Android Emulator")
    AUTOMATION_NAME = "UiAutomator2"
    APK_PATH = os.environ.get("APK_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "app-debug.apk"))
    APP_PACKAGE = "com.logiroute.app"
    APP_ACTIVITY = ".MainActivity"
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    REPORTS_DIR = os.path.join(BASE_DIR, "reports")
    SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
    LOGS_DIR = os.path.join(BASE_DIR, "logs")

    @classmethod
    def setup_directories(cls):
        for p in [cls.REPORTS_DIR, cls.SCREENSHOTS_DIR, cls.LOGS_DIR]:
            os.makedirs(p, exist_ok=True)

MobileConfig.setup_directories()
