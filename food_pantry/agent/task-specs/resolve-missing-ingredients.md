# Resolve Missing Ingredients Task Specification

```yaml
# BASIC INFORMATION
task_id: "T07"
task_name: "Resolve Missing Ingredients"
task_owner: "Pedro Calvillo"

# Agent Inference Configuration
Provider: Groq
Model: "openai/gpt-oss-120b"
Role: Chooses the next permitted subtask after each finding; performs the subtask Suggest ingredient substitution; writes the final resolution record
Maximum inference requests per task run: 10
On inference failure or exhausted limits: Record the unresolved status and hand the case to the student through T13 (Resolve Unfeasible or Uncertain Cases).
```

## 1. Task Goal

- **Objective:** Find at least one meal the student can actually make by resolving missing ingredients through pantry equivalents, substitutions, a wider search, or a tested budget margin, so the student gets a feasible meal and a clear record of how each gap was handled.

## 2. Inbound Inputs

### Input 1

- **Input name:** Ingredient matches
- **What it contains:** For each recipe and ingredient: quantity needed, quantity on hand, status (have, partial, or missing), essential or optional flag, and expiry flag.
- **Source:** T05: Match Ingredients to Pantry

### Input 2

- **Input name:** Cost estimates
- **What it contains:** For each recipe: estimated cost of each missing or partial ingredient, the total, and flags on unpriced items.
- **Source:** T06: Estimate Missing Ingredient Cost

### Input 3

- **Input name:** Validated meal request
- **What it contains:** Pantry, allergies, diet rules, equipment, time, budget, and servings.
- **Source:** T02: Validate Required Inputs

### Input 4

- **Input name:** Recipe and price data
- **What it contains:** All recipes, the price list, and the substitution table.
- **Source:** T03: Load Recipes and Prices

## 3. Tool Permissions and Boundaries

### Task-Wide Limits

- **Total task timeout:** 3 minutes
- **Maximum tool calls:** 8

### Tool 1

- **Tool name:** find_pantry_equivalents
- **Tool type:** Python script
- **Supports these permitted subtasks:** Check pantry equivalents
- **Allowed use:** Read the Ingredient matches, the pantry, and the substitution table, and return pantry items that can stand in for a missing ingredient with the table's stated effect.
- **Prohibited use:** Changing the pantry, the recipe library, or the student's constraints, or relaxing any allergy, diet, equipment, or time rule. Inventing an equivalent that is not in the table.
- **Approval required:** None within the allowed use.
- **Timeout per call:** 30 seconds
- **Maximum retries per call:** 1
- **Retry conditions and failure response:** Only on an unexpected script error. The call is read-only on the user's data, so a retry cannot duplicate anything. If the retry fails, record the failure and choose another permitted subtask or hand off to T13.

### Tool 2

- **Tool name:** suggest_substitution
- **Tool type:** Language-model call
- **Supports these permitted subtasks:** Suggest ingredient substitution
- **Allowed use:** Propose a swap for a missing essential ingredient using only items in the pantry or in the substitution table, and state its likely effect on taste, texture, and time as an estimate.
- **Prohibited use:** Naming an ingredient that is not in the pantry or table, saying a swap is safe for an allergen or diet rule, or changing a recipe's essential ingredient list.
- **Approval required:** None within the allowed use.
- **Timeout per call:** 60 seconds
- **Maximum retries per call:** 1
- **Retry conditions and failure response:** Retry once on a timeout or a suggestion that names an ingredient outside the pantry and table. If the retry fails, record the failure and choose another permitted subtask or hand off to T13.

### Tool 3

- **Tool name:** widen_recipe_search
- **Tool type:** Python script
- **Supports these permitted subtasks:** Widen recipe search
- **Allowed use:** Add recipes beyond the current candidates that still pass every hard filter, and return their ingredient matches and cost estimates.
- **Prohibited use:** Changing the pantry, the recipe library, or the student's constraints, or relaxing any allergy, diet, equipment, or time rule.
- **Approval required:** None within the allowed use.
- **Timeout per call:** 30 seconds
- **Maximum retries per call:** 1
- **Retry conditions and failure response:** Only on an unexpected script error. The call is read-only on the user's data, so a retry cannot duplicate anything. If the retry fails, record the failure and choose another permitted subtask or hand off to T13.

### Tool 4

- **Tool name:** test_relaxed_budget
- **Tool type:** Python script
- **Supports these permitted subtasks:** Test relaxed budget
- **Allowed use:** Recalculate, on a copy, which candidates would be feasible if the budget were raised by a small margin (up to $2 by default), and return the extra cost for each.
- **Prohibited use:** Changing the student's real budget. Changing the pantry, the recipe library, or the student's constraints, or relaxing any allergy, diet, equipment, or time rule.
- **Approval required:** Any actual increase of the student's budget requires the student's approval through T13.
- **Timeout per call:** 30 seconds
- **Maximum retries per call:** 1
- **Retry conditions and failure response:** Only on an unexpected script error. The call is read-only on the user's data, so a retry cannot duplicate anything. If the retry fails, record the failure and choose another permitted subtask or hand off to T13.

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Check pantry equivalents
- **Subtask description:** Examines each missing essential ingredient against the pantry and the substitution table and produces a list of pantry items that could stand in for it, with the stated effect.
- **Subtask boundary:** Read-only. Only equivalents listed in the substitution table.
- **Retry limits:** 1

### Permitted Subtask 2

- **Subtask name:** Suggest ingredient substitution
- **Subtask description:** For a missing essential ingredient with no table equivalent, produces a proposed swap from the pantry and its estimated effect on the dish.
- **Subtask boundary:** Only items already in the pantry or table. May not declare a swap safe for an allergy or diet rule. The effect is stated as an estimate.
- **Retry limits:** 1

### Permitted Subtask 3

- **Subtask name:** Widen recipe search
- **Subtask description:** When the current candidates cannot be resolved, produces additional candidate recipes with their ingredient matches and costs.
- **Subtask boundary:** Every added recipe must still pass all hard filters. No hard rule may be relaxed.
- **Retry limits:** 1

### Permitted Subtask 4

- **Subtask name:** Test relaxed budget
- **Subtask description:** Produces which candidates would become feasible with a small budget margin and what each would cost.
- **Subtask boundary:** Works on a copy only. May not change the student's real budget. Any actual increase requires the student's approval through T13.
- **Retry limits:** 1

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** At least one candidate has every essential ingredient on hand, covered by a recorded substitution, or purchasable within the student's budget, and every resolution is recorded with its effect on the meal.
- **Hand off early when:** No candidate can be resolved within the limits, a tool fails after its retries, or a resolution would require relaxing the student's real budget, time, allergy, or diet rules.
- **Hand off to:** T13: Resolve Unfeasible or Uncertain Cases

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Completed or escalated to human.
- **Result or recommendation:** The resolved candidate meals, each with a record of how every missing ingredient was handled (on hand, substituted, or purchased with estimated cost) and the effect of each substitution. If escalated before reaching a supported result, write undetermined.
- **Evidence summary:** The pantry items, table entries, and cost figures behind each resolution, or why no candidate could be resolved.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Missing essential ingredients with no resolution, and any resolution whose effect is only an estimate. Write none only if every gap is resolved with a known effect.
- **Handoff note:** Reason for stopping, unresolved gaps, and what the student needs to decide. Not applicable for a completed task.
- **Next task or recipient:** T08: Check Meal Feasibility
