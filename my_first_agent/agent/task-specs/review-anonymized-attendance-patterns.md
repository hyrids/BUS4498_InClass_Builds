# Review Anonymized Attendance Patterns Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Review Anonymized Attendance Patterns
- **Task type:** Reason
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Review aggregated and anonymized past-event registration and check-in information to identify attendance patterns that can support the forecast. The task produces observed attendance rates, comparable patterns, and limitations without identifying individual students.

## 2. Inputs

### Input 1

- **Input name:** Attendance inputs
- **Contents and format:** A structured record containing the current registration count and any available aggregate attendance-intent responses.
- **Source:** T2 Collect Attendance Inputs

### Input 2

- **Input name:** Anonymized attendance history
- **Contents and format:** Aggregated historical registration, attendance, confirmation, and cancellation patterns from past events.
- **Source:** Anonymized historical event records

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Attendance pattern findings
- **Contents and format:** A structured summary of relevant historical attendance rates, comparable patterns, evidence limitations, and any unusual or conflicting findings.
- **Next task or recipient:** T4 Estimate Likely Attendance
- **Complete when:** The available relevant patterns have been reviewed, findings and limitations have been recorded, and no individual participant information has been identified or exposed.

## 4. Planned Tools

### Tool 1

- **Tool name:** `review_anonymized_attendance_patterns`
- **Input:** Anonymized attendance history
- **Output:** Attendance pattern findings
- **Implementation Route:** Database queries and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Compare aggregated historical registration and attendance patterns and return findings that can support the attendance estimate.
- **Task timeout:** 10 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary read or source-availability error. Do not retry when the data is missing, invalid, identifiable, or insufficient for comparison.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the review failure and unresolved evidence issue, then send the case to T8 Record Missing Data or Assumptions.
