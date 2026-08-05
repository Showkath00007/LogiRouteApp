from selenium.webdriver.common.by import By
from automation.pages.base_page import BasePage

class DashboardPage(BasePage):
    NAV_ROUTE = (By.ID, "nav-route")
    NAV_BOOKING = (By.ID, "nav-booking")
    NAV_TRACKING = (By.ID, "nav-tracking")
    NAV_PROFILE = (By.ID, "nav-profile")
    USER_WELCOME = (By.ID, "user-welcome")
    LOGOUT_BTN = (By.ID, "logout-btn")

    def navigate_to_route(self):
        if self.is_displayed(self.NAV_ROUTE):
            self.click(self.NAV_ROUTE)

    def navigate_to_booking(self):
        if self.is_displayed(self.NAV_BOOKING):
            self.click(self.NAV_BOOKING)

    def logout(self):
        if self.is_displayed(self.LOGOUT_BTN):
            self.click(self.LOGOUT_BTN)
