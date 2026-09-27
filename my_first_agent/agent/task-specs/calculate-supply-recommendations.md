# Calculate Supply Recommendations Task Specification

## Basic Information

- **Task ID:** T5
- **Task name:** Calculate Supply Recommendations
- **Task type:** Decide
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Convert the estimated low, expected, and high attendance range into recommended quantities of food, drinks, and event swag. Apply the approved supply-planning rules and produce category-level recommendations for the budget review.

## 2. Inputs

### Input 1

- **Input name:** Attendance forecast
- **Contents and format:** A structured record containing low, expected, and high attendance estimates, supporting evidence, assumptions, limitations, and confidence status.
- **Source:** T4 Estimate Likely Attendance

### Input 2

- **Input name:** Event planning context
- **Contents and format:** A structured record containing the event date, supply categories, available budget, and relevant planning requirements.
- **Source:** T1 Retrieve Event Planning Context

### Input 3

- **Input name:** Supply planning rules
- **Contents and format:** Documented rules for converting attendance estimates into food, drink, and swag quantities, including any category-specific requirements.
- **Source:** CPVC AI Hackathon organizer or approved planning policy

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Supply recommendations
- **Contents and format:** A structured table showing low, expected, and high recommended quantities for food, drinks, and swag, including the rule or assumption used for each category.
- **Next task or recipient:** T6 Check Budget Fit
- **Complete when:** Recommendations have been calculated for each required supply category, the applicable rules and assumptions are recorded, and no purchase has been made.

## 4. Planned Tools

### Tool 1

- **Tool name:** `calculate_supply_recommendations`
- **Input:** Attendance forecast
- **Output:** Supply recommendations
- **Implementation Route:** Functions/scripts and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Apply the approved supply-planning rules to the low, expected, and high attendance estimates and return recommended quantities for each supply category.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary calculation or source-availability error. Do not retry when required estimates or planning rules are missing or invalid.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the calculation failure and unresolved information, then send the case to T8 Record Missing Data or Assumptions. Do not treat incomplete recommendations as successful.
