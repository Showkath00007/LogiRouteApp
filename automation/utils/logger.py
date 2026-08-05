import logging
import os
from automation.config.config import Config

class Logger:
    @staticmethod
    def get_logger(name="SeleniumAutomation"):
        logger = logging.getLogger(name)
        logger.setLevel(logging.INFO)
        if not logger.handlers:
            log_file = os.path.join(Config.LOGS_DIR, "execution.log")
            file_handler = logging.FileHandler(log_file)
            stream_handler = logging.StreamHandler()
            
            formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')
            file_handler.setFormatter(formatter)
            stream_handler.setFormatter(formatter)
            
            logger.addHandler(file_handler)
            logger.addHandler(stream_handler)
        return logger
