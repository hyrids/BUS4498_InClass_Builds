# About the Agentic System

**A Student Meal Decision Agent**
> **Problem to be solved**: A student who cooks for themselves has to decide what to eat using the ingredients they already have, their preferences and allergies, the time they have, and a limited food budget. Some ingredients are usually missing, and it is hard to tell whether a missing item can be replaced with something in the pantry, is worth buying, or makes a meal unrealistic. As a result, students order food they did not need, buy ingredients that go unused, or let food expire. They need a quick and reliable way to choose a feasible meal and to understand what they already have, what is missing, and how that affects the choice, while their allergy and diet rules are always respected.

### System Designer Name

Pedro Calvillo

### System Name

Meal Decider

### System Goal

Using the ingredients a student has, their preferences, available time, and budget, the agent will find meals they can feasibly make, show what they already have and what is missing, and explain how the gaps affect the choice. Every ingredient and figure the agent reports is backed by the student's pantry data or the local recipe and price files. The system aims to help the student decide what to eat quickly, and will produce a shopping list for any missing items.

### Who Is Better Off When This Works?

Students who cook for themselves on a limited budget are better off because they can quickly choose a meal they can actually make and see exactly what they have, what is missing, and what it will cost.

### Ranking Formula

Used by T09: Rank Feasible Meals. Each feasible meal gets a score from 0 to 100:

score = 35 x ingredient coverage + 25 x cost fit + 20 x time fit + 10 x preference match + 10 x expiry use

- **Ingredient coverage:** share of the recipe's ingredients already on hand (0 to 1).
- **Cost fit:** 1 minus the estimated cost of missing items divided by the budget (0 to 1).
- **Time fit:** 1 minus cook time divided by time available (0 to 1).
- **Preference match:** 1 if the meal matches a liked cuisine and contains no disliked ingredient, otherwise 0.
- **Expiry use:** 1 if the meal uses an item that expires within 3 days, otherwise 0.

The top three scores are returned in order. Ties go to the meal with fewer missing items. The weights are the team's proposal and can be adjusted.
