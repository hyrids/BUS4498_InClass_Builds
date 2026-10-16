# Build Shopping List Task Specification

## Basic Information

- **Task ID:** T15
- **Task name:** Build Shopping List
- **Task type:** Act
- **Task owner:** Pedro Calvillo

## 1. Task Description

Creates the shopping list for the chosen meal: each missing item, its quantity, and its estimated cost. The workflow needs it so the student knows exactly what to buy. A script builds the list from existing data and makes no judgments.

## 2. Inputs

### Input 1

- **Input name:** Meal choice
- **Contents and format:** The chosen meal.
- **Source:** T14: Review and Choose Meal

### Input 2

- **Input name:** Cost estimates
- **Contents and format:** Missing items and their estimated costs for the chosen meal.
- **Source:** T06: Estimate Missing Ingredient Cost

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Shopping list
- **Contents and format:** Each missing item with quantity and estimated cost, the estimated total, and a note that prices are estimates. An empty list if nothing is missing.
- **Next task or recipient:** User (shown to the student and saved in the project output folder); T16: Update Pantry
- **Complete when:** The list is saved and its total equals the sum of its items.

## 4. Planned Tools

### Tool 1

- **Tool name:** build_shopping_list
- **Input:** Meal choice
- **Output:** Shopping list
- **Implementation Route:** file operations
- **Integration approach:** direct integration
- **Role in this task:** Builds the list from the chosen meal's missing items and writes it to a file named with the run ID, so a repeat overwrites rather than duplicates.
- **Task timeout:** 30 seconds
- **Maximum retries:** 2
- **Retry only when:** Only on a file-write error, waiting 5 seconds between attempts. The file name uses the run ID, so a retry replaces the same file.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
