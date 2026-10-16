// Meal Decider — Core engine
// Implements: filter → match → estimate cost → resolve substitutions → check feasibility → rank → explain

const Engine = (() => {

  // --- T04: Filter Recipes by Constraints ---
  // Removes recipes that break hard rules: allergens, diet, equipment, time.
  function filterRecipes(recipes, request) {
    const { allergies, dietRules, equipment, timeAvail, dislikes } = request;
    const allergySet = new Set(allergies.map(a => a.toLowerCase().trim()));
    const dietSet = new Set(dietRules);
    const equipSet = new Set(equipment);
    const dislikeSet = new Set(dislikes.map(d => d.toLowerCase().trim()));

    const kept = [];
    const removed = [];

    for (const recipe of recipes) {
      const reasons = [];

      // Allergy check (hard rule — never relaxed)
      for (const allergen of recipe.allergenTags) {
        if (allergySet.has(allergen.toLowerCase())) {
          reasons.push(`contains allergen: ${allergen}`);
        }
      }

      // Diet check (hard rule — never relaxed)
      for (const diet of dietSet) {
        if (diet === "vegan") {
          if (!recipe.dietTags.includes("vegan")) reasons.push(`not vegan`);
        } else if (diet === "vegetarian") {
          if (!recipe.dietTags.includes("vegetarian") && !recipe.dietTags.includes("vegan")) {
            reasons.push(`not vegetarian`);
          }
        } else if (diet === "gluten-free") {
          if (!recipe.dietTags.includes("gluten-free")) reasons.push(`not gluten-free`);
        } else if (diet === "dairy-free") {
          if (!recipe.dietTags.includes("dairy-free") && !recipe.dietTags.includes("vegan")) {
            reasons.push(`not dairy-free`);
          }
        }
      }

      // Equipment check (hard rule)
      const needsNoCook = equipSet.has("no-cook") && equipSet.size === 1;
      if (needsNoCook) {
        if (!recipe.equipment.includes("no-cook")) {
          reasons.push(`requires cooking (no-cook only selected)`);
        }
      } else {
        const hasEquipment = recipe.equipment.some(e => equipSet.has(e));
        if (!hasEquipment && !recipe.equipment.includes("no-cook")) {
          reasons.push(`requires equipment you don't have: ${recipe.equipment.join(", ")}`);
        }
      }

      // Time check (hard rule)
      if (recipe.cookTime > timeAvail) {
        reasons.push(`takes ${recipe.cookTime} min, you have ${timeAvail} min`);
      }

      // Dislike check (hard rule for essential ingredients)
      for (const ing of recipe.ingredients) {
        if (dislikeSet.has(ing.name.toLowerCase()) && ing.essential) {
          reasons.push(`contains disliked ingredient: ${ing.name}`);
        }
      }

      if (reasons.length > 0) {
        removed.push({ recipe, reasons });
      } else {
        kept.push(recipe);
      }
    }

    return { kept, removed };
  }

  // --- T05: Match Ingredients to Pantry ---
  // Compares each recipe's ingredients (scaled to servings) with the pantry.
  function matchIngredients(recipe, pantry, servings) {
    const scale = servings; // recipes are written for 1 serving
    return recipe.ingredients.map(ing => {
      const neededQty = ing.quantity * scale;
      const pantryItem = pantry.find(p => p.name.toLowerCase() === ing.name.toLowerCase());

      let status, onHand = 0, missingQty = 0;
      if (!pantryItem || pantryItem.quantity <= 0) {
        status = "missing";
        missingQty = neededQty;
      } else if (pantryItem.unit !== ing.unit) {
        // Different units — treat as have if same ingredient name (best effort)
        status = "have";
        onHand = pantryItem.quantity;
      } else if (pantryItem.quantity >= neededQty) {
        status = "have";
        onHand = neededQty;
      } else {
        status = "partial";
        onHand = pantryItem.quantity;
        missingQty = neededQty - pantryItem.quantity;
      }

      return {
        name: ing.name,
        neededQty,
        unit: ing.unit,
        essential: ing.essential,
        onHand,
        missingQty,
        status,
        expiry: pantryItem ? pantryItem.expiry : null,
      };
    });
  }

  // --- T06: Estimate Missing Ingredient Cost ---
  function estimateCost(matches) {
    let total = 0;
    const items = [];
    let unpriced = false;

    for (const m of matches) {
      if (m.status === "have") continue;
      const priceEntry = PRICES[m.name];
      const qtyToPrice = m.status === "missing" ? m.neededQty : m.missingQty;

      if (priceEntry && priceEntry[m.unit] != null) {
        const cost = qtyToPrice * priceEntry[m.unit];
        total += cost;
        items.push({ name: m.name, quantity: qtyToPrice, unit: m.unit, cost, essential: m.essential });
      } else {
        unpriced = true;
        items.push({ name: m.name, quantity: qtyToPrice, unit: m.unit, cost: null, essential: m.essential });
      }
    }

    return { total, items, unpriced };
  }

  // --- T07: Resolve Missing Ingredients ---
  // Check pantry equivalents using the substitution table.
  function resolveMissing(matches, pantry) {
    const resolved = matches.map(m => {
      if (m.status === "have") return { ...m, resolution: null };

      // Look for a substitution where the "with" item is in the pantry
      const sub = SUBSTITUTIONS.find(s =>
        s.for.toLowerCase() === m.name.toLowerCase() &&
        pantry.some(p => p.name.toLowerCase() === s.with.toLowerCase() && p.quantity > 0)
      );

      if (sub) {
        return {
          ...m,
          resolution: {
            type: "substituted",
            with: sub.with,
            effect: sub.effect,
          },
        };
      }

      return { ...m, resolution: null };
    });

    return resolved;
  }

  // --- T06b: Estimate Resolved Cost ---
  // Recalculates cost after substitutions — excludes items that were substituted.
  function estimateResolvedCost(resolved) {
    let total = 0;
    const items = [];
    for (const m of resolved) {
      if (m.status === "have") continue;
      if (m.resolution) continue; // substituted, no purchase needed
      const priceEntry = PRICES[m.name];
      const qtyToPrice = m.status === "missing" ? m.neededQty : m.missingQty;
      if (priceEntry && priceEntry[m.unit] != null) {
        const cost = qtyToPrice * priceEntry[m.unit];
        total += cost;
        items.push({ name: m.name, quantity: qtyToPrice, unit: m.unit, cost, essential: m.essential });
      } else {
        items.push({ name: m.name, quantity: qtyToPrice, unit: m.unit, cost: null, essential: m.essential });
      }
    }
    return { total, items };
  }

  // --- T08: Check Meal Feasibility ---
  // After resolution: every essential ingredient must be covered (have or substituted),
  // cost within budget, time within limit, no expired items used.
  function checkFeasibility(resolvedMatches, costEstimate, request) {
    const { budget, timeAvail } = request;
    const failures = [];

    // Essential ingredients must be covered
    for (const m of resolvedMatches) {
      if (m.essential) {
        if (m.status === "missing" && !m.resolution) {
          failures.push(`missing essential ingredient: ${m.name}`);
        }
      }
    }

    // Cost within budget
    if (costEstimate.total > budget) {
      failures.push(`missing items cost $${costEstimate.total.toFixed(2)}, budget is $${budget.toFixed(2)}`);
    }

    // No expired items used
    for (const m of resolvedMatches) {
      if (m.status === "have" && m.expiry) {
        const expiryDate = new Date(m.expiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
          failures.push(`uses expired ingredient: ${m.name}`);
        }
      }
    }

    return { feasible: failures.length === 0, failures };
  }

  // --- T09: Rank Feasible Meals ---
  // score = 35×coverage + 25×costFit + 20×timeFit + 10×prefMatch + 10×expiryUse
  function rankMeal(recipe, resolvedMatches, costEstimate, request) {
    const { timeAvail, likedCuisines, dislikes, servings } = request;

    // Ingredient coverage: share of ingredients on hand (have or substituted)
    const totalIngs = resolvedMatches.length;
    const coveredIngs = resolvedMatches.filter(m => m.status === "have" || (m.resolution && m.resolution.type === "substituted")).length;
    const coverage = totalIngs > 0 ? coveredIngs / totalIngs : 0;

    // Cost fit: 1 - (missing cost / budget)
    const budget = request.budget;
    const costFit = budget > 0
      ? Math.max(0, 1 - costEstimate.total / budget)
      : (costEstimate.total === 0 ? 1 : 0);

    // Time fit: 1 - (cookTime / timeAvail)
    const timeFit = timeAvail > 0
      ? Math.max(0, 1 - recipe.cookTime / timeAvail)
      : 0;

    // Preference match: 1 if matches a liked cuisine and no disliked ingredient
    const prefMatch = (likedCuisines.includes(recipe.cuisine) &&
      !recipe.ingredients.some(ing =>
        dislikes.some(d => d.toLowerCase() === ing.name.toLowerCase())
      )) ? 1 : 0;

    // Expiry use: 1 if uses an item expiring within 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);
    const expiryUse = resolvedMatches.some(m =>
      m.status === "have" && m.expiry &&
      new Date(m.expiry) >= today && new Date(m.expiry) <= threeDays
    ) ? 1 : 0;

    const score = Math.round(
      35 * coverage + 25 * costFit + 20 * timeFit + 10 * prefMatch + 10 * expiryUse
    );

    const missingCount = resolvedMatches.filter(m => m.status === "missing" && !m.resolution).length;

    return {
      score,
      factors: { coverage, costFit, timeFit, prefMatch, expiryUse },
      missingCount,
    };
  }

  // --- T10: Explain Recommendation ---
  // Builds a plain-language explanation from computed facts only.
  function explainMeal(recipe, resolvedMatches, costEstimate, ranking, request) {
    const have = resolvedMatches.filter(m => m.status === "have");
    const partial = resolvedMatches.filter(m => m.status === "partial");
    const substituted = resolvedMatches.filter(m => m.resolution && m.resolution.type === "substituted");
    const missing = resolvedMatches.filter(m => m.status === "missing" && !m.resolution);

    const parts = [];

    // What you have
    if (have.length > 0) {
      parts.push(`You already have ${have.map(m => m.name).join(", ")}.`);
    }

    // Substitutions
    if (substituted.length > 0) {
      const subTexts = substituted.map(m =>
        `${m.resolution.with} can substitute for ${m.name} — ${m.resolution.effect.toLowerCase()}`
      );
      parts.push(subTexts.join("; ") + ".");
    }

    // Partial
    if (partial.length > 0) {
      parts.push(`You're partially stocked on ${partial.map(m => m.name).join(", ")} — you'll need a bit more.`);
    }

    // Missing
    if (missing.length > 0) {
      const essentialMissing = missing.filter(m => m.essential);
      if (essentialMissing.length > 0) {
        parts.push(`Missing essential items: ${essentialMissing.map(m => m.name).join(", ")}.`);
      }
      const optionalMissing = missing.filter(m => !m.essential);
      if (optionalMissing.length > 0) {
        parts.push(`Missing optional items: ${optionalMissing.map(m => m.name).join(", ")} — you can skip these.`);
      }
    }

    // Cost
    if (costEstimate.total > 0) {
      parts.push(`Buying the missing items costs about $${costEstimate.total.toFixed(2)} (your budget is $${request.budget.toFixed(2)}).`);
    } else if (missing.length === 0 && substituted.length === 0) {
      parts.push(`You have everything you need — nothing to buy.`);
    }

    // Time
    parts.push(`Takes ${recipe.cookTime} minutes (you have ${request.timeAvail}).`);

    // Score explanation
    parts.push(`Ranked ${ranking.score}/100: ${Math.round(ranking.factors.coverage * 100)}% ingredients on hand, ` +
      `${ranking.factors.prefMatch ? "matches your taste" : "neutral on taste"}, ` +
      `${ranking.factors.expiryUse ? "uses items expiring soon" : "no urgent expiry items"}.`);

    return parts.join(" ");
  }

  // --- Full pipeline ---
  function runPipeline(pantry, request) {
    // T04: Filter
    const { kept, removed } = filterRecipes(RECIPES, request);

    if (kept.length === 0) {
      return {
        success: false,
        reason: "no_recipes_pass_filters",
        removedReasons: removed,
        meals: [],
      };
    }

    // For each kept recipe: T05 → T06 → T07 → T08
    const candidates = kept.map(recipe => {
      const matches = matchIngredients(recipe, pantry, request.servings);
      const resolved = resolveMissing(matches, pantry);
      const costEstimate = estimateResolvedCost(resolved);
      const feasibility = checkFeasibility(resolved, costEstimate, request);
      return { recipe, matches, resolved, costEstimate, feasibility };
    });

    const feasible = candidates.filter(c => c.feasibility.feasible);
    const infeasible = candidates.filter(c => !c.feasibility.feasible);

    if (feasible.length === 0) {
      return {
        success: false,
        reason: "no_feasible_meals",
        removedReasons: removed,
        infeasibleReports: infeasible.map(c => ({
          recipe: c.recipe,
          failures: c.feasibility.failures,
        })),
        meals: [],
      };
    }

    // T09: Rank
    const ranked = feasible.map(c => {
      const ranking = rankMeal(c.recipe, c.resolved, c.costEstimate, request);
      const explanation = explainMeal(c.recipe, c.resolved, c.costEstimate, ranking, request);
      return { ...c, ranking, explanation };
    });

    // Sort by score desc, then by fewer missing items
    ranked.sort((a, b) => {
      if (b.ranking.score !== a.ranking.score) return b.ranking.score - a.ranking.score;
      return a.ranking.missingCount - b.ranking.missingCount;
    });

    // Top 3
    const topMeals = ranked.slice(0, 3);

    return {
      success: true,
      meals: topMeals,
      totalFeasible: feasible.length,
      totalFiltered: kept.length,
      removedReasons: removed,
    };
  }

  // --- T15: Build Shopping List ---
  function buildShoppingList(meal, request) {
    const matches = meal.resolved;
    const items = [];

    for (const m of matches) {
      if (m.status === "have") continue;
      if (m.resolution) continue; // substituted, no purchase needed

      const qtyToBuy = m.status === "missing" ? m.neededQty : m.missingQty;
      const priceEntry = PRICES[m.name];
      const cost = (priceEntry && priceEntry[m.unit] != null)
        ? qtyToBuy * priceEntry[m.unit]
        : null;

      items.push({
        name: m.name,
        quantity: qtyToBuy,
        unit: m.unit,
        cost,
        essential: m.essential,
      });
    }

    const total = items.reduce((sum, i) => sum + (i.cost || 0), 0);

    return { items, total };
  }

  // --- T16: Update Pantry ---
  // Subtracts used ingredients from the pantry.
  function computePantryUpdate(meal, pantry, request) {
    const servings = request.servings;
    const updates = [];

    for (const m of meal.resolved) {
      const usedQty = m.status === "have" ? m.neededQty : m.onHand;
      if (usedQty <= 0) continue;

      const pantryItem = pantry.find(p => p.name.toLowerCase() === m.name.toLowerCase());
      if (pantryItem) {
        const newQty = Math.max(0, pantryItem.quantity - usedQty);
        updates.push({ name: m.name, oldQty: pantryItem.quantity, newQty, unit: pantryItem.unit });
      }

      // Also subtract substituted ingredient if it's in the pantry
      if (m.resolution && m.resolution.type === "substituted") {
        const subItem = pantry.find(p => p.name.toLowerCase() === m.resolution.with.toLowerCase());
        if (subItem) {
          const subUsedQty = m.neededQty; // used the same quantity of the substitute
          const newSubQty = Math.max(0, subItem.quantity - subUsedQty);
          updates.push({ name: m.resolution.with, oldQty: subItem.quantity, newQty: newSubQty, unit: subItem.unit });
        }
      }
    }

    return updates;
  }

  return {
    filterRecipes,
    matchIngredients,
    estimateCost,
    resolveMissing,
    checkFeasibility,
    rankMeal,
    explainMeal,
    runPipeline,
    buildShoppingList,
    computePantryUpdate,
  };
})();
