# Validate Required Inputs Task Specification

## Basic Information

- **Task ID:** T02
- **Task name:** Validate Required Inputs
- **Task type:** Verify
- **Task owner:** Pedro Calvillo

## 1. Task Description

Checks that the Meal request record has every required field in a valid form (for example, quantities are non-negative numbers, units come from the allowed list, time is greater than zero, budget is not negative, servings is at least one, and allergies are either listed or explicitly 'none'). The workflow needs it so later tasks never run on missing or invalid data. It uses fixed validation rules with no judgment.

## 2. Inputs

### Input 1

- **Input name:** Meal request record
- **Contents and format:** Record with pantry, preferences, allergies, equipment, time, budget, and servings.
- **Source:** T01: Enter Meal Request

- **If a required input is missing or invalid:** If the Meal request record is missing entirely, return the case to T01: Enter Meal Request with the message 'no input received'.

## 3. Outputs

### Output 1

- **Output name:** Validated meal request
- **Contents and format:** Meal request record marked valid.
- **Next task or recipient:** T03: Load Recipes and Prices
- **Complete when:** Every required field is present and passes its rule.

### Output 2

- **Output name:** Validation error list
- **Contents and format:** List of each missing or invalid field and the rule it failed.
- **Next task or recipient:** T01: Enter Meal Request
- **Complete when:** Each failing field is listed with its reason.

## 4. Planned Tools

### Tool 1

- **Tool name:** validate_meal_request
- **Input:** Meal request record
- **Output:** Validated meal request
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies fixed field rules to the record and returns the Validated meal request or a Validation error list.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The check changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record status 'validation error', pass no output downstream, and return the case to T01: Enter Meal Request so the student can resubmit.
