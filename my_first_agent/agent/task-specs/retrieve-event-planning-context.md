# Retrieve Event Planning Context Task Specification

## Basic Information

- **Task ID:** T1
- **Task name:** Retrieve Event Planning Context
- **Task type:** Retrieve
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Retrieve the event planning information needed for the attendance-forecast workflow, including the event date, available budget, supply categories, current registration count, and organizer-provided planning assumptions. The task produces a structured context record for the next workflow task.

## 2. Inputs

### Input 1

- **Input name:** Forecast request
- **Contents and format:** An organizer request indicating that an attendance forecast should be created or updated for the event.
- **Source:** CPVC AI Hackathon organizer

### Input 2

- **Input name:** Event planning records
- **Contents and format:** Structured event-planning records containing the event date, available budget, supply categories, registration information, and any recorded planning assumptions.
- **Source:** Event planning records

- **If a required input is missing or invalid:** Record which information is missing or invalid and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Event planning context
- **Contents and format:** A structured record containing the event date, available budget, supply categories, current registration count, and organizer-provided planning assumptions.
- **Next task or recipient:** T2 Collect Attendance Inputs
- **Complete when:** The available planning fields have been retrieved and organized, and any missing or invalid fields have been explicitly identified.

## 4. Planned Tools

### Tool 1

- **Tool name:** `retrieve_event_planning_context`
- **Input:** Event planning records
- **Output:** Event planning context
- **Implementation Route:** Database queries and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Retrieve the required event-planning fields and return them in the structured context record used by T2.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary retrieval error or source-availability problem. Do not retry if the records are missing required fields; route that case to T8.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the retrieval failure and unresolved fields, then send the case to T8 Record Missing Data or Assumptions.
