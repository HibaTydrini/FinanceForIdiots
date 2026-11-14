// Progress tracking, quiz and "ask AI" behaviour for the Table of Contents.
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

    // Quiz: answering correctly also marks the lesson complete.
    const quiz = document.getElementById("quiz");
    const answer = Number(quiz.dataset.answer);
    quiz.querySelectorAll(".option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const correct = Number(opt.dataset.index) === answer;
        quiz.querySelectorAll(".option").forEach((o) => o.classList.remove("wrong"));
        opt.classList.add(correct ? "right" : "wrong");
        const fb = quiz.querySelector(".quiz-feedback");
        fb.hidden = false;
        fb.classList.toggle("is-right", correct);
        fb.textContent = correct ? `Correct! ${fb.dataset.explanation}` : "Not quite. Try again.";
        if (correct) {
          quiz.querySelectorAll(".option").forEach((o) => (o.disabled = true));
          const done = getDone(); done.add(id); setDone(done); render();
        }
      });
    });

    // Ask the AI about this concept
    const form = document.getElementById("ask-form");
    const input = document.getElementById("ask-input");
    const out = document.getElementById("ask-answer");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      out.hidden = false;
      out.textContent = "Thinking…";
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: id, question }),
        });
        const data = await res.json();
        out.innerHTML = formatAnswer(data.answer || data.error || "Something went wrong.");
      } catch {
        out.textContent = "Couldn't reach the server. Try again.";
      }
    });
  }

  // Escape HTML, then allow **bold** and line breaks.
  function formatAnswer(text) {
    const esc = text.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }

  return { initToc, initLesson };
})();
