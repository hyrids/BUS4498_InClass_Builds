(function () {
  "use strict";

  const config = window.EVENT_RADAR_CONFIG || {};
  const postForm = document.getElementById("post-form");
  const announcementInput = document.getElementById("announcement");
  const flyerInput = document.getElementById("flyer");
  const postButton = document.getElementById("post-button");
  const postResult = document.getElementById("post-result");
  const refreshButton = document.getElementById("refresh-button");
  const board = document.getElementById("event-board");
  const boardStatus = document.getElementById("board-status");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const agentUrl = `${String(config.supabaseUrl || "").replace(/\/$/, "")}/functions/v1/submit-event`;
  const supabaseClient = window.supabase && config.supabaseUrl && config.publishableKey
    ? window.supabase.createClient(config.supabaseUrl, config.publishableKey)
    : null;

  let events = [];
  let activeFilter = "all";

  function setText(element, text) {
    element.textContent = text || "";
    return element;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) setText(node, text);
    return node;
  }

  function formatDate(dateValue) {
    if (!dateValue) return null;
    const parts = dateValue.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    if (Number.isNaN(date.getTime())) return null;
    return {
      month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      day: String(parts[2]),
      full: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
    };
  }

  function formatTime(timeValue) {
    if (!timeValue) return "";
    const parts = timeValue.split(":").map(Number);
    if (parts.length < 2 || parts.some(Number.isNaN)) return timeValue;
    const hour = parts[0];
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(parts[1]).padStart(2, "0")} ${suffix}`;
  }

  function setBoardStatus(text, isError) {
    setText(boardStatus, text);
    boardStatus.className = isError ? "result-label" : "muted";
  }

  function renderEmpty(message) {
    board.replaceChildren(element("li", "empty", message));
  }

  function renderEvents() {
    try {
      const visibleEvents = activeFilter === "food" ? events.filter((event) => event.free_food) : events;
      board.replaceChildren();
      if (!visibleEvents.length) {
        renderEmpty(activeFilter === "food" ? "No published events with free food yet." : "No events yet. Post the first one!");
        return;
      }
      visibleEvents.forEach((event) => board.appendChild(eventCard(event)));
    } catch (error) {
      console.error("Could not render event cards", error);
      renderEmpty("The event board could not display these events.");
    }
  }

  function eventCard(event) {
    const item = element("li", "event");
    const dateInfo = formatDate(event.event_date);
    const date = element("div", dateInfo ? "date" : "date tba");
    if (dateInfo) {
      date.appendChild(element("span", "mon", dateInfo.month));
      date.appendChild(element("span", "day", dateInfo.day));
    } else {
      date.appendChild(element("span", "day", "TBA"));
    }

    const body = element("div", "event-body");
    const whenParts = [];
    if (dateInfo) whenParts.push(dateInfo.full);
    if (event.start_time) {
      const times = formatTime(event.start_time);
      if (event.end_time) times += ` to ${formatTime(event.end_time)}`;
      whenParts.push(times);
    }
    body.appendChild(element("p", "when", whenParts.join(" · ") || "Time and date to be announced"));
    body.appendChild(element("h3", "", event.title || "Untitled event"));
    const metaParts = [event.club, event.place_name].filter(Boolean);
    if (event.place_detail) metaParts.push(event.place_detail);
    body.appendChild(element("p", "meta", metaParts.join(" · ") || "Campus event"));
    body.appendChild(element("p", "summary", event.summary || "Details coming soon."));

    const tags = element("p", "tags");
    if (event.cost) tags.appendChild(element("span", "tag", event.cost));
    if (event.free_food) tags.appendChild(element("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.appendChild(tags);

    item.appendChild(date);
    item.appendChild(body);
    const flyerPrefix = `${String(config.supabaseUrl || "").replace(/\/$/, "")}/storage/v1/object/public/flyers/`;
    if (typeof event.flyer_url === "string" && event.flyer_url.startsWith(flyerPrefix)) {
      const flyer = element("img", "flyer");
      flyer.src = event.flyer_url;
      flyer.alt = `${event.title || "Event"} flyer`;
      flyer.loading = "lazy";
      item.appendChild(flyer);
    }
    return item;
  }

  async function loadEvents() {
    if (!supabaseClient) {
      setBoardStatus("Add the Supabase configuration to load events.", true);
      renderEmpty("The event board is not configured yet.");
      return;
    }
    setBoardStatus("Loading events…", false);
    const { data, error } = await supabaseClient
      .from("events")
      .select("id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary, flyer_url")
      .eq("status", "published")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false });

    if (error) {
      events = [];
      setBoardStatus("The event board could not load. Check the database connection.", true);
      renderEmpty("The event board is temporarily unavailable.");
      return;
    }
    events = Array.isArray(data) ? data : [];
    setBoardStatus(events.length ? `${events.length} published event${events.length === 1 ? "" : "s"}` : "", false);
    renderEvents();
  }

  function showResult(status, message, reasons) {
    postResult.hidden = false;
    postResult.className = `result ${status || "error"}`;
    postResult.replaceChildren();
    postResult.appendChild(element("p", "result-label", status === "published" ? "Published" : status === "waiting" ? "Waiting for review" : status === "rejected" ? "Not posted" : status === "duplicate" ? "Already posted" : "Could not post"));
    postResult.appendChild(element("p", "", message || "The agent did not return a message."));
    if (Array.isArray(reasons) && reasons.length) {
      const list = element("ul", "reasons");
      reasons.forEach((reason) => list.appendChild(element("li", "", reason)));
      postResult.appendChild(list);
    }
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    const announcement = announcementInput.value.trim();
    if (!announcement) {
      showResult("error", "Add an announcement before posting.", []);
      announcementInput.focus();
      return;
    }
    const flyer = flyerInput.files && flyerInput.files[0] ? flyerInput.files[0] : null;
    if (flyer && flyer.size > 5 * 1024 * 1024) {
      showResult("error", "The flyer must be 5 MB or smaller.", []);
      return;
    }
    if (flyer && flyer.type !== "image/jpeg" && flyer.type !== "image/png") {
      showResult("error", "The flyer must be a JPG or PNG image.", []);
      return;
    }
    postButton.disabled = true;
    postButton.textContent = "Reviewing…";
    postResult.hidden = true;
    const formData = new FormData();
    formData.append("announcement", announcement);
    if (flyer) formData.append("flyer", flyer);
    try {
      const response = await fetch(agentUrl, {
        method: "POST",
        headers: { apikey: config.publishableKey },
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        showResult("error", result.message || "The agent could not review this post.", result.reasons);
        return;
      }
      showResult(result.status, result.message, result.reasons);
      if (result.ok) {
        announcementInput.value = "";
        flyerInput.value = "";
        if (result.status === "published") await loadEvents();
      }
    } catch (error) {
      showResult("error", "The agent could not be reached. Check your connection and try again.", []);
    } finally {
      postButton.disabled = false;
      postButton.textContent = "Review and post";
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderEvents();
    });
  });
  postForm.addEventListener("submit", submitAnnouncement);
  refreshButton.addEventListener("click", loadEvents);
  loadEvents();
}());
