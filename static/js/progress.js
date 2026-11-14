// Progress tracking for the Table of Contents.
// Progress is kept in the browser (localStorage) so no database is needed yet.
const FFI = (() => {
  const KEY = "ffi-progress";

  function getDone() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); }
    catch { return new Set(); }
  }
  function setDone(set) {
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch { /* private mode */ }
  }
  function planFrom(el) {
    return (el.dataset.plan || "").split(",").filter(Boolean);
  }

  // ---------------------------------------------------------------- TOC page
  function initToc() {
    const hero = document.querySelector(".hero");
    const plan = planFrom(hero);
    const done = getDone();

    document.querySelectorAll(".lesson-row").forEach((row) => {
      if (done.has(row.dataset.lesson)) row.classList.add("done");
    });

    const doneInPlan = plan.filter((id) => done.has(id)).length;
    document.getElementById("done-count").textContent = doneInPlan;
    document.getElementById("bar-fill").style.width =
      plan.length ? `${(doneInPlan / plan.length) * 100}%` : "0%";

    const btn = document.getElementById("continue-btn");
    const nextId = plan.find((id) => !done.has(id));
    if (doneInPlan > 0 && nextId) {
      btn.textContent = "Continue →";
      btn.href = btn.href.replace(/[^/]+$/, nextId);
    } else if (plan.length && !nextId) {
      btn.textContent = "Plan complete 🎉 Review lessons";
    }

    // "My plan" hides optional lessons; "All lessons" shows everything.
    const buttons = document.querySelectorAll(".toggle-btn");
    const apply = (filter) => {
      document.body.classList.toggle("show-plan-only", filter === "plan");
      buttons.forEach((b) => {
        const on = b.dataset.filter === filter;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on);
      });
      document.querySelectorAll(".module").forEach((m) => {
        const visible = m.querySelectorAll(".lesson-row:not(.priority-optional)").length;
        m.classList.toggle("all-optional", visible === 0);
      });
    };
    buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
    apply("plan");
  }

  // ---------------------------------------------------------------- lesson page
  function initLesson() {
    const article = document.querySelector(".lesson");
    const id = article.dataset.lesson;

    // Mark complete
    const completeBtn = document.getElementById("complete-btn");
    const render = () => {
      const isDone = getDone().has(id);
      completeBtn.textContent = isDone ? "✓ Completed (undo)" : "Mark as complete";
      completeBtn.classList.toggle("is-done", isDone);
    };
    completeBtn.addEventListener("click", () => {
      const done = getDone();
      done.has(id) ? done.delete(id) : done.add(id);
      setDone(done);
      render();
    });
    render();
  }

  // ---------------------------------------------------------------- table of contents (expandable)
  function initContents() {
    const total = Number(document.querySelector(".contents-hero").dataset.total) || 0;
    const topics = [...document.querySelectorAll(".topic")];

    // Learned checkboxes + progress bar
    const refresh = () => {
      const done = getDone();
      let count = 0;
      topics.forEach((t) => {
        const isDone = done.has(t.dataset.topic);
        t.classList.toggle("done", isDone);
        t.querySelector(".learned-box").checked = isDone;
        if (isDone) count += 1;
      });
      document.getElementById("done-count").textContent = count;
      document.getElementById("bar-fill").style.width = total ? `${(count / total) * 100}%` : "0%";
    };
    topics.forEach((t) => {
      t.querySelector(".learned-box").addEventListener("change", (e) => {
        const done = getDone();
        e.target.checked ? done.add(t.dataset.topic) : done.delete(t.dataset.topic);
        setDone(done);
        refresh();
      });
    });
    refresh();

    // Reading level: show only the chosen level's explanation
    const LEVEL_KEY = "ffi-level";
    const setLevel = (level) => {
      document.querySelectorAll(".level-btn").forEach((b) => {
        const on = b.dataset.level === level;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on);
      });
      document.querySelectorAll(".level-text").forEach((p) => { p.hidden = p.dataset.level !== level; });
      try { localStorage.setItem(LEVEL_KEY, level); } catch { /* private mode */ }
    };
    document.querySelectorAll(".level-btn").forEach((b) => b.addEventListener("click", () => setLevel(b.dataset.level)));
    let saved = null;
    try { saved = localStorage.getItem(LEVEL_KEY); } catch { /* private mode */ }
    if (saved && !new URLSearchParams(location.search).has("level")) setLevel(saved);

    // Search
    const search = document.getElementById("topic-search");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      topics.forEach((t) => {
        const match = !q || t.dataset.search.includes(q);
        t.hidden = !match;
        if (match) shown += 1;
      });
      document.querySelectorAll(".chapter").forEach((ch) => {
        ch.hidden = !ch.querySelector(".topic:not([hidden])");
      });
      document.getElementById("no-results").hidden = shown > 0;
    });
  }

  return { initToc, initLesson, initContents };
})();
