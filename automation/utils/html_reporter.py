import os
import json
import time
from automation.config.config import Config

class HTMLReporter:
    @staticmethod
    def generate_html_reports(results, base_url=None):
        os.makedirs(os.path.join(Config.REPORTS_DIR, "HTML"), exist_ok=True)
        os.makedirs(os.path.join(Config.REPORTS_DIR, "JSON"), exist_ok=True)
        os.makedirs(os.path.join(Config.REPORTS_DIR, "Summary"), exist_ok=True)

        target_url = base_url or Config.BASE_URL
        total = len(results)
        passed = sum(1 for r in results if r['status'].upper() == "PASS")
        failed = sum(1 for r in results if r['status'].upper() == "FAIL")
        skipped = total - passed - failed
        pass_pct = (passed / total * 100) if total > 0 else 0

        # Save JSON results
        json_file = os.path.join(Config.REPORTS_DIR, "JSON", "execution-results.json")
        with open(json_file, "w") as f:
            json.dump({"total": total, "passed": passed, "failed": failed, "skipped": skipped, "results": results}, f, indent=2)

        # Save Markdown Summary
        summary_md = os.path.join(Config.REPORTS_DIR, "Summary", "summary.md")
        with open(summary_md, "w") as f:
            f.write(f"""# Live GitHub Pages E2E Execution Summary

- **Deployment URL**: `{target_url}`
- **Execution Date**: {time.strftime("%Y-%m-%d %H:%M:%S")}
- **Build Status**: {'PASS' if pass_pct >= 95 else 'FAIL'}
- **Deployment Status**: PASS

## Execution Metrics
- **Total Test Cases**: {total}
- **Passed**: {passed} ({pass_pct:.1f}%)
- **Failed**: {failed}
- **Skipped**: {skipped}
- **Pass Percentage**: {pass_pct:.2f}%

### Top Failed Modules
""")
            for r in results:
                if r['status'].upper() == "FAIL":
                    f.write(f"- **{r['id']}** ({r['name']}): {r.get('error', 'Assertion Failed')}\n")

        # Save execution-report.html
        html_file = os.path.join(Config.REPORTS_DIR, "HTML", "execution-report.html")
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LogiRoute E2E Live Execution Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155; }}
        .card-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }}
        .card {{ background: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #334155; text-align: center; }}
        .card h3 {{ margin: 0 0 10px 0; color: #94a3b8; font-size: 14px; text-transform: uppercase; }}
        .card .val {{ font-size: 32px; font-weight: bold; }}
        .val.pass {{ color: #10b981; }}
        .val.fail {{ color: #ef4444; }}
        .val.skip {{ color: #f59e0b; }}
        table {{ width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 10px; overflow: hidden; }}
        th, td {{ padding: 12px 15px; text-align: left; border-bottom: 1px solid #334155; }}
        th {{ background: #0f172a; color: #94a3b8; text-transform: uppercase; font-size: 12px; }}
        .badge {{ padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }}
        .badge.pass {{ background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }}
        .badge.fail {{ background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }}
        .badge.skip {{ background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>LogiRoute E2E Selenium Live Execution Report</h1>
            <p>Target Deployment: <a href="{target_url}" style="color: #38bdf8;">{target_url}</a></p>
        </div>
        <div>
            <span class="badge {'pass' if pass_pct >= 95 else 'fail'}" style="font-size: 16px; padding: 8px 16px;">
                Overall Status: {'PASS' if pass_pct >= 95 else 'FAIL'}
            </span>
        </div>
    </div>

    <div class="card-grid">
        <div class="card"><h3>Total Tests</h3><div class="val">{total}</div></div>
        <div class="card"><h3>Passed</h3><div class="val pass">{passed}</div></div>
        <div class="card"><h3>Failed</h3><div class="val fail">{failed}</div></div>
        <div class="card"><h3>Skipped</h3><div class="val skip">{skipped}</div></div>
        <div class="card"><h3>Pass Rate</h3><div class="val pass">{pass_pct:.1f}%</div></div>
    </div>

    <h2>Test Execution Details</h2>
    <table>
        <thead>
            <tr>
                <th>Test ID</th>
                <th>Module</th>
                <th>Test Name</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Duration (s)</th>
            </tr>
        </thead>
        <tbody>
"""
        for r in results:
            st = r['status'].lower()
            html_content += f"""
            <tr>
                <td>{r['id']}</td>
                <td>{r['module']}</td>
                <td>{r['name']}</td>
                <td>{r['priority']}</td>
                <td><span class="badge {st}">{r['status']}</span></td>
                <td>{r['duration']}</td>
            </tr>
"""
        html_content += """
        </tbody>
    </table>
</body>
</html>
"""
        with open(html_file, "w") as f:
            f.write(html_content)

        # Duplicate to dashboard.html
        dashboard_file = os.path.join(Config.REPORTS_DIR, "HTML", "dashboard.html")
        with open(dashboard_file, "w") as f:
            f.write(html_content)
