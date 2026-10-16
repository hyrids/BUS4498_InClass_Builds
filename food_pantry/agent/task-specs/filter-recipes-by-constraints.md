# Filter Recipes by Constraints Task Specification

## Basic Information

- **Task ID:** T04
- **Task name:** Filter Recipes by Constraints
- **Task type:** Decide
- **Task owner:** Pedro Calvillo

## 1. Task Description

Removes every recipe that breaks a hard rule: allergens, diet rules, missing equipment, or cook time above the time available. The workflow needs it so no unsafe or impossible meal is ever considered. It uses fixed rules, and allergies and diet rules are never traded off.

## 2. Inputs

### Input 1

- **Input name:** Validated meal request
- **Contents and format:** Allergies, diet rules, dislikes, equipment, and time available.
- **Source:** T02: Validate Required Inputs

### Input 2

- **Input name:** Recipe and price data
- **Contents and format:** All recipes with their tags, equipment, and cook times.
- **Source:** T03: Load Recipes and Prices

- **If a required input is missing or invalid:** If either input is missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Filtered recipes
- **Contents and format:** The recipes that pass every hard filter, with the reason each removed recipe was dropped.
- **Next task or recipient:** T05: Match Ingredients to Pantry
- **Complete when:** Every kept recipe passes all hard filters and every removed recipe has a recorded reason.

### Output 2

- **Output name:** No-match notice
- **Contents and format:** Statement of which filters removed every recipe.
- **Next task or recipient:** T13: Resolve Unfeasible or Uncertain Cases
- **Complete when:** Sent only when no recipe remains, and names the filters responsible.

## 4. Planned Tools

### Tool 1

- **Tool name:** filter_recipes
- **Input:** Validated meal request
- **Output:** Filtered recipes
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies the allergy, diet, equipment, and time rules to every recipe and returns the ones that pass.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The filter changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
