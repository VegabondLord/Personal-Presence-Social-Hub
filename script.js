const DISCORD_ID = "1202258370585952299";
const GITHUB_USERNAME = "VegabondLord";

const repoList = document.getElementById("repo-grid");

// Discord Card
const avatarEl = document.getElementById("discord-avatar");
const nameEl = document.getElementById("discord-name");
const statusTextEl = document.getElementById("user-status");
const statusDotEl = document.getElementById("discord-status-dot");
const discordBio = document.getElementById("discord-bio");

// Spotify Card
const spotifyCard = document.getElementById("spotify-card");
const spotifyAlbum = document.getElementById("spotify-album");
const spotifySong = document.getElementById("spotify-song");
const spotifyArtist = document.getElementById("spotify-artist");

// Activity
const activityCard = document.getElementById("activity-card");
const activityName = document.getElementById("activity-name");
const activityDetails = document.getElementById("activity-details");
const activityIcon = document.getElementById("activity-icon");

// User Reviews
const form = document.getElementById("review-form");
const commentsEl = document.getElementById("comments");
const nicknameInput = document.getElementById("nickname");
const commentInput = document.getElementById("comment");
const STORAGE_KEY = "userReviews";

const socket = new WebSocket("wss://api.lanyard.rest/socket");
socket.addEventListener("open", () => {
  socket.send(
    JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: DISCORD_ID,
      },
    }),
  );
});

socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (
    data.op === 0 &&
    (data.t === "INIT_STATE" || data.t === "PRESENCE_UPDATE")
  ) {
    updatePresence(data.d);
  }
});

function updatePresence(d) {
  if (!d) return;
  /* DISCORD */
  if (d.discord_user) {
    // Website Favicon Discord Profile Photo
    const avatarHash = d.discord_user.avatar;
    const avatarUrl = avatarHash
      ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${avatarHash}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";
    avatarEl.src = avatarUrl;
    const favicon = document.getElementById("dynamic-favicon");
    if (favicon) {
      favicon.href = avatarUrl;
    }

    // Website Title Discord Display Name
    const displayName = d.discord_user.global_name || d.discord_user.username;
    nameEl.textContent = displayName;
    document.title = displayName;

    avatarEl.src = avatarHash
      ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${avatarHash}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    nameEl.textContent = d.discord_user.global_name || d.discord_user.username;

    const status = d.discord_status || "offline";

    statusTextEl.textContent =
      status === "online"
        ? "Online"
        : status === "idle"
          ? "Idle"
          : status === "dnd"
            ? "Rahatsız Etmeyin"
            : "Offline";

    statusDotEl.className = "status-dot " + status;
  }

  /*  SPOTIFY*/
  if (d.listening_to_spotify && d.spotify) {
    spotifyCard.style.display = "flex";

    spotifyAlbum.src = d.spotify.album_art_url;
    spotifySong.textContent = d.spotify.song;
    spotifyArtist.textContent = d.spotify.artist;
    
    // Background Blur Effect
    const blurBg = document.getElementById("spotify-blur-bg");
    if (blurBg) {
        blurBg.style.backgroundImage = `url(${d.spotify.album_art_url})`;
        blurBg.style.opacity = "1";
    }
  } else {
    spotifyCard.style.display = "none";
  }

  // Activity
  const activity = d.activities?.find(
    (a) => a.type === 0 && a.name !== "Spotify",
  );

  if (activity) {
    activityCard.style.display = "flex";

    activityName.textContent = activity.name;
    activityDetails.textContent = activity.details || activity.state || "";

    if (activity.assets?.large_image) {
      const img = activity.assets.large_image.replace("mp:", "");
      activityIcon.src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
    } else {
      activityIcon.src = "";
    }
  } else {
    activityCard.style.display = "none";
  }

  // CUSTOM STATUS BUBBLE
  const customStatus = d.activities?.find((a) => a.type === 4);

  const bubble = document.getElementById("status-bubble");
  const bubbleText = document.getElementById("status-text");
  const bubbleEmoji = document.getElementById("status-emoji");

  if (customStatus && bubble) {
    bubbleText.textContent = customStatus.state || "";

    if (customStatus.emoji) {
      if (customStatus.emoji.id) {
        bubbleEmoji.innerHTML = `
        <img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.png" />
      `;
      } else {
        bubbleEmoji.textContent = customStatus.emoji.name;
      }
    } else {
      bubbleEmoji.textContent = "";
    }

    bubble.style.display = "inline-flex";
  } else if (bubble) {
    bubble.style.display = "none";
  }
}

// GİTHUB REPOS
if (!repoList) {
  console.error("repo-list elementi bulunamadı");
} else {
  fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`GitHub API Error: ${res.status}`);
      }
      return res.json();
    })
    .then((repos) => {
      if (!Array.isArray(repos)) {
        repoList.innerHTML = "<span>GitHub API limiti doldu.</span>";
        console.error("GitHub response:", repos);
        return;
      }

      if (repos.length === 0) {
        repoList.innerHTML = "<span>Repo bulunamadı.</span>";
        return;
      }

      repoList.innerHTML = "";

      repos.slice(0, 6).forEach((repo) => {
        const repoEl = document.createElement("div");
        repoEl.className = "repo-item";

        repoEl.innerHTML = `
          <a href="${repo.html_url}" target="_blank" rel="noopener">
            ${repo.name}
          </a>
          <div class="repo-meta">
            <span style="display: flex; align-items: center; gap: 5px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="none" stroke="#fcd34d" stroke-linecap="round" stroke-linejoin="round" stroke-width="15" d="m105.7 263.5l107.5 29.9a7.9 7.9 0 0 1 5.4 5.4l29.9 107.5a7.8 7.8 0 0 0 15 0l29.9-107.5a7.9 7.9 0 0 1 5.4-5.4l107.5-29.9a7.8 7.8 0 0 0 0-15l-107.5-29.9a7.9 7.9 0 0 1-5.4-5.4l-29.9-107.5a7.8 7.8 0 0 0-15 0l-29.9 107.5a7.9 7.9 0 0 1-5.4 5.4l-107.5 29.9a7.8 7.8 0 0 0 0 15Z"><animateTransform additive="sum" attributeName="transform" calcMode="spline" dur="6s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="rotate" values="-15 256 256; 15 256 256; -15 256 256"/><animate attributeName="opacity" dur="6s" values="1; .75; 1; .75; 1; .75; 1"/></path></svg> ${repo.stargazers_count}</span>
            <span style="display: flex; align-items: center; gap: 5px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="#0328ff" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M6 6.928a1.75 1.75 0 1 0-1 0V7.5A1.5 1.5 0 0 0 6.5 9h1v1.072a1.75 1.75 0 1 0 1 0V9h1A1.5 1.5 0 0 0 11 7.5v-.572a1.75 1.75 0 1 0-1 0V7.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5Z"/></svg> ${repo.forks_count}</span>
            ${repo.language ? `<span style="display: flex; align-items: center; gap: 5px;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32"><path fill="#f7f8ff" d="M16 28h-3c-3.9 0-7-3.1-7-7v-4h2v4c0 2.8 2.2 5 5 5h3zm12 2h2.2l-4.6-11h-2.2l-4.6 11H21l.8-2h5.3zm-5.3-4l1.8-4.4l1.8 4.4zM28 15h-2v-4c0-2.8-2.2-5-5-5h-4V4h4c3.9 0 7 3.1 7 7zM14 5V3H9V1H7v2H2v2h8.2c-.2.9-.8 2.5-2.2 4c-.6-.7-1.1-1.4-1.4-2H4.3c.4 1 1.1 2.2 2.1 3.3c-.8.7-2 1.3-3.4 1.8l.7 1.9c1.8-.7 3.2-1.5 4.3-2.3c1.1.9 2.5 1.7 4.3 2.3l.7-1.9c-1.4-.5-2.6-1.2-3.5-1.8c1.9-2 2.5-4.1 2.7-5.3z"/></svg> ${repo.language}</span>` : ""}
          </div>
        `;

        repoList.appendChild(repoEl);
      });
    })
    .catch((err) => {
      console.error(err);
      repoList.innerHTML = "<span>GitHub reposu yüklenemedi.</span>";
    });
}
