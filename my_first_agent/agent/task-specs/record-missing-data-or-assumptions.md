# Record Missing Data or Assumptions Task Specification

## Basic Information

- **Task ID:** T8
- **Task name:** Record Missing Data or Assumptions
- **Task type:** Remember
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Record missing, conflicting, limited, or unusable information discovered during the attendance-forecast workflow. The task documents the issue and any assumption that the organizer must provide. It may describe the problem but may not invent missing values or silently resolve conflicts.

## 2. Inputs

### Input 1

- **Input name:** Data quality finding
- **Contents and format:** A structured note identifying missing, conflicting, limited, or unusable event, registration, attendance, or historical-pattern information.
- **Source:** T3 Review Anonymized Attendance Patterns or another preceding workflow task

### Input 2

- **Input name:** Available planning context
- **Contents and format:** The available event context, attendance inputs, and evidence relevant to explaining the missing or conflicting information.
- **Source:** T1 Retrieve Event Planning Context, T2 Collect Attendance Inputs, or T3 Review Anonymized Attendance Patterns

- **If a required input is missing or invalid:** Record that the issue cannot be documented completely and send the case to T9 Ask Organizer for Planning Assumption or Updated Information.

## 3. Outputs

### Output 1

- **Output name:** Missing data or assumptions record
- **Contents and format:** A structured record identifying the unresolved issue, affected workflow decision, available evidence, information needed, and any assumption requiring organizer approval.
- **Next task or recipient:** T9 Ask Organizer for Planning Assumption or Updated Information
- **Complete when:** The unresolved issue and required organizer input have been recorded without guessing or changing source records.

## 4. Planned Tools

### Tool 1

- **Tool name:** `record_missing_data_or_assumptions`
- **Input:** Data quality finding
- **Output:** Missing data or assumptions record
- **Implementation Route:** File operations and database queries
- **Integration approach:** Direct integration
- **Role in this task:** Store a traceable record of the missing or conflicting information and identify the assumption or updated data needed from the organizer.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary storage failure. Use the same workflow run identifier to prevent duplicate records. If the outcome of the first write is uncertain, do not retry automatically.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record that the issue could not be stored and send the case to T9 with the unresolved issue details. Do not continue as if the record was successfully saved.
