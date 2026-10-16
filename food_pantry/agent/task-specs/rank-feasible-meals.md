# Rank Feasible Meals Task Specification

## Basic Information

- **Task ID:** T09
- **Task name:** Rank Feasible Meals
- **Task type:** Decide
- **Task owner:** Pedro Calvillo

## 1. Task Description

Ranks the feasible meals with a predefined weighted formula described in the README, so the best fit comes first. The formula weighs how few ingredients are missing, cost, time, liked cuisines, and use of items close to expiry. It is a fixed calculation with no judgment.

## 2. Inputs

### Input 1

- **Input name:** Feasible meals
- **Contents and format:** Meals that passed every check.
- **Source:** T08: Check Meal Feasibility

### Input 2

- **Input name:** Ranking formula
- **Contents and format:** The predefined weights and formula.
- **Source:** README.md in the project repository

### Input 3

- **Input name:** Validated meal request
- **Contents and format:** Liked cuisines, dislikes, and expiry dates used in scoring.
- **Source:** T02: Validate Required Inputs

- **If a required input is missing or invalid:** If the meals or the formula are missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Ranked meals
- **Contents and format:** Up to three top meals in order, with the score of each and the factors behind it.
- **Next task or recipient:** T10: Explain Recommendation
- **Complete when:** Every ranked meal has a unique rank and a score.

## 4. Planned Tools

### Tool 1

- **Tool name:** rank_meals
- **Input:** Feasible meals
- **Output:** Ranked meals
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies the predefined formula to each feasible meal and returns the top three in order.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The calculation changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
