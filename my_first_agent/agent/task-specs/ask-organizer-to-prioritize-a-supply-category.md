# Ask Organizer to Prioritize a Supply Category Task Specification

## Basic Information

- **Task ID:** T11
- **Task name:** Ask Organizer to Prioritize a Supply Category
- **Task type:** Decide
- **Task owner:** CPVC AI Hackathon organizer

## 1. Task Description

Review the lower-cost supply options and choose which supply category or trade-off should receive priority when the recommendations exceed the available budget. The organizer makes the final judgment. The task does not automatically change quantities or purchase supplies.

## 2. Inputs

### Input 1

- **Input name:** Lower-cost supply options
- **Contents and format:** A structured comparison of lower-cost options, including estimated costs, affected categories, expected coverage, and trade-offs.
- **Source:** T10 Present Lower-Cost Options

- **If a required input is missing or invalid:** Record that the options cannot be reviewed and send the case to the CPVC AI Hackathon organizer for clarification.

## 3. Outputs

### Output 1

- **Output name:** Organizer supply priority
- **Contents and format:** A human response identifying the selected lower-cost option or prioritized supply category, along with any stated planning instruction.
- **Next task or recipient:** T5 Calculate Supply Recommendations when the organizer provides a choice; W2 Await Organizer Supply Decision when no choice is provided.
- **Complete when:** The organizer’s choice or lack of choice has been recorded. A missed deadline does not count as approval.

## 4. Planned Tools

### Tool 1

- **Tool name:** `request_supply_priority`
- **Input:** Lower-cost supply options
- **Output:** Organizer supply priority
- **Implementation Route:** File operations and functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Present the lower-cost alternatives to the organizer, collect the organizer’s priority decision, and record the response. The tool may not choose a priority for the organizer.
- **Task timeout:** One business day after assignment
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable — manual task.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that no organizer priority was received by the deadline and send the case to W2 Await Organizer Supply Decision. A missed deadline is not approval.
