import os
import sys
import json
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.mobile_config import MobileConfig

class MobileHTMLReporter:
    @staticmethod
    def generate_mobile_html_reports(results):
        os.makedirs(os.path.join(MobileConfig.REPORTS_DIR, "HTML"), exist_ok=True)
        os.makedirs(os.path.join(MobileConfig.REPORTS_DIR, "JSON"), exist_ok=True)
        os.makedirs(os.path.join(MobileConfig.REPORTS_DIR, "Summary"), exist_ok=True)

        total = len(results)
        passed = sum(1 for r in results if r['status'].upper() == "PASS")
        failed = sum(1 for r in results if r['status'].upper() == "FAIL")
        skipped = total - passed - failed
        pass_pct = (passed / total * 100) if total > 0 else 0

        # JSON results
        with open(os.path.join(MobileConfig.REPORTS_DIR, "JSON", "execution-results.json"), "w") as f:
            json.dump({"total": total, "passed": passed, "failed": failed, "skipped": skipped, "results": results}, f, indent=2)

        # Markdown summary
        with open(os.path.join(MobileConfig.REPORTS_DIR, "Summary", "summary.md"), "w") as f:
            f.write(f"""# Android Appium E2E Execution Summary

- **Execution Date**: {time.strftime("%Y-%m-%d %H:%M:%S")}
- **Device**: Android Emulator (API 34)
- **App Package**: `{MobileConfig.APP_PACKAGE}`

## Execution Metrics
- **Total Test Cases**: {total}
- **Passed**: {passed}
- **Failed**: {failed}
- **Skipped**: {skipped}
- **Pass Percentage**: {pass_pct:.2f}%

### Executed Tests Overview
""")
            for r in results[:10]:
                st = "✓" if r['status'].upper() == "PASS" else "✗"
                f.write(f"- {st} **{r['id']}** - {r['name']} ({r['module']})\n")

        # execution-report.html
        html_file = os.path.join(MobileConfig.REPORTS_DIR, "HTML", "execution-report.html")
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Android Appium Mobile Automation Report</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #e2e8f0; padding: 20px; }}
        .card {{ background: #131c2e; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 20px; }}
        .metric {{ font-size: 28px; font-weight: bold; color: #38bdf8; }}
        table {{ width: 100%; border-collapse: collapse; background: #131c2e; margin-top: 15px; }}
        th, td {{ padding: 10px; border-bottom: 1px solid #1e293b; text-align: left; }}
        th {{ background: #0f172a; color: #94a3b8; }}
        .pass {{ color: #4ade80; font-weight: bold; }}
        .fail {{ color: #f87171; font-weight: bold; }}
    </style>
</head>
<body>
    <h1>Android Appium E2E Automation Report</h1>
    <div class="card">
        <p>Device: Android Emulator | OS: Android 14 | Package: {MobileConfig.APP_PACKAGE}</p>
        <p>Total Tests: <strong>{total}</strong> | Passed: <span class="pass">{passed}</span> | Failed: <span class="fail">{failed}</span> | Pass Rate: <span class="metric">{pass_pct:.1f}%</span></p>
    </div>
    <h2>Detailed Execution Results</h2>
    <table>
        <thead>
            <tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Status</th><th>Duration (s)</th></tr>
        </thead>
        <tbody>
"""
        for r in results:
            st_cls = r['status'].lower()
            html_content += f"<tr><td>{r['id']}</td><td>{r['module']}</td><td>{r['name']}</td><td>{r['priority']}</td><td class='{st_cls}'>{r['status']}</td><td>{r['duration']}</td></tr>"
        
        html_content += "</tbody></table></body></html>"
        
        with open(html_file, "w") as f:
            f.write(html_content)
        
        with open(os.path.join(MobileConfig.REPORTS_DIR, "HTML", "dashboard.html"), "w") as f:
            f.write(html_content)

        with open(os.path.join(MobileConfig.REPORTS_DIR, "HTML", "trends.html"), "w") as f:
            f.write(html_content)
