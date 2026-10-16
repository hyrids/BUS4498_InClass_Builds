# Handle Data and Tool Exceptions Task Specification

## Basic Information

- **Task ID:** T12
- **Task name:** Handle Data and Tool Exceptions
- **Task type:** Decide
- **Task owner:** Pedro Calvillo

## 1. Task Description

Reviews failures and failed checks and decides whether the problem is small enough to recover from. The workflow needs it so failures lead to a defined next step instead of silently continuing. It applies a fixed rule: a failed explanation check with a small number of fixable mismatches (up to three) returns to T10, and every other failure goes to the student.

## 2. Inputs

### Input 1

- **Input name:** Exception report
- **Contents and format:** Task ID, the error or failed check, the attempts made, and the list of issues.
- **Source:** Any automated task that fails, including T03, T07, T10, and T11

- **If a required input is missing or invalid:** If the report is missing or unreadable, send the case to T13: Resolve Unfeasible or Uncertain Cases.

## 3. Outputs

### Output 1

- **Output name:** Exception decision
- **Contents and format:** Either 'recoverable' with the mismatches to fix, or 'too many issues' with the full issue list.
- **Next task or recipient:** T10: Explain Recommendation (recoverable); T13: Resolve Unfeasible or Uncertain Cases (too many issues)
- **Complete when:** A decision is recorded with the reason.

## 4. Planned Tools

### Tool 1

- **Tool name:** route_exception
- **Input:** Exception report
- **Output:** Exception decision
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies the fixed rule to the report and returns the decision.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** Only on an unexpected script error. The rule changes no records, so a retry cannot duplicate anything.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record status 'exception routing failed' and send the case to T13: Resolve Unfeasible or Uncertain Cases.
