# Collect Attendance Inputs Task Specification

## Basic Information

- **Task ID:** T2
- **Task name:** Collect Attendance Inputs
- **Task type:** Sense
- **Task owner:** HackTrack attendance-planning agent

## 1. Task Description

Collect the current registration information and any available optional attendance-intent responses needed for the forecast. Organize the information in aggregate form and check that individual participant information is not exposed.

## 2. Inputs

### Input 1

- **Input name:** Event planning context
- **Contents and format:** A structured record containing event information and the registration source needed to collect attendance inputs.
- **Source:** T1 Retrieve Event Planning Context

### Input 2

- **Input name:** Registration and attendance-intent records
- **Contents and format:** Current registration totals and optional attendance-intent responses in aggregate or anonymized form.
- **Source:** Registration records or CPVC AI Hackathon organizer

- **If a required input is missing or invalid:** Record the missing or invalid information and send the case to T8 Record Missing Data or Assumptions.

## 3. Outputs

### Output 1

- **Output name:** Attendance inputs
- **Contents and format:** A structured record containing the current registration count, available aggregate attendance-intent responses, and data-quality notes.
- **Next task or recipient:** T3 Review Anonymized Attendance Patterns
- **Complete when:** The current registration count has been collected, optional responses are marked as available or unavailable, and no individual participant information is exposed.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_attendance_inputs`
- **Input:** Registration and attendance-intent records
- **Output:** Attendance inputs
- **Implementation Route:** Database queries and file operations
- **Integration approach:** Direct integration
- **Role in this task:** Collect current registration totals and optional attendance-intent responses, then organize them as aggregate or anonymized inputs for T3.
- **Task timeout:** 5 minutes
- **Maximum retries:** 1
- **Retry only when:** Retry once after a temporary source-availability or read error. Do not retry when the source contains missing, invalid, or identifiable data.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the collection failure and unresolved data issue, then send the case to T8 Record Missing Data or Assumptions.
