# Load Recipes and Prices Task Specification

## Basic Information

- **Task ID:** T03
- **Task name:** Load Recipes and Prices
- **Task type:** Retrieve
- **Task owner:** Pedro Calvillo

## 1. Task Description

Loads the local recipe library, price list, and substitution table that the rest of the workflow uses. The workflow needs it so every task works from the same data. A script reads the local files and makes no judgments.

## 2. Inputs

### Input 1

- **Input name:** Validated meal request
- **Contents and format:** Meal request record marked valid.
- **Source:** T02: Validate Required Inputs

### Input 2

- **Input name:** Local data files
- **Contents and format:** recipes.json (recipe name, ingredients with quantity, unit, and essential or optional flag, cook time, equipment, diet tags, allergen tags), prices.json (estimated price per ingredient and unit), and substitutions.json (known swaps with a note on the effect).
- **Source:** Project data folder

- **If a required input is missing or invalid:** If a data file is missing or cannot be read, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Recipe and price data
- **Contents and format:** The recipes, prices, and substitution table loaded and checked for required fields.
- **Next task or recipient:** T04: Filter Recipes by Constraints
- **Complete when:** Every file loaded and every recipe has the required fields.

## 4. Planned Tools

### Tool 1

- **Tool name:** load_recipes_and_prices
- **Input:** Local data files
- **Output:** Recipe and price data
- **Implementation Route:** file operations
- **Integration approach:** direct integration
- **Role in this task:** Reads the three local data files and checks that required fields are present.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on a file-read error. The files are only read, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
