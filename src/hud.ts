"use strict";

export interface HUDState {
  update: (delta: number) => void;
  showCatchPrompt: (visible: boolean) => void;
  addScore: (points: number) => void;
  getScore: () => number;
  getElapsedTime: () => number;
  showLeaderboard: (finalScore: number) => void;
  dispose: () => void;
}

//  Leaderboard (localStorage)
const LEADERBOARD_KEY = "city_mouse_chase_scores";
const MAX_ENTRIES = 10;

interface LeaderboardEntry {
  score: number;
  time: number; // secondes
  date: string;
}

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function addToLeaderboard(score: number, time: number): LeaderboardEntry[] {
  const entries = loadLeaderboard();
  entries.push({ score, time, date: new Date().toLocaleDateString("fr-FR") });
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}
//

export function createHUD(): HUDState {
  //  Conteneur principal
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    fontFamily: "'Segoe UI', sans-serif",
    userSelect: "none",
  });
  document.body.appendChild(container);

  //  Crosshair
  const crosshair = document.createElement("div");
  crosshair.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="white" stroke-width="1.5" opacity="0.85"/>
      <line x1="12" y1="2"  x2="12" y2="8"  stroke="white" stroke-width="1.5" opacity="0.85"/>
      <line x1="12" y1="16" x2="12" y2="22" stroke="white" stroke-width="1.5" opacity="0.85"/>
      <line x1="2"  y1="12" x2="8"  y2="12" stroke="white" stroke-width="1.5" opacity="0.85"/>
      <line x1="16" y1="12" x2="22" y2="12" stroke="white" stroke-width="1.5" opacity="0.85"/>
    </svg>`;
  Object.assign(crosshair.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    filter: "drop-shadow(0 0 3px rgba(0,0,0,0.8))",
  });
  container.appendChild(crosshair);

  //  Timer
  const timerEl = document.createElement("div");
  Object.assign(timerEl.style, {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontSize: "28px",
    fontWeight: "700",
    textShadow: "0 2px 8px rgba(0,0,0,0.7)",
    letterSpacing: "2px",
    background: "rgba(0,0,0,0.25)",
    padding: "6px 20px",
    borderRadius: "30px",
    backdropFilter: "blur(4px)",
  });
  timerEl.textContent = "00:00";
  container.appendChild(timerEl);

  //  Score
  const scoreEl = document.createElement("div");
  Object.assign(scoreEl.style, {
    position: "absolute",
    top: "20px",
    left: "24px",
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    textShadow: "0 2px 6px rgba(0,0,0,0.7)",
    background: "rgba(0,0,0,0.25)",
    padding: "6px 16px",
    borderRadius: "20px",
    backdropFilter: "blur(4px)",
    transition: "transform 0.15s",
  });
  scoreEl.textContent = "Score : 0";
  container.appendChild(scoreEl);

  //  Compteur de captures
  const catchCountEl = document.createElement("div");
  Object.assign(catchCountEl.style, {
    position: "absolute",
    top: "68px",
    left: "24px",
    color: "rgba(255,255,255,0.75)",
    fontSize: "14px",
    textShadow: "0 1px 4px rgba(0,0,0,0.7)",
    background: "rgba(0,0,0,0.2)",
    padding: "4px 12px",
    borderRadius: "14px",
    backdropFilter: "blur(4px)",
  });
  catchCountEl.textContent = "🐾 0 attrapé(s)";
  container.appendChild(catchCountEl);

  //  Difficulté
  const difficultyEl = document.createElement("div");
  Object.assign(difficultyEl.style, {
    position: "absolute",
    top: "20px",
    right: "24px",
    color: "#a0ffb0",
    fontSize: "16px",
    fontWeight: "600",
    textShadow: "0 2px 6px rgba(0,0,0,0.7)",
    background: "rgba(0,0,0,0.25)",
    padding: "6px 16px",
    borderRadius: "20px",
    backdropFilter: "blur(4px)",
    transition: "color 0.5s, transform 0.15s",
  });
  difficultyEl.textContent = "● Facile";
  container.appendChild(difficultyEl);

  //  Bonus flash
  const bonusEl = document.createElement("div");
  Object.assign(bonusEl.style, {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#ffe566",
    fontSize: "32px",
    fontWeight: "800",
    textShadow: "0 0 16px rgba(255,200,0,0.8)",
    opacity: "0",
    pointerEvents: "none",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  });
  container.appendChild(bonusEl);

  //  Prompt "Appuie sur E"
  const catchPrompt = document.createElement("div");
  Object.assign(catchPrompt.style, {
    position: "absolute",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    background: "rgba(0,0,0,0.5)",
    padding: "10px 24px",
    borderRadius: "24px",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.3)",
    opacity: "0",
    transition: "opacity 0.2s ease",
    whiteSpace: "nowrap",
    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
  });
  catchPrompt.innerHTML = `<span style="background:#fff;color:#222;border-radius:6px;padding:1px 8px;font-size:14px;margin-right:8px;">E</span>Attraper !`;
  container.appendChild(catchPrompt);

  //  Instructions
  const instructions = document.createElement("div");
  Object.assign(instructions.style, {
    position: "absolute",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "rgba(255,255,255,0.6)",
    fontSize: "13px",
    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
    whiteSpace: "nowrap",
  });
  instructions.textContent =
    "ZQSD — Déplacer   |   E — Attraper   |   Souris — Regarder";
  container.appendChild(instructions);

  //  État interne
  let elapsed = 0;
  let score = 0;
  let catchCount = 0;
  let lastDifficultyLabel = "Facile";
  let bonusTimeout: ReturnType<typeof setTimeout> | null = null;

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;
  }

  function getDifficulty(t: number): { label: string; color: string } {
    if (t < 30) return { label: "● Facile", color: "#a0ffb0" };
    if (t < 60) return { label: "●● Moyen", color: "#ffe066" };
    if (t < 120) return { label: "●●● Difficile", color: "#ff9944" };
    return { label: "★ EXTRÊME", color: "#ff4444" };
  }

  function update(delta: number) {
    elapsed += delta;
    timerEl.textContent = formatTime(elapsed);
    const { label, color } = getDifficulty(elapsed);
    if (label !== lastDifficultyLabel) {
      difficultyEl.textContent = label;
      difficultyEl.style.color = color;
      lastDifficultyLabel = label;
      difficultyEl.style.transform = "scale(1.35)";
      setTimeout(() => {
        difficultyEl.style.transform = "scale(1)";
      }, 300);
    }
  }

  function showCatchPrompt(visible: boolean) {
    catchPrompt.style.opacity = visible ? "1" : "0";
  }

  function addScore(points: number) {
    score += points;
    catchCount++;
    scoreEl.textContent = `Score : ${score}`;
    catchCountEl.textContent = `🐾 ${catchCount} attrapé(s)`;

    scoreEl.style.transform = "scale(1.25)";
    setTimeout(() => {
      scoreEl.style.transform = "scale(1)";
    }, 200);

    if (bonusTimeout) clearTimeout(bonusTimeout);
    bonusEl.textContent = `+${points} pts`;
    bonusEl.style.opacity = "1";
    bonusTimeout = setTimeout(() => {
      bonusEl.style.opacity = "0";
    }, 900);
  }

  //  Écran leaderboard
  function showLeaderboard(finalScore: number) {
    const entries = addToLeaderboard(finalScore, Math.floor(elapsed));

    // Trouver le rang de cette partie (première occurrence du score)
    const myRank = entries.findIndex((e) => e.score === finalScore) + 1;

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(8,16,36,0.94)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "'Segoe UI', sans-serif",
      backdropFilter: "blur(14px)",
      zIndex: "999",
      pointerEvents: "all",
    });

    const rows = entries
      .map((e, i) => {
        const isMe = i === myRank - 1;
        const medal =
          i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `
        <tr style="
          background:${isMe ? "rgba(255,220,50,0.15)" : "transparent"};
          font-weight:${isMe ? "700" : "400"};
          outline:${isMe ? "1px solid rgba(255,220,50,0.4)" : "none"};
        ">
          <td style="padding:8px 16px;text-align:center;">${medal}</td>
          <td style="padding:8px 20px;text-align:right;color:#ffe566;font-size:18px;">${e.score}</td>
          <td style="padding:8px 20px;text-align:center;color:#aad4ff;">${formatTime(e.time)}</td>
          <td style="padding:8px 16px;text-align:center;color:#aaa;font-size:13px;">${e.date}</td>
        </tr>`;
      })
      .join("");

    overlay.innerHTML = `
      <div style="font-size:52px;margin-bottom:6px;">🏆</div>
      <div style="font-size:34px;font-weight:800;margin-bottom:6px;">Partie terminée</div>
      <div style="font-size:17px;opacity:.7;margin-bottom:6px;">
        Score final : <strong style="color:#ffe566;font-size:22px;">${finalScore}</strong>
      </div>
      <div style="font-size:14px;opacity:.5;margin-bottom:24px;">
        ${catchCount} créature(s) attrapée(s) · ${formatTime(elapsed)}
        ${myRank === 1 ? " · <span style='color:#ffe566'>🎉 Nouveau record !</span>" : ""}
      </div>
      <div style="
        background:rgba(255,255,255,0.05);
        border:1px solid rgba(255,255,255,0.1);
        border-radius:16px;padding:16px 8px;margin-bottom:28px;min-width:400px;
      ">
        <div style="text-align:center;font-size:12px;opacity:.4;margin-bottom:10px;letter-spacing:2px;text-transform:uppercase;">
          Meilleurs scores
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          <thead>
            <tr style="opacity:.4;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
              <th style="padding:4px 16px;">#</th>
              <th style="padding:4px 20px;text-align:right;">Score</th>
              <th style="padding:4px 20px;">Temps</th>
              <th style="padding:4px 16px;">Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="display:flex;gap:12px;">
        <button id="restartBtn" style="
          font-size:17px;padding:13px 40px;border:none;border-radius:30px;
          background:#ffe566;color:#222;cursor:pointer;font-weight:700;
          box-shadow:0 4px 24px rgba(255,220,50,0.35);">
          🔄 Rejouer
        </button>
        <button id="resetLbBtn" style="
          font-size:13px;padding:13px 20px;
          border:1px solid rgba(255,255,255,.15);border-radius:30px;
          background:transparent;color:rgba(255,255,255,.4);cursor:pointer;">
          Effacer les scores
        </button>
      </div>`;

    document.body.appendChild(overlay);
    document
      .getElementById("restartBtn")
      ?.addEventListener("click", () => location.reload());
    document.getElementById("resetLbBtn")?.addEventListener("click", () => {
      localStorage.removeItem(LEADERBOARD_KEY);
      location.reload();
    });
  }

  function dispose() {
    document.body.removeChild(container);
  }

  return {
    update,
    showCatchPrompt,
    addScore,
    getScore: () => score,
    getElapsedTime: () => elapsed,
    showLeaderboard,
    dispose,
  };
}
