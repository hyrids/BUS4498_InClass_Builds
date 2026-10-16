# Update Pantry Task Specification

## Basic Information

- **Task ID:** T16
- **Task name:** Update Pantry
- **Task type:** Remember
- **Task owner:** Pedro Calvillo

## 1. Task Description

After the student confirms they cooked the meal, subtracts the ingredients used from the pantry file so the next request starts from accurate data. The workflow needs it so the pantry stays correct. A script performs the update only on the student's confirmation. If they did not cook, the pantry stays unchanged.

## 2. Inputs

### Input 1

- **Input name:** Meal choice
- **Contents and format:** The chosen meal and the student's confirmation of whether they cooked it.
- **Source:** T14: Review and Choose Meal

### Input 2

- **Input name:** Ingredient matches
- **Contents and format:** The quantities used for the chosen meal.
- **Source:** T05: Match Ingredients to Pantry

- **If a required input is missing or invalid:** If either input is missing, make no change to the pantry and send the case to T13: Resolve Unfeasible or Uncertain Cases.

## 3. Outputs

### Output 1

- **Output name:** Updated pantry
- **Contents and format:** The pantry file with the used quantities subtracted, or unchanged if the meal was not cooked, plus a backup of the previous version.
- **Next task or recipient:** User (saved as the pantry file in the project data folder)
- **Complete when:** The pantry file reflects the confirmed use and the backup exists.

## 4. Planned Tools

### Tool 1

- **Tool name:** update_pantry
- **Input:** Meal choice
- **Output:** Updated pantry
- **Implementation Route:** file operations
- **Integration approach:** direct integration
- **Role in this task:** Copies the current pantry to a backup, subtracts the used quantities, and records the run ID so the same meal is never subtracted twice.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only when the write fails before any change was made. The run ID record prevents subtracting twice. If it is unclear whether the update was applied, do not retry.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'pantry update uncertain or failed', restore the backup if a partial change exists, and send the case to T13: Resolve Unfeasible or Uncertain Cases so the student can check the pantry.
