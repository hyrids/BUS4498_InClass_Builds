# Ask Organizer for Planning Assumption or Updated Information Task Specification

## Basic Information

- **Task ID:** T9
- **Task name:** Ask Organizer for Planning Assumption or Updated Information
- **Task type:** Act
- **Task owner:** CPVC AI Hackathon organizer

## 1. Task Description

Review the recorded missing or conflicting information and provide the organizer with a clear request for the planning assumption or updated information needed to continue the forecast. The organizer decides what assumption or information is acceptable. A lack of response does not count as approval.

## 2. Inputs

### Input 1

- **Input name:** Missing data or assumptions record
- **Contents and format:** A structured record identifying the unresolved issue, available evidence, information needed, and any assumption requiring organizer approval.
- **Source:** T8 Record Missing Data or Assumptions

- **If a required input is missing or invalid:** Record that the request cannot be prepared and send the case to W1 Await Organizer Input or Updated Information.

## 3. Outputs

### Output 1

- **Output name:** Organizer planning response
- **Contents and format:** A human response containing either an approved planning assumption, updated information, or an indication that the organizer cannot provide the requested information.
- **Next task or recipient:** T1 Retrieve Event Planning Context when useful information is provided; W1 Await Organizer Input or Updated Information when no response is provided.
- **Complete when:** The request has been presented to the organizer and the organizer’s response or lack of response has been recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `request_organizer_planning_input`
- **Input:** Missing data or assumptions record
- **Output:** Organizer planning response
- **Implementation Route:** File operations and functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Present the unresolved issue to the organizer, collect the organizer’s response, and record whether an assumption or updated information was provided. The tool may not make the organizer’s decision.
- **Task timeout:** One business day after assignment
- **Maximum retries:** Not applicable — manual task.
- **Retry only when:** Not applicable — manual task.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that no organizer response was received by the deadline and send the case to W1 Await Organizer Input or Updated Information. A missed deadline is not approval.
