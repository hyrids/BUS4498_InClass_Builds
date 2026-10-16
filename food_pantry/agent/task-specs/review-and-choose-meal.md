# Review and Choose Meal Task Specification

## Basic Information

- **Task ID:** T14
- **Task name:** Review and Choose Meal
- **Task type:** Decide
- **Task owner:** User (student)

## 1. Task Description

The student reads the verified recommendations and chooses one meal, or says none is acceptable. The workflow needs it because the choice of what to eat belongs to the student. No automated rule applies.

## 2. Inputs

### Input 1

- **Input name:** Verified recommendation
- **Contents and format:** The top meals with their explanations, after the facts check passed.
- **Source:** T11: Check Explanation Against Facts

- **If a required input is missing or invalid:** If the recommendation is missing or incomplete, the student returns the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Meal choice
- **Contents and format:** The chosen meal, or 'none acceptable', and whether the student will cook it now.
- **Next task or recipient:** T15: Build Shopping List (meal chosen); T13: Resolve Unfeasible or Uncertain Cases (none acceptable)
- **Complete when:** The choice is recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** record_meal_choice
- **Input:** Verified recommendation
- **Output:** Meal choice
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Shows the Verified recommendation to the student and saves the chosen meal and whether they will cook it now.
- **Task timeout:** One business day after assignment (human response deadline)
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable
- **On timeout, exhausted retries, or an error that cannot be retried:** If no response by the deadline, record status 'awaiting user', send a reminder, and take no further autonomous action.
