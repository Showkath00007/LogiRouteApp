import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from automation.utils.excel_reporter import ExcelReporter
from config.mobile_config import MobileConfig

class MobileExcelReporter:
    @staticmethod
    def generate_mobile_excel_reports(results):
        os.makedirs(os.path.join(MobileConfig.REPORTS_DIR, "Excel"), exist_ok=True)
        main_file = os.path.join(MobileConfig.REPORTS_DIR, "Excel", "Automation_Test_Report.xlsx")
        ExcelReporter.generate_excel_reports(
            results=results,
            suite_name="LogiRoute Mobile App — Full E2E Workflow",
            start_time="2026-06-09T16:22:48.467755Z",
            end_time="2026-06-09T16:46:55.377983Z",
            output_path=main_file
        )
