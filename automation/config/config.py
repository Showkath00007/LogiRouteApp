import os

class Config:
    # Must always run against LIVE GitHub Pages URL (configurable via env BASE_URL)
    BASE_URL = os.environ.get("BASE_URL", "https://kadiyalashowkathali.github.io/LogiRouteApp/")
    HEADLESS = os.environ.get("HEADLESS", "true").lower() == "true"
    IMPLICIT_WAIT = int(os.environ.get("IMPLICIT_WAIT", "10"))
    EXPLICIT_WAIT = int(os.environ.get("EXPLICIT_WAIT", "15"))
    BROWSER = os.environ.get("BROWSER", "chrome").lower()
    
    # Path configurations
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    REPORTS_DIR = os.path.join(BASE_DIR, "reports")
    SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
    LOGS_DIR = os.path.join(BASE_DIR, "logs")

    @classmethod
    def setup_directories(cls):
        for path in [cls.REPORTS_DIR, cls.SCREENSHOTS_DIR, cls.LOGS_DIR]:
            os.makedirs(path, exist_ok=True)

Config.setup_directories()
