# Estimate Likely Attendance Task Specification

```yaml
# BASIC INFORMATION
task_id: "T4"
task_name: "Estimate Likely Attendance"
task_owner: "HackTrack attendance-planning agent"
```

## 1. Task Goal

* **Objective:** Produce a supported low, expected, and high attendance estimate for the next supply-planning task, including evidence, assumptions, limitations, and a low-confidence flag when appropriate.

## 2. Inbound Inputs

### Input 1

* **Input name:** Event planning context
* **What it contains:** Event details, capacity, planning requirements, and other context needed to interpret the attendance estimate.
* **Source:** T1 Retrieve Event Planning Context

### Input 2

* **Input name:** Attendance inputs
* **What it contains:** Current registration totals and optional attendance responses in aggregate form.
* **Source:** T2 Collect Attendance Inputs

### Input 3

* **Input name:** Anonymized attendance patterns
* **What it contains:** Aggregated historical registration, attendance, confirmation, and cancellation patterns.
* **Source:** T3 Review Anonymized Attendance Patterns

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

### Permitted Subtask 1

* **Subtask name:** Check input completeness
* **Subtask description:** Examine the supplied context, attendance inputs, and historical patterns to identify missing, conflicting, or unusable information.
* **Subtask boundary:** The agent may identify problems but may not guess missing values or change source records.
* **Retry limits:** Attempt this subtask no more than two times after updated information is provided.

### Permitted Subtask 2

* **Subtask name:** Compare attendance evidence
* **Subtask description:** Compare current registration totals and optional responses with relevant anonymized historical attendance patterns.
* **Subtask boundary:** Use only aggregate or anonymized information; do not identify, profile, or contact individual participants.
* **Retry limits:** Attempt this subtask no more than two times if additional valid evidence becomes available.

### Permitted Subtask 3

* **Subtask name:** Generate attendance range
* **Subtask description:** Produce a low, expected, and high attendance estimate using the available evidence and explain the assumptions supporting the range.
* **Subtask boundary:** The estimate must be presented as a planning forecast, not a guarantee, and may not directly approve purchases or make organizer decisions.
* **Retry limits:** Attempt this subtask no more than two times using valid inputs.

### Permitted Subtask 4

* **Subtask name:** Evaluate forecast uncertainty
* **Subtask description:** Check whether conflicting inputs, limited responses, unusual registration patterns, or weak historical evidence reduce the reliability of the forecast.
* **Subtask boundary:** The agent must report important limitations and may not hide or override a low-confidence finding.
* **Retry limits:** Attempt this subtask no more than one time after the forecast is generated.

**Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

* **Stop successfully when:** A low, expected, and high attendance range has been produced with supporting evidence, assumptions, limitations, and a clear confidence or low-confidence status.
* **Hand off early when:** Required information is missing, inputs conflict, historical evidence is insufficient, privacy boundaries are at risk, the retry limit is reached, or an organizer must provide an assumption or judgment.
* **Hand off to:** CPVC hackathon organizer

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

* **Status:** Completed or escalated to human.
* **Result or recommendation:** The low, expected, and high attendance estimate. If the task was escalated before reaching a supported result, write undetermined.
* **Evidence summary:** The most important aggregate registration, response, and historical evidence supporting the estimate.
* **Subtasks performed:** The permitted subtasks completed, including repeated attempts.
* **Unresolved issues:** Remaining missing information, conflicting evidence, or assumptions requiring organizer review. Write none only when the task has been completed successfully.
* **Handoff note:** Reason for stopping, unresolved questions, and what the organizer needs to decide; write “Not applicable” for a completed task.
* **Next task or recipient:** T5 Calculate Supply Recommendations. Unresolved cases go to the CPVC hackathon organizer.
