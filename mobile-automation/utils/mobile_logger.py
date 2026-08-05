import logging
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.mobile_config import MobileConfig

class MobileLogger:
    @staticmethod
    def get_logger(name="MobileAppiumAutomation"):
        logger = logging.getLogger(name)
        logger.setLevel(logging.INFO)
        if not logger.handlers:
            log_file = os.path.join(MobileConfig.LOGS_DIR, "mobile_execution.log")
            fh = logging.FileHandler(log_file)
            sh = logging.StreamHandler()
            fmt = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')
            fh.setFormatter(fmt)
            sh.setFormatter(fmt)
            logger.addHandler(fh)
            logger.addHandler(sh)
        return logger
