# Estimate Likely Attendance Task Specification

```yaml
# BASIC INFORMATION
task_id: "T4"
task_name: "Estimate Likely Attendance"
task_owner: "HackTrack attendance-planning agent"
# Agent Inference Configuration
Provider: Groq
Model: "openai/gpt-oss-120b"
Role: Compare attendance evidence, generate attendance ranges, and evaluate forecast uncertainty
Maximum inference requests per task run: 6
On inference failure or exhausted limits: Record the unresolved status and hand the case to the CPVC hackathon organizer.
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
### Task-Wide Limits

- **Total task timeout:** 5 minutes per task run, including inference requests, tool calls, retries, and waiting.
- **Maximum tool calls:** 6 total tool calls across all tools; retries count toward this limit.

### Tool 1

- **Tool name:** `check_input_completeness`
- **Input:** Event planning context; Attendance inputs; Anonymized attendance patterns
- **Output:** Unresolved issues
- **Implementation Route:** functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Supports the Check input completeness subtask.
- **Task timeout:** 5 minutes total for the task run; this tool may use up to 1 minute per call.
- **Maximum retries:** 1
- **Retry only when:** A corrected input is provided or a temporary tool error occurs. Do not retry unchanged missing or invalid information.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unresolved status and hand the case to the CPVC hackathon organizer. Do not continue as if the inputs were complete.

### Tool 2

- **Tool name:** `compare_attendance_evidence`
- **Input:** Attendance inputs; Anonymized attendance patterns
- **Output:** Evidence summary
- **Implementation Route:** functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Supports the Compare attendance evidence subtask.
- **Task timeout:** 5 minutes total for the task run; this tool may use up to 1 minute per call.
- **Maximum retries:** 1
- **Retry only when:** Additional valid aggregate evidence is provided or a temporary tool error occurs.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the evidence as incomplete and hand the case to the CPVC hackathon organizer.

### Tool 3

- **Tool name:** `generate_attendance_range`
- **Input:** Event planning context; Attendance inputs; Anonymized attendance patterns
- **Output:** Result or recommendation
- **Implementation Route:** functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Supports the Generate attendance range subtask.
- **Task timeout:** 5 minutes total for the task run; this tool may use up to 1 minute per call.
- **Maximum retries:** 0
- **Retry only when:** Not applicable.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the result as undetermined and hand the case to the CPVC hackathon organizer. Do not present an unsupported estimate.

### Tool 4

- **Tool name:** `evaluate_forecast_uncertainty`
- **Input:** Event planning context; Attendance inputs; Anonymized attendance patterns
- **Output:** Evidence summary
- **Implementation Route:** functions/scripts
- **Integration approach:** Direct integration
- **Role in this task:** Supports the Evaluate forecast uncertainty subtask.
- **Task timeout:** 5 minutes total for the task run; this tool may use up to 1 minute per call.
- **Maximum retries:** 0
- **Retry only when:** Not applicable.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the unresolved uncertainty and hand the case to the CPVC hackathon organizer. Do not hide limitations or continue as if the forecast were reliable.

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
