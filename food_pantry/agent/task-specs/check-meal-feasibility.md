# Check Meal Feasibility Task Specification

## Basic Information

- **Task ID:** T08
- **Task name:** Check Meal Feasibility
- **Task type:** Verify
- **Task owner:** Pedro Calvillo

## 1. Task Description

Checks each candidate meal against every hard rule after the gaps have been resolved: no allergens, diet rules met, every essential ingredient covered, cost within budget, time within the limit, and no expired item used. The workflow needs it so only truly feasible meals are ranked. It uses fixed checks.

## 2. Inputs

### Input 1

- **Input name:** Resolved candidates
- **Contents and format:** Candidate meals with, for each missing ingredient, how it was resolved (on hand, substituted, or purchased) and the estimated cost.
- **Source:** T07: Resolve Missing Ingredients

### Input 2

- **Input name:** Validated meal request
- **Contents and format:** Allergies, diet rules, time, budget, and expiry dates.
- **Source:** T02: Validate Required Inputs

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Feasible meals
- **Contents and format:** The candidates that pass every check, with the result of each check.
- **Next task or recipient:** T09: Rank Feasible Meals
- **Complete when:** Every listed meal passes every check.

### Output 2

- **Output name:** Infeasibility report
- **Contents and format:** Each candidate with the check it failed.
- **Next task or recipient:** T13: Resolve Unfeasible or Uncertain Cases
- **Complete when:** Sent only when no candidate passes, and lists the failed check for every candidate.

## 4. Planned Tools

### Tool 1

- **Tool name:** check_meal_feasibility
- **Input:** Resolved candidates
- **Output:** Feasible meals
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Runs the allergy, diet, ingredient, cost, time, and expiry checks on each candidate.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The checks are read-only, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
