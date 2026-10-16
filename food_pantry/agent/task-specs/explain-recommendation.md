# Explain Recommendation Task Specification

## Basic Information

- **Task ID:** T10
- **Task name:** Explain Recommendation
- **Task type:** Reason
- **Task owner:** Pedro Calvillo

## 1. Task Description

Writes a plain explanation of each top meal: what the student already has, what is missing, what the missing items cost, which substitutions were made and how they change the dish, and how long it takes. The workflow needs it so the student understands how the gaps affect the choice. A language model writes the text using only the computed facts it is given.

## 2. Inputs

### Input 1

- **Input name:** Ranked meals
- **Contents and format:** Top meals with their ingredient matches, cost estimates, resolutions, and scores.
- **Source:** T09: Rank Feasible Meals

- **If a required input is missing or invalid:** If the Ranked meals are missing, stop and send the case to T12: Handle Data and Tool Exceptions.

## 3. Outputs

### Output 1

- **Output name:** Recommendation explanation
- **Contents and format:** For each meal: ingredients on hand, ingredients missing, estimated cost of the missing items, substitutions with their effect, and time needed, in plain language.
- **Next task or recipient:** T11: Check Explanation Against Facts
- **Complete when:** Every top meal has all five parts and every figure matches the input data.

## 4. Planned Tools

### Tool 1

- **Tool name:** explain_recommendation
- **Input:** Ranked meals
- **Output:** Recommendation explanation
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Uses a language-model call that is given the computed facts and told to name only ingredients and figures from them.
- **Task timeout:** 2 minutes
- **Maximum retries:** 2
- **Retry only when:** Only on a timeout or output missing one of the five parts. The explanation is only drafted and shown after it passes the check, so retries cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the status 'failed' with the error and the attempts made, pass no output downstream, and send the case to T12: Handle Data and Tool Exceptions.
