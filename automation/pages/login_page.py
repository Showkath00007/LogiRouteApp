from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class LoginPage(BasePage):
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-btn")
    ERROR_MESSAGE = (By.ID, "error-msg")
    ROLE_SELECTOR = (By.ID, "role-select")

    def login(self, username, password, role="driver"):
        self.navigate_to()
        if self.is_displayed(self.ROLE_SELECTOR):
            self.send_keys(self.ROLE_SELECTOR, role)
        if self.is_displayed(self.USERNAME_INPUT):
            self.send_keys(self.USERNAME_INPUT, username)
        if self.is_displayed(self.PASSWORD_INPUT):
            self.send_keys(self.PASSWORD_INPUT, password)
        if self.is_displayed(self.LOGIN_BUTTON):
            self.click(self.LOGIN_BUTTON)

    def get_error_message(self):
        if self.is_displayed(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return ""
