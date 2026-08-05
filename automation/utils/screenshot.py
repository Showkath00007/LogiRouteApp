import os
import time
from automation.config.config import Config
from automation.utils.logger import Logger

logger = Logger.get_logger("ScreenshotUtil")

class ScreenshotUtil:
    @staticmethod
    def capture_screenshot(driver, test_name):
        try:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            filename = f"{test_name}_{timestamp}.png"
            filepath = os.path.join(Config.SCREENSHOTS_DIR, filename)
            driver.save_screenshot(filepath)
            logger.info(f"Screenshot saved to: {filepath}")
            return filepath
        except Exception as e:
            logger.error(f"Failed to capture screenshot for {test_name}: {str(e)}")
            return None
