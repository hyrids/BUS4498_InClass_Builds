# Present Forecast Summary Task Specification

## Basic Information

- **Task ID:** T7
- **Task name:** Present Forecast Summary
- **Task type:** Act
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Present the completed attendance forecast and supply-planning results to the CPVC AI Hackathon organizer. The summary combines the attendance range, recommended supply quantities, assumptions, limitations, and budget status for organizer review. This task does not purchase supplies or contact students.

## 2. Inputs

### Input 1

- **Input name:** Attendance forecast
- **Contents and format:** A structured record containing the low, expected, and high attendance estimates, evidence, assumptions, limitations, and confidence status.
- **Source:** T4 Estimate Likely Attendance

### Input 2

- **Input name:** Supply recommendations
- **Contents and format:** A structured table containing the recommended quantities of food, drinks, and swag for the attendance scenarios.
- **Source:** T5 Calculate Supply Recommendations

### Input 3

- **Input name:** Budget fit assessment
- **Contents and format:** A structured assessment showing estimated costs, available budget, budget variance, and whether the recommendations fit within the budget.
- **Source:** T6 Check Budget Fit

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Forecast summary
- **Contents and format:** A readable summary showing the low, expected, and high attendance range, recommended supply quantities, supporting evidence, assumptions, limitations, confidence status, and budget status.
- **Next task or recipient:** CPVC AI Hackathon organizer
- **Complete when:** The summary is displayed for organizer review and clearly states that no supplies were purchased, no students were contacted, and no individual participant information was shared.

## 4. Planned Tools

### Tool 1

- **Tool name:** `present_forecast_summary`
- **Input:** Forecast summary
- **Output:** Displayed forecast summary
- **Implementation Route:** File operations and functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Format and display the forecast information for the organizer without making purchases or sending messages to students.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary formatting or display error. Because the tool only displays information and does not change records or send messages, a retry does not create a duplicate external action.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the summary was not displayed and send the case to the CPVC AI Hackathon organizer for review. Do not report the task as complete.
