# Enter Meal Request Task Specification

## Basic Information

- **Task ID:** T01
- **Task name:** Enter Meal Request
- **Task type:** Sense
- **Task owner:** User (student)

## 1. Task Description

The student enters what they have and what they need: pantry items, preferences, time, and budget. The workflow needs it because every later task depends on these fields. No automated rule applies; the student's own judgment decides what to enter.

## 2. Inputs

### Input 1

- **Input name:** Meal request form
- **Contents and format:** Structured form with pantry items (name, quantity, unit, optional expiry date), diet rules, allergies (or an explicit 'none'), dislikes, equipment available (such as stove or microwave), time available in minutes, budget for missing ingredients, and number of servings.
- **Source:** User (student)

- **If a required input is missing or invalid:** The task stays open with the student until every required field is submitted. No downstream task starts.

## 3. Outputs

### Output 1

- **Output name:** Meal request record
- **Contents and format:** Record containing the submitted pantry, preferences, allergies, equipment, time, budget, and servings.
- **Next task or recipient:** T02: Validate Required Inputs
- **Complete when:** All required fields are submitted and saved.

## 4. Planned Tools

### Tool 1

- **Tool name:** collect_meal_request
- **Input:** Meal request form
- **Output:** Meal request record
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Presents the form to the student and saves the submitted fields as the Meal request record.
- **Task timeout:** One business day after assignment (human response deadline)
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable
- **On timeout, exhausted retries, or an error that cannot be retried:** If no response by the deadline, record status 'awaiting user', send a reminder, and start no downstream task.
