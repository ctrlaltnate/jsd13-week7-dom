const leaderBoard = document.querySelector("#leaderboard");
const snapArea = document.querySelector("#snaparea");
const profileInfo = document.querySelector("#profileinfo");

const supabaseUrl = "https://uxdangdsxwouuwuhoats.supabase.co";
const supabasePublishableKey = "sb_publishable_hWYaoG0l00KOREynZH8Idg_-lo_oovs";
const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabasePublishableKey
);

let playerName = "";
let clickCount = 0;
let leaderBoardData = [];
let saveScoreTimer;

const unsnapImage = document.createElement("img");
unsnapImage.id = "gauntlet-image";
unsnapImage.src = "assets/unsnap.png";
unsnapImage.alt = "Unsnap";
unsnapImage.width = 400;
unsnapImage.draggable = false;
snapArea.append(unsnapImage);

// Prevent clicks until the saved player score has loaded.
unsnapImage.style.pointerEvents = "none";
unsnapImage.style.opacity = "0.6";

unsnapImage.addEventListener("pointerdown", (event) => {
  unsnapImage.setPointerCapture(event.pointerId);
  unsnapImage.src = "assets/snap.png";
  unsnapImage.alt = "Snap";
  unsnapImage.width = 430;
  snapArea.style.backgroundColor = "#ac6701";
});

unsnapImage.addEventListener("pointerup", (event) => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
  snapArea.style.backgroundColor = "#1b1b1b";

  clickCount += 1;
  updateProfileInfo();
  updateCurrentPlayerInLeaderBoard();
  queueLeaderBoardUpdate();
  snapBubble(event);
});

unsnapImage.addEventListener("pointercancel", () => {
  unsnapImage.src = "assets/unsnap.png";
  unsnapImage.alt = "Unsnap";
  unsnapImage.width = 400;
  snapArea.style.backgroundColor = "#1b1b1b";
});

function snapBubble(event) {
  const snapAreaRect = snapArea.getBoundingClientRect();
  const clickX = event.clientX - snapAreaRect.left;
  const clickY = event.clientY - snapAreaRect.top;

  const bubble = document.createElement("div");
  bubble.classList.add("snap-bubble");
  bubble.textContent = "+1";
  bubble.style.left = `${clickX}px`;
  bubble.style.top = `${clickY}px`;
  snapArea.append(bubble);

  const snappingEffect = document.createElement("img");
  snappingEffect.classList.add("snapping-effect");
  snappingEffect.src = "assets/snapping.png";
  snappingEffect.alt = "";
  snappingEffect.style.left = `${clickX}px`;
  snappingEffect.style.top = `${clickY}px`;
  snapArea.append(snappingEffect);

  bubble.addEventListener("animationend", () => bubble.remove());
  snappingEffect.addEventListener("animationend", () => snappingEffect.remove());
}

function queueLeaderBoardUpdate() {
  clearTimeout(saveScoreTimer);

  saveScoreTimer = setTimeout(() => {
    updateLeaderBoard(playerName, clickCount);
  }, 500);
}

function updateCurrentPlayerInLeaderBoard() {
  const currentPlayer = leaderBoardData.find(
    (player) => player.name === playerName
  );

  if (currentPlayer) {
    currentPlayer.score = clickCount;
  } else {
    leaderBoardData.push({ name: playerName, score: clickCount });
  }

  leaderBoardData.sort((firstPlayer, secondPlayer) => {
    return secondPlayer.score - firstPlayer.score;
  });

  renderLeaderBoard();
}

async function updateLeaderBoard(name, score) {
  const { error } = await supabaseClient
    .from("leaderboard")
    .upsert(
      {
        name,
        score,
        updated_at: new Date().toISOString()
      },
      { onConflict: "name" }
    );

  if (error) {
    console.error("Could not save score:", error);
    return;
  }

  await loadLeaderBoard();
}

async function loadLeaderBoard() {
  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("name, score")
    .order("score", { ascending: false });

  if (error) {
    console.error("Could not load leaderboard:", error);
    return;
  }

  leaderBoardData = data;
  renderLeaderBoard();
}

async function loadPlayerScore() {
  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("score")
    .eq("name", playerName)
    .maybeSingle();

  if (error) {
    console.error("Could not load player score:", error);
    return;
  }

  clickCount = data?.score || 0;
  updateProfileInfo();
}

function renderLeaderBoard() {
  leaderBoard.innerHTML = "";

  leaderBoardData.forEach((player, index) => {
    const playerRow = document.createElement("div");
    const playerNameElement = document.createElement("span");
    const playerScoreElement = document.createElement("span");

    playerNameElement.textContent = `${index + 1}. ${player.name}`;
    playerScoreElement.textContent = player.score;

    playerRow.style.display = "flex";
    playerRow.style.justifyContent = "space-between";
    playerRow.style.alignItems = "center";
    playerRow.style.width = "100%";
    playerRow.style.fontSize = "3em";
    playerRow.style.borderBottom = "1px solid #ebebeb";

    playerRow.append(playerNameElement, playerScoreElement);
    leaderBoard.append(playerRow);
  });
}

function updateProfileInfo() {
  profileInfo.textContent =
    `${playerName} was snapped! Total removed: ${clickCount}`;
}

function getCookie(cookieName) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}

function setCookie(cookieName, value, days) {
  const maxAge = days * 24 * 60 * 60;

  document.cookie =
    `${cookieName}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

async function choosePlayerName() {
  const savedPlayerName = getCookie("playerName");

  if (savedPlayerName) {
    playerName = savedPlayerName;
    return;
  }

  while (!playerName) {
    const newPlayerName = prompt("Enter your player name")?.trim();

    if (!newPlayerName) {
      continue;
    }

    const { error } = await supabaseClient
      .from("leaderboard")
      .insert({ name: newPlayerName, score: 0 });

    if (error?.code === "23505") {
      alert("This name is already in use. Please choose another name.");
      continue;
    }

    if (error) {
      console.error("Could not create player:", error);
      alert("Could not create player. Please try again.");
      continue;
    }

    playerName = newPlayerName;
    setCookie("playerName", playerName, 365);
  }
}

async function initializeGame() {
  await choosePlayerName();
  updateProfileInfo();
  await loadPlayerScore();
  await loadLeaderBoard();

  unsnapImage.style.pointerEvents = "auto";
  unsnapImage.style.opacity = "1";
}

initializeGame();
