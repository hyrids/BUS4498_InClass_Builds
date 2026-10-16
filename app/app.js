// Meal Decider — UI controller

const App = (() => {
  let pantry = [];
  let lastResults = null;
  let chosenMeal = null;
  let lastRequest = null;

  // --- Persistence ---
  function loadPantry() {
    try {
      const saved = localStorage.getItem("mealDeciderPantry");
      if (saved) pantry = JSON.parse(saved);
    } catch (e) { pantry = []; }
  }

  function savePantry() {
    localStorage.setItem("mealDeciderPantry", JSON.stringify(pantry));
  }

  // --- Tab navigation ---
  function initTabs() {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
      });
    });
  }

  // --- Pantry management ---
  function renderPantry() {
    const list = document.getElementById("pantryList");
    const stats = document.getElementById("pantryStats");

    if (pantry.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🥫</div><p>Your pantry is empty. Add ingredients above or load a sample pantry to get started.</p></div>`;
      stats.textContent = "";
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);

    stats.textContent = `${pantry.length} ingredient${pantry.length !== 1 ? "s" : ""}`;

    list.innerHTML = pantry.map((item, idx) => {
      let expiryClass = "fresh";
      let expiryText = "";
      if (item.expiry) {
        const exp = new Date(item.expiry);
        if (exp < today) { expiryClass = "expired"; expiryText = "expired"; }
        else if (exp <= threeDays) { expiryClass = "soon"; expiryText = `expires ${item.expiry}`; }
        else { expiryClass = "fresh"; expiryText = `expires ${item.expiry}`; }
      }

      return `<div class="pantry-item">
        <span class="name">${escapeHtml(item.name)}</span>
        <span class="qty">${item.quantity} ${item.unit}</span>
        ${expiryText ? `<span class="expiry ${expiryClass}">${expiryText}</span>` : ""}
        <button class="remove" onclick="App.removeItem(${idx})" title="Remove">×</button>
      </div>`;
    }).join("");
  }

  function addItem() {
    const name = document.getElementById("itemName").value.trim();
    const qty = parseFloat(document.getElementById("itemQty").value);
    const unit = document.getElementById("itemUnit").value;
    const expiry = document.getElementById("itemExpiry").value;

    if (!name) { alert("Please enter an ingredient name."); return; }
    if (!qty || qty <= 0) { alert("Please enter a valid quantity."); return; }

    // Check if already exists — update quantity
    const existing = pantry.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.quantity += qty;
      if (expiry) existing.expiry = expiry;
    } else {
      pantry.push({ name, quantity: qty, unit, expiry: expiry || null });
    }

    savePantry();
    renderPantry();

    // Clear form
    document.getElementById("itemName").value = "";
    document.getElementById("itemQty").value = "1";
    document.getElementById("itemExpiry").value = "";
  }

  function removeItem(idx) {
    pantry.splice(idx, 1);
    savePantry();
    renderPantry();
  }

  function clearPantry() {
    if (confirm("Clear all pantry items?")) {
      pantry = [];
      savePantry();
      renderPantry();
    }
  }

  function loadSamplePantry() {
    pantry = [
      { name: "eggs", quantity: 6, unit: "whole", expiry: null },
      { name: "bread", quantity: 6, unit: "slice", expiry: getRelativeDate(2) },
      { name: "butter", quantity: 4, unit: "tbsp", expiry: null },
      { name: "milk", quantity: 2, unit: "cup", expiry: getRelativeDate(1) },
      { name: "cheese", quantity: 4, unit: "slice", expiry: getRelativeDate(5) },
      { name: "rice", quantity: 3, unit: "cup", expiry: null },
      { name: "pasta", quantity: 2, unit: "cup", expiry: null },
      { name: "soy sauce", quantity: 5, unit: "tbsp", expiry: null },
      { name: "garlic", quantity: 6, unit: "clove", expiry: null },
      { name: "onion", quantity: 2, unit: "whole", expiry: null },
      { name: "olive oil", quantity: 6, unit: "tbsp", expiry: null },
      { name: "tortilla", quantity: 4, unit: "whole", expiry: getRelativeDate(4) },
      { name: "canned tuna", quantity: 1, unit: "can", expiry: null },
      { name: "oats", quantity: 2, unit: "cup", expiry: null },
      { name: "banana", quantity: 2, unit: "whole", expiry: getRelativeDate(2) },
      { name: "salt", quantity: 10, unit: "pinch", expiry: null },
      { name: "pepper", quantity: 10, unit: "pinch", expiry: null },
      { name: "tomato", quantity: 3, unit: "whole", expiry: getRelativeDate(2) },
      { name: "lettuce", quantity: 6, unit: "leaf", expiry: getRelativeDate(1) },
      { name: "ramen noodles", quantity: 2, unit: "pack", expiry: null },
      { name: "yogurt", quantity: 1, unit: "cup", expiry: getRelativeDate(3) },
      { name: "hummus", quantity: 4, unit: "tbsp", expiry: getRelativeDate(5) },
      { name: "cucumber", quantity: 1, unit: "whole", expiry: getRelativeDate(4) },
      { name: "carrots", quantity: 3, unit: "whole", expiry: null },
      { name: "potato", quantity: 2, unit: "whole", expiry: null },
      { name: "sour cream", quantity: 3, unit: "tbsp", expiry: getRelativeDate(6) },
    ];
    savePantry();
    renderPantry();
  }

  // --- Plan a Meal ---
  function gatherRequest() {
    const servings = parseInt(document.getElementById("servings").value) || 1;
    const timeAvail = parseInt(document.getElementById("timeAvail").value) || 30;
    const budget = parseFloat(document.getElementById("budget").value) || 0;

    const equipment = Array.from(document.querySelectorAll("#equipmentGroup input:checked")).map(c => c.value);
    const dietRules = Array.from(document.querySelectorAll("#dietGroup input:checked")).map(c => c.value);
    const likedCuisines = Array.from(document.querySelectorAll("#cuisineGroup input:checked")).map(c => c.value);
    const allergies = document.getElementById("allergies").value.split(",").map(s => s.trim()).filter(Boolean);
    const dislikes = document.getElementById("dislikes").value.split(",").map(s => s.trim()).filter(Boolean);

    return { servings, timeAvail, budget, equipment, dietRules, likedCuisines, allergies, dislikes };
  }

  function findMeals() {
    if (pantry.length === 0) {
      alert("Your pantry is empty. Add some ingredients first!");
      switchTab("pantry");
      return;
    }

    const request = gatherRequest();
    lastRequest = request;
    const results = Engine.runPipeline(pantry, request);
    lastResults = results;
    renderResults(results);
    switchTab("results");
  }

  // --- Render results ---
  function renderResults(results) {
    const container = document.getElementById("resultsContent");

    if (!results.success) {
      let html = `<div class="notice">No feasible meals found.</div>`;

      if (results.reason === "no_recipes_pass_filters") {
        html += `<p>The following recipes were filtered out:</p>`;
        html += results.removedReasons.map(r =>
          `<div class="meal-card"><h3>${escapeHtml(r.recipe.name)}</h3><ul>${r.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>`
        ).join("");
        html += `<div class="notice info">Try relaxing your constraints: increase time, check more equipment, or remove diet restrictions.</div>`;
      } else if (results.reason === "no_feasible_meals") {
        html += `<p>Some recipes passed the initial filters but none were feasible:</p>`;
        html += results.infeasibleReports.map(r =>
          `<div class="meal-card"><h3>${escapeHtml(r.recipe.name)}</h3><ul>${r.failures.map(f => `<li>${escapeHtml(f)}</li>`).join("")}</ul></div>`
        ).join("");
        html += `<div class="notice info">Try increasing your budget, adding more ingredients to your pantry, or increasing your time available.</div>`;
      }

      container.innerHTML = html;
      return;
    }

    let html = `<div class="notice info">Found ${results.totalFeasible} feasible meal${results.totalFeasible !== 1 ? "s" : ""} (out of ${results.totalFiltered} that passed filters). Showing the top ${results.meals.length}.</div>`;

    html += results.meals.map((meal, idx) => {
      const r = meal.recipe;
      const rank = meal.ranking;

      // Ingredient breakdown
      const ingRows = meal.resolved.map(m => {
        let detail = "";
        if (m.status === "have") detail = `${m.onHand} ${m.unit} ✓`;
        else if (m.status === "partial") detail = `have ${m.onHand}, need ${m.neededQty} ${m.unit}`;
        else if (m.resolution) detail = `→ substitute with ${m.resolution.with}`;
        else detail = `need ${m.neededQty} ${m.unit}`;

        let label = m.name;
        if (m.essential) label += " *";
        if (m.resolution) label += ` (sub: ${m.resolution.with})`;

        return `<div class="ingredient-row">
          <span class="status-dot ${m.status === "have" ? "have" : m.status === "partial" ? "partial" : m.resolution ? "substituted" : "missing"}"></span>
          <span class="ing-name">${escapeHtml(label)}</span>
          <span class="ing-detail">${escapeHtml(detail)}</span>
        </div>`;
      }).join("");

      // Score factors
      const factorLabels = [
        { key: "coverage", label: "ingredients on hand" },
        { key: "costFit", label: "cost fit" },
        { key: "timeFit", label: "time fit" },
        { key: "prefMatch", label: "taste match" },
        { key: "expiryUse", label: "uses expiring items" },
      ];
      const factorsHtml = factorLabels.map(f =>
        `<span class="score-factor ${rank.factors[f.key] > 0.5 ? "active" : ""}">${f.label}: ${Math.round(rank.factors[f.key] * 100)}%</span>`
      ).join("");

      return `<div class="meal-card">
        <div class="meal-card-header">
          <div>
            <h3>${idx + 1}. ${escapeHtml(r.name)}</h3>
            <div class="meal-meta">
              <span>⏱ ${r.cookTime} min</span>
              <span>🍽 ${r.cuisine}</span>
              <span>🥘 ${r.dietTags.length ? r.dietTags.join(", ") : "no diet tags"}</span>
            </div>
          </div>
          <span class="meal-score">${rank.score}/100</span>
        </div>

        <div class="ingredient-breakdown">
          ${ingRows}
        </div>

        <div class="score-breakdown">${factorsHtml}</div>

        <div class="explanation">${escapeHtml(meal.explanation)}</div>

        ${meal.costEstimate.total > 0 ? `<div class="explanation"><strong>Missing items cost:</strong> $${meal.costEstimate.total.toFixed(2)} (budget: $${lastRequest.budget.toFixed(2)})</div>` : ""}

        <button class="btn-primary" onclick="App.chooseMeal(${idx})">Choose this meal →</button>
      </div>`;
    }).join("");

    container.innerHTML = html;
  }

  // --- Choose a meal → build shopping list ---
  function chooseMeal(idx) {
    if (!lastResults || !lastResults.meals[idx]) return;
    chosenMeal = lastResults.meals[idx];
    renderShoppingList();
    switchTab("shopping");
  }

  function renderShoppingList() {
    const container = document.getElementById("shoppingContent");

    if (!chosenMeal) {
      container.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><p>No meal chosen yet. Find meals and pick one to see your shopping list.</p></div>`;
      return;
    }

    const shopping = Engine.buildShoppingList(chosenMeal, lastRequest);

    let html = `<div class="meal-card"><h3>${escapeHtml(chosenMeal.recipe.name)}</h3>
      <div class="meal-meta"><span>⏱ ${chosenMeal.recipe.cookTime} min</span><span>🍽 ${chosenMeal.recipe.cuisine}</span></div></div>`;

    if (shopping.items.length === 0) {
      html += `<div class="notice info">You have everything you need! No shopping required.</div>`;
    } else {
      html += `<p class="section-desc">Items you need to buy (prices are estimates):</p>`;
      html += shopping.items.map(item =>
        `<div class="shopping-item">
          <span class="item-name">${escapeHtml(item.name)} — ${item.quantity} ${item.unit}${item.essential ? " *" : ""}</span>
          <span class="item-price">${item.cost != null ? "$" + item.cost.toFixed(2) : "price unknown"}</span>
        </div>`
      ).join("");

      html += `<div class="shopping-total"><span>Estimated total</span><span>$${shopping.total.toFixed(2)}</span></div>`;
    }

    html += `<div style="margin-top: 1.5rem;">
      <button class="btn-primary" onclick="App.confirmCooked()">I cooked this — update pantry</button>
      <button class="btn-secondary" onclick="App.switchTab('results')">Back to results</button>
    </div>`;

    container.innerHTML = html;
  }

  // --- T16: Confirm cooked → update pantry ---
  function confirmCooked() {
    if (!chosenMeal || !lastRequest) return;
    if (!confirm(`Update your pantry by subtracting the ingredients used for "${chosenMeal.recipe.name}"?`)) return;

    const updates = Engine.computePantryUpdate(chosenMeal, pantry, lastRequest);

    for (const u of updates) {
      const item = pantry.find(p => p.name.toLowerCase() === u.name.toLowerCase());
      if (item) {
        item.quantity = u.newQty;
      }
    }

    // Remove items with 0 quantity
    pantry = pantry.filter(p => p.quantity > 0);

    savePantry();
    renderPantry();

    alert(`Pantry updated! ${updates.length} ingredient${updates.length !== 1 ? "s" : ""} adjusted.`);
    chosenMeal = null;
    renderShoppingList();
    switchTab("pantry");
  }

  // --- Helpers ---
  function switchTab(tabName) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(tabName).classList.add("active");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getRelativeDate(daysFromNow) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  }

  function initAutocomplete() {
    const datalist = document.getElementById("ingredientSuggestions");
    datalist.innerHTML = ALL_INGREDIENT_NAMES.map(name => `<option value="${escapeHtml(name)}">`).join("");
  }

  // --- Init ---
  function init() {
    loadPantry();
    initTabs();
    initAutocomplete();
    renderPantry();

    document.getElementById("addItemBtn").addEventListener("click", addItem);
    document.getElementById("clearPantry").addEventListener("click", clearPantry);
    document.getElementById("loadSamplePantry").addEventListener("click", loadSamplePantry);
    document.getElementById("findMealsBtn").addEventListener("click", findMeals);

    // Enter key in add item form
    document.getElementById("itemName").addEventListener("keydown", e => {
      if (e.key === "Enter") addItem();
    });

    renderShoppingList();
  }

  return { init, removeItem, chooseMeal, confirmCooked, switchTab };
})();

document.addEventListener("DOMContentLoaded", App.init);
