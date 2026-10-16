# Check Explanation Against Facts Task Specification

## Basic Information

- **Task ID:** T11
- **Task name:** Check Explanation Against Facts
- **Task type:** Verify
- **Task owner:** Pedro Calvillo

## 1. Task Description

Verifies that the explanation says nothing the data does not support: every ingredient described as on hand is in the pantry, every quantity, cost, and time matches the computed values, and no allergen is described as safe. The workflow needs it so a written explanation can never contradict the facts. It uses fixed checks.

## 2. Inputs

### Input 1

- **Input name:** Recommendation explanation
- **Contents and format:** The written explanation of each top meal.
- **Source:** T10: Explain Recommendation

### Input 2

- **Input name:** Ranked meals
- **Contents and format:** The computed facts the explanation must match.
- **Source:** T09: Rank Feasible Meals

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Check result
- **Contents and format:** Pass or fail, with each statement that does not match the facts.
- **Next task or recipient:** T14: Review and Choose Meal (pass); T12: Handle Data and Tool Exceptions (fail)
- **Complete when:** A pass or fail status is recorded with every mismatch listed.

## 4. Planned Tools

### Tool 1

- **Tool name:** check_explanation_facts
- **Input:** Recommendation explanation
- **Output:** Check result
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Compares every ingredient, quantity, cost, and time in the text with the computed values and the pantry.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The checks are read-only, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'check failed' with the error and send the case to T12: Handle Data and Tool Exceptions.
