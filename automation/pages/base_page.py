from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from automation.config.config import Config
from automation.utils.logger import Logger

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.logger = Logger.get_logger(self.__class__.__name__)
        self.wait = WebDriverWait(self.driver, Config.EXPLICIT_WAIT)

    def navigate_to(self, url=None):
        target_url = url or Config.BASE_URL
        self.logger.info(f"Navigating to: {target_url}")
        self.driver.get(target_url)

    def find_element(self, locator):
        try:
            return self.wait.until(EC.presence_of_element_located(locator))
        except TimeoutException:
            self.logger.error(f"Element not found: {locator}")
            raise

    def click(self, locator):
        self.logger.info(f"Clicking element: {locator}")
        element = self.wait.until(EC.element_to_be_clickable(locator))
        element.click()

    def send_keys(self, locator, text):
        self.logger.info(f"Entering text into {locator}")
        element = self.find_element(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        element = self.find_element(locator)
        return element.text

    def is_displayed(self, locator):
        try:
            return self.find_element(locator).is_displayed()
        except (TimeoutException, NoSuchElementException):
            return False

    def get_page_title(self):
        return self.driver.title
