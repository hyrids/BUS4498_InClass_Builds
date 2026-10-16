# Estimate Missing Ingredient Cost Task Specification

## Basic Information

- **Task ID:** T06
- **Task name:** Estimate Missing Ingredient Cost
- **Task type:** Reason
- **Task owner:** Pedro Calvillo

## 1. Task Description

Estimates what the missing and partial ingredients of each recipe would cost, using the local price list. The workflow needs it so the student can see how the gaps affect their budget. It uses fixed arithmetic, and the prices are estimates.

## 2. Inputs

### Input 1

- **Input name:** Ingredient matches
- **Contents and format:** Per-recipe ingredient statuses with quantities.
- **Source:** T05: Match Ingredients to Pantry

### Input 2

- **Input name:** Recipe and price data
- **Contents and format:** Estimated price per ingredient and unit.
- **Source:** T03: Load Recipes and Prices

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Cost estimates
- **Contents and format:** For each recipe: the estimated cost of each missing or partial ingredient, the total, and a flag on any ingredient with no listed price. All prices labeled as estimates.
- **Next task or recipient:** T07: Resolve Missing Ingredients
- **Complete when:** Every recipe has a total and every unpriced ingredient is flagged.

## 4. Planned Tools

### Tool 1

- **Tool name:** estimate_missing_cost
- **Input:** Ingredient matches
- **Output:** Cost estimates
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Multiplies the missing quantities by the listed prices and totals them for each recipe.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The calculation changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
