# Match Ingredients to Pantry Task Specification

## Basic Information

- **Task ID:** T05
- **Task name:** Match Ingredients to Pantry
- **Task type:** Reason
- **Task owner:** Pedro Calvillo

## 1. Task Description

Compares each remaining recipe's ingredients, scaled to the number of servings, with the pantry. The workflow needs it to show what the student already has and what is missing. It uses fixed arithmetic and name matching with no judgment.

## 2. Inputs

### Input 1

- **Input name:** Filtered recipes
- **Contents and format:** Recipes that passed the hard filters.
- **Source:** T04: Filter Recipes by Constraints

### Input 2

- **Input name:** Validated meal request
- **Contents and format:** Pantry items with quantity, unit, and expiry date, and the number of servings.
- **Source:** T02: Validate Required Inputs

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Ingredient matches
- **Contents and format:** For each recipe and ingredient: quantity needed, quantity on hand, status (have, partial, or missing), essential or optional flag, and an expiry flag.
- **Next task or recipient:** T06: Estimate Missing Ingredient Cost
- **Complete when:** Every ingredient of every recipe has a status.

## 4. Planned Tools

### Tool 1

- **Tool name:** match_ingredients
- **Input:** Filtered recipes
- **Output:** Ingredient matches
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Scales each recipe to the servings and compares every ingredient with the pantry to set its status.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The calculation changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
