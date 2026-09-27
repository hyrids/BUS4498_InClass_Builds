# Present Lower-Cost Options Task Specification

## Basic Information

- **Task ID:** T10
- **Task name:** Present Lower-Cost Options
- **Task type:** Reason
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Identify and present lower-cost supply alternatives when the recommended food, drinks, or swag exceed the available event budget. Compare the alternatives using cost, expected attendance coverage, supply categories, and planning requirements. The task presents options but does not choose one or purchase supplies.

## 2. Inputs

### Input 1

- **Input name:** Budget fit assessment
- **Contents and format:** A structured assessment showing the estimated supply cost, available budget, amount over budget, and affected supply categories.
- **Source:** T6 Check Budget Fit

### Input 2

- **Input name:** Supply recommendations
- **Contents and format:** A structured table containing the recommended quantities and estimated costs for food, drinks, and swag.
- **Source:** T5 Calculate Supply Recommendations

### Input 3

- **Input name:** Available supply alternatives
- **Contents and format:** Structured alternative quantities, prices, or category adjustments that could reduce total cost while showing the effect on event coverage.
- **Source:** Approved supply price records or CPVC AI Hackathon organizer

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Lower-cost supply options
- **Contents and format:** A structured comparison of feasible lower-cost options, including estimated cost, affected supply categories, expected coverage, trade-offs, and unresolved assumptions.
- **Next task or recipient:** T11 Ask Organizer to Prioritize a Supply Category
- **Complete when:** At least one supported lower-cost option or the reason no option could be identified has been presented, and no supply purchase or category change has been made.

## 4. Planned Tools

### Tool 1

- **Tool name:** `present_lower_cost_options`
- **Input:** Budget fit assessment
- **Output:** Lower-cost supply options
- **Implementation Route:** Functions/scripts, database queries, and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Compare available supply alternatives with the over-budget recommendations and present the cost and coverage trade-offs for organizer review.
- **Task timeout:** 10 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary calculation, data-access, or display error. Do not retry when the necessary prices, quantities, or budget information is missing or invalid.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that lower-cost options could not be prepared and send the case to the CPVC AI Hackathon organizer for review. Do not continue as if an option had been presented.
