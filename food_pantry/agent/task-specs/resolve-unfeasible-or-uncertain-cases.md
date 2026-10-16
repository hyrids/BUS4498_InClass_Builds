# Resolve Unfeasible or Uncertain Cases Task Specification

## Basic Information

- **Task ID:** T13
- **Task name:** Resolve Unfeasible or Uncertain Cases
- **Task type:** Decide
- **Task owner:** User (student)

## 1. Task Description

The student decides what to do when no meal is feasible or the agent cannot resolve a case: change a constraint (for example, raise the budget or allow more time), or end the run with no meal. The workflow needs it because changing the student's own limits requires their approval. No automated rule applies.

## 2. Inputs

### Input 1

- **Input name:** Escalation package
- **Contents and format:** Description of the problem, the candidates and what stopped each, what was tried, and the options available.
- **Source:** T04: Filter Recipes by Constraints; T07: Resolve Missing Ingredients; T08: Check Meal Feasibility; T12: Handle Data and Tool Exceptions; T14: Review and Choose Meal; or T16: Update Pantry

- **If a required input is missing or invalid:** If the package is incomplete, the student asks the originating task's owner for the missing information and the case stays on hold.

## 3. Outputs

### Output 1

- **Output name:** User decision
- **Contents and format:** Either the changed constraint values or a decision to end with no meal, with notes.
- **Next task or recipient:** T04: Filter Recipes by Constraints (change constraints); end of workflow (no meal today)
- **Complete when:** The decision is recorded and visible to the next task.

## 4. Planned Tools

### Tool 1

- **Tool name:** record_user_decision
- **Input:** Escalation package
- **Output:** User decision
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Shows the Escalation package to the student and saves the chosen decision and any changed values.
- **Task timeout:** One business day after assignment (human response deadline)
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable
- **On timeout, exhausted retries, or an error that cannot be retried:** If no response by the deadline, record status 'awaiting user', send a reminder, and take no further autonomous action.
