# Check Budget Fit Task Specification

## Basic Information

- **Task ID:** T6
- **Task name:** Check Budget Fit
- **Task type:** Verify
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Compare the estimated cost of the recommended food, drinks, and swag quantities with the organizer’s available event budget. Determine whether the recommendations fit within the budget and identify the amount over or under budget.

## 2. Inputs

### Input 1

- **Input name:** Supply recommendations
- **Contents and format:** A structured table containing the recommended quantities for food, drinks, and swag under the low, expected, and high attendance scenarios.
- **Source:** T5 Calculate Supply Recommendations

### Input 2

- **Input name:** Event budget
- **Contents and format:** A structured planning record containing the maximum available budget for event supplies.
- **Source:** T1 Retrieve Event Planning Context

### Input 3

- **Input name:** Supply cost estimates
- **Contents and format:** Current or approved unit-cost information for the recommended food, drinks, and swag categories.
- **Source:** Approved supply price records or CPVC AI Hackathon organizer

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Budget fit assessment
- **Contents and format:** A structured assessment showing the estimated cost, available budget, amount under or over budget, and a status of within budget or over budget.
- **Next task or recipient:** T7 Present Forecast Summary when within budget; T10 Present Lower-Cost Options when over budget.
- **Complete when:** Estimated costs have been compared with the available budget, the budget status is recorded, and no purchases or supply changes have been made.

## 4. Planned Tools

### Tool 1

- **Tool name:** `check_budget_fit`
- **Input:** Supply recommendations
- **Output:** Budget fit assessment
- **Implementation Route:** Functions/scripts and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Calculate the estimated cost of the recommended supplies and compare it with the available event budget.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary calculation or data-access error. Do not retry when prices, quantities, or the budget are missing or invalid.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the failed comparison and unresolved cost or budget information, then send the case to T8 Record Missing Data or Assumptions. Do not report the recommendations as within budget.
