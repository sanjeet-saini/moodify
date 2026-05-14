var audio = new Audio()
var audioContext
var analyser
var sourceNode
var frequencyData

// DOM elements used by the player UI, playlist, mood engine, and visual effects.
var allsong = document.querySelector("#allsong")
var selectedsong = 0
var discArt = document.querySelector("#disc-art")
var play = document.querySelector(".playbtn")
var back = document.querySelector(".backward")
var forward = document.querySelector(".forward")
var appBg = document.querySelector(".app-bg")
var currentTitle = document.querySelector("#current-title")
var currentTime = document.querySelector("#current-time")
var totalTime = document.querySelector("#total-time")
var progress = document.querySelector("#progress")
var playlistTitle = document.querySelector("#playlist-title")
var confidenceScore = document.querySelector("#confidence-score")
var aiInsight = document.querySelector("#ai-insight")
var moodForm = document.querySelector("#mood-form")
var moodInput = document.querySelector("#mood-input")
var emojiGrid = document.querySelector("#emoji-grid")
var moodChips = document.querySelector("#mood-chips")
var recommendations = document.querySelector("#recommendations")
var categoryTabs = document.querySelector("#category-tabs")
var categoryCards = document.querySelector("#category-cards")
var songSearch = document.querySelector("#song-search")
var voiceBtn = document.querySelector("#voice-btn")
var volumeSlider = document.querySelector("#volume-slider")
var volumeIcon = document.querySelector("#volume-icon")
var visualizer = document.querySelector("#visualizer")
var visualizerCtx = visualizer.getContext("2d")
var particleCanvas = document.querySelector("#mood-particles")
var particleCtx = particleCanvas.getContext("2d")
var miniArt = document.querySelector("#mini-art")
var miniTitle = document.querySelector("#mini-title")
var isPlaying = false
var activeMood = "bhakti"
var activeCategory = "all"
var searchQuery = ""
var particles = []
var gestureStartX = 0
var listeningStats = JSON.parse(localStorage.getItem("moodsync-stats") || "{}")
var savedVolume = Number(localStorage.getItem("moodsync-volume") || 80)
var favoriteSongs = JSON.parse(localStorage.getItem("moodsync-favorites") || "[]")

// Mood profiles drive AI text detection, UI labels, recommendation chips, and theme text.
var moodProfiles = {
    chill: {
        label: "Chill / Relax",
        emoji: "😌",
        words: ["chill", "relax", "calm", "peace", "soft", "slow", "tired", "rest"],
        chips: ["ambient waves", "slow particles", "soft glow"],
        insight: "AI softened the atmosphere for relaxed breathing and low-energy listening.",
    },
    sad: {
        label: "Sad / Emotional",
        emoji: "💔",
        words: ["sad", "lonely", "alone", "cry", "heartbreak", "miss", "emotional", "broken", "hurt"],
        chips: ["cinematic rain", "glass blur", "slow transitions"],
        insight: "AI detected emotional language and moved into a darker cinematic space.",
    },
    romantic: {
        label: "Romantic",
        emoji: "❤️",
        words: ["love", "romantic", "crush", "date", "heart", "dreamy", "beautiful", "couple"],
        chips: ["pink bloom", "dream particles", "soft pulse"],
        insight: "AI found romantic intent and warmed the player with soft cinematic bloom.",
    },
    gym: {
        label: "Gym / Aggressive",
        emoji: "🔥",
        words: ["gym", "workout", "angry", "rage", "aggressive", "energy", "beast", "fire", "pump", "motivation", "motivational"],
        chips: ["bass pulse", "red neon", "fast visualizer"],
        insight: "AI boosted the interface for high-energy aggressive listening.",
    },
    happy: {
        label: "Happy / Party",
        emoji: "🎉",
        words: ["happy", "party", "dance", "fun", "celebrate", "excited", "vibe", "enjoy"],
        chips: ["bright sparks", "dance energy", "party motion"],
        insight: "AI detected upbeat intent and switched to a playful party atmosphere.",
    },
    bhakti: {
        label: "Bhakti / Spiritual",
        emoji: "🙏",
        words: ["bhakti", "spiritual", "god", "krishna", "ram", "hanuman", "temple", "prayer", "peace"],
        chips: ["golden aura", "light rays", "devotional calm"],
        insight: "Devotional songs are creating a calm spiritual aura.",
    },
}

// Main music library. Add new local files here with url, image, category, and matching moods.
let arr = [
    { songName: "Bairan", url: "media/bairan.mp4", img: "media/bairan.jpeg", vibe: "deep romantic emotion", category: "Romantic", moods: ["romantic", "sad", "chill"] },
    { songName: "Churake", url: "media/Churake.mp4", img: "media/churake.jpeg", vibe: "soft romantic pop", category: "Romantic", moods: ["romantic", "chill", "happy"] },
    { songName: "Dooron Dooron", url: "media/Dooron - dooron.mp4", img: "media/Dooron - dooron.jpeg", vibe: "lofi long-distance mood", category: "Lofi", moods: ["chill", "sad"] },
    { songName: "Finding Her", url: "media/Finding Her.mp4", img: "media/Finding Her.jpeg", vibe: "dreamy romantic", category: "Romantic", moods: ["romantic", "chill"] },
    { songName: "Ishq", url: "media/Ishq.mp4", img: "media/ishq_.jpeg", vibe: "love song", category: "Romantic", moods: ["romantic", "happy"] },
    { songName: "Mann Mera", url: "media/Mann Mera.mp4", img: "media/Mann_mera.jpeg", vibe: "emotional romantic", category: "Emotional", moods: ["sad", "romantic"] },
    { songName: "Pal Pal", url: "media/Pal Pal.mp4", img: "media/pal_pal.jpeg", vibe: "warm happy romance", category: "Happy", moods: ["happy", "romantic", "chill"] },
    { songName: "Pasoori", url: "media/Pasoori _ Ali Sethi x Shae Gill 144p.mp4", img: "media/passori.jpeg", vibe: "party fusion vibe", category: "Happy", moods: ["happy", "romantic"] },
    { songName: "Sahiba", url: "media/Sahiba.mp4", img: "media/shaiba.jpeg", vibe: "soft emotional love", category: "Emotional", moods: ["sad", "romantic", "chill"] },
    { songName: "Tu Hai Kahan", url: "media/Tu Hai Kahan.mp4", img: "media/tu_hai_kaha.jpeg", vibe: "sad emotional", category: "Sad", moods: ["sad", "romantic"] },
    { songName: "Vilen - Kyun Dhunde", url: "media/Vilen.mp4", img: "media/kyun dhunde.jpeg", vibe: "lonely emotional mood", category: "Sad", moods: ["sad", "chill"] },
    { songName: "Wishes", url: "media/Wishes.mp4", img: "media/wishes (3).jpeg", vibe: "soft romantic mood", category: "Romantic", moods: ["romantic", "chill"] },
    { songName: "Vilen", url: "media/Vilen.mp4", img: "media/kyun dhunde.jpeg", vibe: "moody emotional", category: "Sad", moods: ["sad"] },
    { songName: "Apa Fer Milaange", url: "media/Apa Fer Milaange.mp4", img: "media/appa fer milanga.jpeg", vibe: "emotional reunion", category: "Emotional", moods: ["sad", "romantic"] },
    { songName: "Haseen - Talwiinder", url: "media/HASEEN - TALWIINDER,.mp4", img: "media/hassen.jpeg", vibe: "smooth romantic vibe", category: "Romantic", moods: ["romantic", "chill"] },
    { songName: "Ishqa Ve", url: "media/Ishqa Ve.mp4", img: "media/ishqa ve.jpeg", vibe: "soft love song", category: "Romantic", moods: ["romantic", "chill"] },
    { songName: "Jine Laga Hu", url: "media/jine laga hu.mp4", img: "media/jine laga hu.jpeg", vibe: "happy romantic", category: "Happy", moods: ["happy", "romantic"] },
    { songName: "Kahani Suno 2.0", url: "media/Kahani Suno 2.0.mp4", img: "media/kahani suno 2.0.jpeg", vibe: "deep emotional", category: "Emotional", moods: ["sad", "romantic"] },
    { songName: "Maand", url: "media/Maand (Lyrics).mp4", img: "media/maand.jpeg", vibe: "calm soulful", category: "Lofi", moods: ["chill", "sad"] },
    { songName: "Nahin Milta", url: "media/Nahin Milta.mp4", img: "media/nahi milta.jpeg", vibe: "heartbreak emotional", category: "Sad", moods: ["sad"] },
    { songName: "Saiyyan", url: "media/saiyyan.mp4", img: "media/saiyaan.jpeg", vibe: "romantic soulful", category: "Romantic", moods: ["romantic", "sad", "chill"] },
    { songName: "Achyutam Keshavam", url: "media/Achyutam Keshavam.mp4", img: "media/achutam keshvam.jpeg", vibe: "peaceful devotional", category: "Bhakti", moods: ["bhakti", "chill"] },
    { songName: "Hanuman Chalisa", url: "media/Hanuman Chalisa.mp4", img: "media/hanuman chalisa.jpeg", vibe: "powerful devotional", category: "Bhakti", moods: ["bhakti", "gym"] },
    { songName: "Har Har Shambhu", url: "media/Har Har Shambhu.mp4", img: "media/har har shambu.jpeg", vibe: "energetic bhakti", category: "Bhakti", moods: ["bhakti", "gym"] },
    { songName: "Har Har Mahadev", url: "media/har har mahadev.mp4", img: "media/har hsr mahadev.jpeg", vibe: "devotional power", category: "Bhakti", moods: ["bhakti", "gym"] },
    { songName: "Mere Ghar Ram Aaye Hain", url: "media/Mere Ghar Ram Aaye Hain.mp4", img: "media/mere ghr ram aye hai.jpeg", vibe: "ram bhakti", category: "Bhakti", moods: ["bhakti", "happy"] },
    { songName: "Ram Siya Ram", url: "media/ram siya ram.mp4", img: "media/ram siya ram.jpeg", vibe: "soft devotional", category: "Bhakti", moods: ["bhakti", "chill"] },
    { songName: "Shiv Tandav Stotram", url: "media/shiv tandav stotram.mp4", img: "media/shiv tandav stotram.jpeg", vibe: "intense devotional", category: "Bhakti", moods: ["bhakti", "gym"] },
    { songName: "Apna Time Aayega", url: "media/Apna Time Aayega.mp4", img: "media/apna time ayega.jpeg", vibe: "motivational rap", category: "Gym", moods: ["gym", "happy"] },
    { songName: "Brothers Anthem", url: "media/Brothers Anthem.mp4", img: "media/jiska song se name match na kare uspe ye image laga lena.jpeg", vibe: "training motivation", category: "Gym", moods: ["gym"] },
    { songName: "Kar Har Maidaan Fateh", url: "media/Kar Har Maidaan Fateh.mp4", img: "media/kr har medan fateh.jpeg", vibe: "motivational anthem", category: "Gym", moods: ["gym", "sad"] },
    { songName: "Sultan", url: "media/Sultan.mp4", img: "media/sultan.jpeg", vibe: "sports motivation", category: "Gym", moods: ["gym"] },
    { songName: "Zinda", url: "media/Zinda.mp4", img: "media/jiska song se name match na kare uspe ye image laga lena.jpeg", vibe: "motivational energy", category: "Gym", moods: ["gym"] },
    { songName: "Badtameez Dil", url: "media/Badtameez Dil.mp4", img: "media/badtamezz dil.jpeg", vibe: "party dance", category: "Happy", moods: ["happy", "gym"] },
    { songName: "Chogada", url: "media/Chogada.mp4", img: "media/jiska song se name match na kare uspe ye image laga lena.jpeg", vibe: "garba party", category: "Happy", moods: ["happy"] },
    { songName: "Ilahi", url: "media/Ilahi.mp4", img: "media/illahi.jpeg", vibe: "fresh happy journey", category: "Happy", moods: ["happy", "chill"] },
    { songName: "Kala Chashma", url: "media/Kala Chashma.mp4", img: "media/kala chasma.jpeg", vibe: "party banger", category: "Happy", moods: ["happy", "gym"] },
    { songName: "Nachde Ne Saare", url: "media/Nachde Ne Saare.mp4", img: "media/nach de ne sare.jpeg", vibe: "wedding party", category: "Happy", moods: ["happy", "romantic"] },
    { songName: "Channa Mereya", url: "media/Channa Mereya.mp4", img: "media/chana mereya.jpeg", vibe: "heartbreak emotional", category: "Emotional", moods: ["sad", "romantic"] },
    { songName: "Tum Saath Ho", url: "media/Tum Saath Ho.mp4", img: "media/tum sath ho.jpeg", vibe: "deep emotional love", category: "Emotional", moods: ["sad", "romantic"] },
    { songName: "Falak Tak", url: "media/Falak Tak Chal Sath Mere __ ( Slowed + Reverb ) _ Lyrics _ Lofi _ Lofi Song _.mp4", img: "media/falak tak.jpeg", vibe: "slowed romantic lofi", category: "Lofi", moods: ["chill", "romantic"] },
    { songName: "Feelings of Love", url: "media/lofiFeelings of Love J.mp4", img: "media/lofi vibes.jpeg", vibe: "soft love lofi", category: "Lofi", moods: ["chill", "romantic"] },
    { songName: "Mind Relax Lofi Mashup", url: "media/Mind Relax Lofi Mashup.mp4", img: "media/mind realx lofi.jpeg", vibe: "relaxing lofi", category: "Lofi", moods: ["chill"] },
    { songName: "Non-Stop Trending Lofi", url: "media/Non-Stop Trending Lofi.mp4", img: "media/lofi vibess.jpeg", vibe: "trending lofi mix", category: "Lofi", moods: ["chill", "happy"] },
    { songName: "Romantic Lofi", url: "media/Romantic Lofi.mp4", img: "media/lofi.jpeg", vibe: "romantic lofi mix", category: "Lofi", moods: ["chill", "romantic"] },
    { songName: "Love Mashup", url: "media/NON STOP INSTAGRAM TRENDING LOVE MASHUP.mp4", img: "media/lofii.jpeg", vibe: "romantic mashup", category: "Romantic", moods: ["romantic", "happy"] },
    { songName: "Yeh Tune Kya Kiya Lofi", url: "media/Yeh Tune Kya Kiya _lofi.mp4", img: "media/ye tune kaya kiya.jpeg", vibe: "romantic lofi", category: "Romantic", moods: ["romantic", "chill"] },
]

// Categories power the tabs and the mood collection cards.
var categories = ["all", "Favorites", "Lofi", "Happy", "Sad", "Emotional", "Gym", "Bhakti", "Romantic"]
var categoryMeta = {
    Lofi: { emoji: "😌", mood: "chill", bg: "linear-gradient(145deg, #2b6cff, #8a5cff)" },
    Happy: { emoji: "🎉", mood: "happy", bg: "linear-gradient(145deg, #ffcf33, #35f5a4)" },
    Sad: { emoji: "💔", mood: "sad", bg: "linear-gradient(145deg, #182039, #5b6f9f)" },
    Emotional: { emoji: "🌧️", mood: "sad", bg: "linear-gradient(145deg, #101727, #8b6cff)" },
    Gym: { emoji: "🔥", mood: "gym", bg: "linear-gradient(145deg, #ff3b30, #ff9f0a)" },
    Bhakti: { emoji: "🙏", mood: "bhakti", bg: "linear-gradient(145deg, #b7791f, #ffe08a)" },
    Romantic: { emoji: "❤️", mood: "romantic", bg: "linear-gradient(145deg, #ff75ba, #9b5cff)" },
}

function formatDuration(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "--:--"

    var minutes = Math.floor(seconds / 60)
    var remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
}

function runGsapAnimation(target, vars) {
    if (window.gsap) window.gsap.fromTo(target, vars.from, vars.to)
}

function updateProgressBar(value) {
    progress.value = value
    progress.style.setProperty("--progress", `${value}%`)
}

function updateVolume(value) {
    var volume = Number(value) / 100

    audio.volume = volume
    volumeSlider.value = value
    volumeSlider.style.setProperty("--volume", `${value}%`)
    localStorage.setItem("moodsync-volume", String(value))

    if (volume === 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark"
    } else if (volume < 0.45) {
        volumeIcon.className = "fa-solid fa-volume-low"
    } else {
        volumeIcon.className = "fa-solid fa-volume-high"
    }
}

function getRecommendedSongs(mood) {
    // Songs with matching mood tags come first; category matches are the fallback.
    return arr
        .map(function (song, index) {
            return {
                song: song,
                index: index,
                score: song.moods.includes(mood) ? 3 : song.category.toLowerCase() === mood ? 2 : 1,
            }
        })
        .sort(function (a, b) {
            return b.score - a.score
        })
}

function recordMoodBehavior(mood) {
    // Small learning layer: repeated moods get a recommendation boost next time.
    listeningStats[mood] = (listeningStats[mood] || 0) + 1
    localStorage.setItem("moodsync-stats", JSON.stringify(listeningStats))
}

function isFavorite(index) {
    return favoriteSongs.includes(index)
}

function saveFavorites() {
    localStorage.setItem("moodsync-favorites", JSON.stringify(favoriteSongs))
}

function toggleFavorite(index) {
    if (isFavorite(index)) {
        favoriteSongs = favoriteSongs.filter(function (songIndex) {
            return songIndex !== index
        })
    } else {
        favoriteSongs.push(index)
    }

    saveFavorites()
    renderSongs()
    renderCategoryCards()
    renderMoodPanel()
}

function matchesSearch(song) {
    if (!searchQuery) return true

    var query = searchQuery.toLowerCase()
    return [
        song.songName,
        song.vibe,
        song.category,
        song.moods.join(" "),
    ].join(" ").toLowerCase().includes(query)
}

function detectMoodFromText(text) {
    // Scores typed/voice text with mood keywords, listening history, and time of day.
    var cleanText = text.toLowerCase()
    var scores = {}

    Object.keys(moodProfiles).forEach(function (mood) {
        scores[mood] = 0
        moodProfiles[mood].words.forEach(function (word) {
            if (cleanText.includes(word)) scores[mood] += 3
        })
        scores[mood] += Math.min(listeningStats[mood] || 0, 4) * 0.4
    })

    var hour = new Date().getHours()
    if (hour >= 5 && hour <= 7) scores.bhakti += 1.5
    if (hour >= 22 || hour <= 4) scores.chill += 1.5

    if (!text.trim()) {
        var historyWinner = Object.keys(listeningStats).sort(function (a, b) {
            return (listeningStats[b] || 0) - (listeningStats[a] || 0)
        })[0]
        return moodProfiles[historyWinner] ? historyWinner : (hour >= 22 ? "chill" : "bhakti")
    }

    return Object.keys(scores).sort(function (a, b) {
        return scores[b] - scores[a]
    })[0]
}

function updateControls() {
    play.innerHTML = isPlaying
        ? `<i class="fa-solid fa-circle-pause"></i>`
        : `<i class="fa-solid fa-circle-play"></i>`

    back.style.opacity = selectedsong === 0 ? 0.45 : 1
    forward.style.opacity = selectedsong === arr.length - 1 ? 0.45 : 1
    document.body.classList.toggle("playing", isPlaying)
}

function updateNowPlaying() {
    // Sync one selected song everywhere: audio source, disc image, mini player, and background.
    var song = arr[selectedsong]

    audio.src = song.url
    discArt.src = song.img
    appBg.style.setProperty("--poster-bg", `url(${song.img})`)
    currentTitle.textContent = song.songName
    totalTime.textContent = song.duration || "--:--"
    currentTime.textContent = "0:00"
    miniArt.src = song.img
    miniTitle.textContent = song.songName
    updateProgressBar(0)
}

function renderSongs() {
    // Builds the all-songs library for the active category tab.
    var clutter = ""
    var visibleSongs = arr.map(function (song, index) {
        return { song: song, index: index }
    }).filter(function (item) {
        if (activeCategory === "Favorites") return isFavorite(item.index)
        if (activeCategory === "all") return true
        return item.song.category === activeCategory
    }).filter(function (item) {
        return matchesSearch(item.song)
    })

    visibleSongs.forEach(function (item) {
        var elem = item.song
        var idx = item.index
        var favoriteClass = isFavorite(idx) ? "active" : ""
        var favoriteIcon = isFavorite(idx) ? "fa-solid" : "fa-regular"

        clutter += `<div class="songcard ${idx === selectedsong ? "active" : ""}" data-index="${idx}">
    <div class="part1">
        <img src="${elem.img}" alt="${elem.songName}">
        <div class="track-meta">
            <h2>${elem.songName}</h2>
            <p>${elem.vibe}</p>
            <span class="category-badge">${elem.category}</span>
        </div>
    </div>
    <div class="song-actions">
        <button class="favorite-btn ${favoriteClass}" data-favorite-index="${idx}" type="button" aria-label="Toggle favorite">
            <i class="${favoriteIcon} fa-heart"></i>
        </button>
        <h6 data-duration-index="${idx}">${elem.duration || "--:--"}</h6>
    </div>
</div>`
    })

    allsong.innerHTML = clutter || `<div class="empty-state">${searchQuery ? "No songs match your search." : "No songs in this category yet."}</div>`
}

function renderCategoryTabs() {
    categoryTabs.innerHTML = categories.map(function (category) {
        return `<button class="${category === activeCategory ? "active" : ""}" data-category="${category}" type="button">${category}</button>`
    }).join("")
}

function renderCategoryCards() {
    // Builds one collection card per mood category and lists its songs inside the card.
    categoryCards.innerHTML = categories.filter(function (category) {
        return category !== "all" && category !== "Favorites"
    }).map(function (category) {
        var meta = categoryMeta[category]
        var songs = arr.filter(function (song) {
            return song.category === category
        })
        var songRows = songs.map(function (song) {
            var songIndex = arr.indexOf(song)
            var favoriteClass = isFavorite(songIndex) ? "active" : ""
            var favoriteIcon = isFavorite(songIndex) ? "fa-solid" : "fa-regular"

            return `<button class="collection-song ${songIndex === selectedsong ? "active" : ""}" data-index="${songIndex}" type="button">
                <img src="${song.img}" alt="${song.songName}">
                <span>
                    <strong>${song.songName}</strong>
                    <small>${song.vibe}</small>
                </span>
                <i class="fa-solid fa-play"></i>
                <span class="collection-favorite ${favoriteClass}" data-favorite-index="${songIndex}" role="button" aria-label="Toggle favorite">
                    <i class="${favoriteIcon} fa-heart"></i>
                </span>
            </button>`
        }).join("")

        return `<article class="collection-card ${category === activeCategory ? "active" : ""}" data-category="${category}" style="--card-bg: ${meta.bg}">
            <button class="collection-head" data-category="${category}" type="button">
                <span class="emoji">${meta.emoji}</span>
                <span>
                    <h4>${category}</h4>
                    <p>${songs.length} songs in this mood</p>
                </span>
            </button>
            <div class="collection-song-list">
                ${songRows || `<div class="collection-empty">Songs coming soon</div>`}
            </div>
        </article>`
    }).join("")
}

function renderMoodPanel() {
    // Updates the AI panel with confidence, chips, and three smart recommendations.
    var profile = moodProfiles[activeMood]
    var recommended = getRecommendedSongs(activeMood)

    playlistTitle.textContent = profile.label
    confidenceScore.textContent = `${Math.min(98, 84 + (listeningStats[activeMood] || 0) * 2)}%`
    aiInsight.textContent = profile.insight
    moodChips.innerHTML = profile.chips.map(function (chip) {
        return `<span>${chip}</span>`
    }).join("")
    recommendations.innerHTML = recommended.slice(0, 3).map(function (item) {
        var favoriteClass = isFavorite(item.index) ? "active" : ""
        var favoriteIcon = isFavorite(item.index) ? "fa-solid" : "fa-regular"

        return `<div class="rec-item" data-index="${item.index}">
            <div>
                <h4>${item.song.songName}</h4>
                <p>${profile.emoji} ${item.song.vibe}</p>
            </div>
            <button class="favorite-btn ${favoriteClass}" data-favorite-index="${item.index}" type="button" aria-label="Toggle favorite">
                <i class="${favoriteIcon} fa-heart"></i>
            </button>
        </div>`
    }).join("")

    emojiGrid.querySelectorAll("button").forEach(function (button) {
        button.classList.toggle("active", button.dataset.mood === activeMood)
    })
}

function refreshUI() {
    // Central repaint function after mood, category, or song changes.
    document.body.dataset.mood = activeMood
    updateNowPlaying()
    renderCategoryTabs()
    renderCategoryCards()
    renderSongs()
    renderMoodPanel()
    updateControls()
    buildParticles()

    runGsapAnimation("#left", {
        from: { scale: 0.92, rotate: -8, opacity: 0.65 },
        to: { scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
    })
    runGsapAnimation(".mood-card, .recommend-card, .playlist-panel", {
        from: { y: 12, opacity: 0.75 },
        to: { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "power3.out" },
    })
}

function selectMood(mood, shouldAutoplay) {
    activeMood = mood
    recordMoodBehavior(mood)
    selectedsong = getRecommendedSongs(mood)[0].index
    refreshUI()
    if (shouldAutoplay) playSelectedSong()
}

function playSelectedSong() {
    setupAudioVisualizer()
    isPlaying = true
    refreshUI()
    audio.play()
}

function updateDurationText(index) {
    var durationElement = document.querySelector(`[data-duration-index="${index}"]`)
    if (durationElement && arr[index].duration) durationElement.textContent = arr[index].duration
    if (index === selectedsong) totalTime.textContent = arr[index].duration
}

function loadSongDurationForIndex(index) {
    var durationAudio = new Audio(arr[index].url)
    durationAudio.addEventListener("loadedmetadata", function () {
        arr[index].duration = formatDuration(durationAudio.duration)
        updateDurationText(index)
    })
}

function loadSongDurations() {
    arr.forEach(function (song, index) {
        loadSongDurationForIndex(index)
    })
}

function setupAudioVisualizer() {
    // Connects the audio element to Web Audio so the waveform reacts to the real song.
    if (audioContext) return

    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    frequencyData = new Uint8Array(analyser.frequencyBinCount)
    sourceNode = audioContext.createMediaElementSource(audio)
    sourceNode.connect(analyser)
    analyser.connect(audioContext.destination)
}

function resizeCanvases() {
    visualizer.width = visualizer.offsetWidth * window.devicePixelRatio
    visualizer.height = visualizer.offsetHeight * window.devicePixelRatio
    particleCanvas.width = window.innerWidth * window.devicePixelRatio
    particleCanvas.height = window.innerHeight * window.devicePixelRatio
}

function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim()
}

function drawVisualizer() {
    // Runs continuously; when paused it shows ambient motion, when playing it follows audio.
    requestAnimationFrame(drawVisualizer)
    var width = visualizer.width
    var height = visualizer.height
    visualizerCtx.clearRect(0, 0, width, height)

    if (analyser && isPlaying) {
        analyser.getByteFrequencyData(frequencyData)
    }

    var bars = frequencyData || new Uint8Array(48)
    var barWidth = width / bars.length
    var accent = cssVar("--accent")
    var accentTwo = cssVar("--accent-2")

    for (var i = 0; i < bars.length; i++) {
        var value = isPlaying ? bars[i] : 28 + Math.sin(Date.now() / 500 + i) * 14
        var barHeight = Math.max(8, (value / 255) * height * 0.78)
        var x = i * barWidth
        var y = height - barHeight
        var gradient = visualizerCtx.createLinearGradient(0, y, 0, height)

        gradient.addColorStop(0, accentTwo)
        gradient.addColorStop(1, accent)
        visualizerCtx.fillStyle = gradient
        visualizerCtx.fillRect(x + 2, y, Math.max(2, barWidth - 4), barHeight)
    }
}

function buildParticles() {
    // Particle density and speed change with the active emotional theme.
    var moodIntensity = activeMood === "gym" ? 95 : 62
    particles = Array.from({ length: moodIntensity }, function () {
        return {
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            r: (Math.random() * 2.6 + 0.8) * window.devicePixelRatio,
            vx: (Math.random() - 0.5) * (activeMood === "gym" ? 2.2 : 0.55),
            vy: (Math.random() - 0.5) * (activeMood === "sad" || activeMood === "chill" ? 1.2 : 0.6),
        }
    })
}

function drawParticles() {
    requestAnimationFrame(drawParticles)
    var width = particleCanvas.width
    var height = particleCanvas.height
    particleCtx.clearRect(0, 0, width, height)
    particleCtx.fillStyle = cssVar("--accent")

    particles.forEach(function (particle) {
        particle.x += particle.vx
        particle.y += activeMood === "sad" || activeMood === "chill" ? Math.abs(particle.vy) : particle.vy

        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        particleCtx.globalAlpha = 0.68
        particleCtx.beginPath()
        particleCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
        particleCtx.fill()
    })
    particleCtx.globalAlpha = 1
}

function initByTime() {
    var hour = new Date().getHours()
    if (hour >= 5 && hour <= 7) return "bhakti"
    if (hour >= 22 || hour <= 4) return "chill"
    return "bhakti"
}

// Initial app boot: choose a time-based mood, render UI, preload durations, start visuals.
resizeCanvases()
selectedsong = 0
activeMood = arr[selectedsong].moods[0]
updateVolume(savedVolume)
refreshUI()
loadSongDurations()
drawVisualizer()
drawParticles()

if (window.gsap) {
    window.gsap.from(".topbar", { y: -20, opacity: 0, duration: 0.7, ease: "power3.out" })
    window.gsap.from(".hero-player", { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 })
    window.gsap.from(".ai-panel", { y: 28, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 })
    window.gsap.from(".floating-controls, .mini-player", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.35 })
}

// User interactions: mood input, categories, song cards, controls, voice, gestures, keys.
moodForm.addEventListener("submit", function (event) {
    event.preventDefault()
    selectMood(detectMoodFromText(moodInput.value), true)
})

emojiGrid.addEventListener("click", function (event) {
    var button = event.target.closest("button")
    if (!button) return
    selectMood(button.dataset.mood, true)
})

categoryTabs.addEventListener("click", function (event) {
    var button = event.target.closest("button")
    if (!button) return

    activeCategory = button.dataset.category
    renderCategoryTabs()
    renderCategoryCards()
    renderSongs()
})

categoryCards.addEventListener("click", function (event) {
    var favoriteButton = event.target.closest("[data-favorite-index]")

    if (favoriteButton) {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(Number(favoriteButton.dataset.favoriteIndex))
        return
    }

    var songButton = event.target.closest(".collection-song")

    if (songButton) {
        selectedsong = Number(songButton.dataset.index)
        activeCategory = arr[selectedsong].category
        activeMood = categoryMeta[activeCategory].mood
        recordMoodBehavior(activeMood)
        playSelectedSong()
        return
    }

    var head = event.target.closest(".collection-head")
    if (!head) return

    activeCategory = head.dataset.category
    activeMood = categoryMeta[activeCategory].mood
    refreshUI()
})

recommendations.addEventListener("click", function (event) {
    var favoriteButton = event.target.closest("[data-favorite-index]")

    if (favoriteButton) {
        event.stopPropagation()
        toggleFavorite(Number(favoriteButton.dataset.favoriteIndex))
        return
    }

    var item = event.target.closest(".rec-item")
    if (!item) return
    selectedsong = Number(item.dataset.index)
    playSelectedSong()
})

allsong.addEventListener("click", function (event) {
    var favoriteButton = event.target.closest("[data-favorite-index]")

    if (favoriteButton) {
        event.stopPropagation()
        toggleFavorite(Number(favoriteButton.dataset.favoriteIndex))
        return
    }

    var songCard = event.target.closest(".songcard")
    if (!songCard) return
    selectedsong = Number(songCard.dataset.index)
    activeMood = arr[selectedsong].moods[0]
    recordMoodBehavior(activeMood)
    playSelectedSong()
})

songSearch.addEventListener("input", function () {
    searchQuery = songSearch.value.trim()
    renderSongs()
})

play.addEventListener("click", function () {
    setupAudioVisualizer()
    if (!isPlaying) {
        isPlaying = true
        updateControls()
        audio.play()
    } else {
        isPlaying = false
        updateControls()
        audio.pause()
    }
})

forward.addEventListener("click", function () {
    var recommended = getRecommendedSongs(activeMood)
    var currentPosition = recommended.findIndex(function (item) {
        return item.index === selectedsong
    })
    var next = recommended[currentPosition + 1] || recommended[0]
    selectedsong = next.index
    playSelectedSong()
})

back.addEventListener("click", function () {
    var recommended = getRecommendedSongs(activeMood)
    var currentPosition = recommended.findIndex(function (item) {
        return item.index === selectedsong
    })
    var previous = recommended[currentPosition - 1] || recommended[recommended.length - 1]
    selectedsong = previous.index
    playSelectedSong()
})

progress.addEventListener("input", function () {
    if (!audio.duration) return
    audio.currentTime = (progress.value / 100) * audio.duration
})

volumeSlider.addEventListener("input", function () {
    updateVolume(volumeSlider.value)
})

audio.addEventListener("timeupdate", function () {
    if (!audio.duration) return

    var progressValue = (audio.currentTime / audio.duration) * 100
    currentTime.textContent = formatDuration(audio.currentTime)
    totalTime.textContent = formatDuration(audio.duration)
    updateProgressBar(progressValue)
})

audio.addEventListener("ended", function () {
    forward.click()
})

voiceBtn.addEventListener("click", function () {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
        aiInsight.textContent = "Voice mood input is not supported in this browser. Type your mood instead."
        return
    }

    var recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.start()
    aiInsight.textContent = "Listening for your mood..."

    recognition.onresult = function (event) {
        var transcript = event.results[0][0].transcript
        moodInput.value = transcript
        selectMood(detectMoodFromText(transcript), true)
    }
})

window.addEventListener("resize", function () {
    resizeCanvases()
    buildParticles()
})

document.querySelector(".hero-player").addEventListener("pointerdown", function (event) {
    gestureStartX = event.clientX
})

document.querySelector(".hero-player").addEventListener("pointerup", function (event) {
    var distance = event.clientX - gestureStartX

    if (Math.abs(distance) < 60) return
    if (distance < 0) forward.click()
    if (distance > 0) back.click()
})

window.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault()
        play.click()
    }

    if (event.code === "ArrowRight") forward.click()
    if (event.code === "ArrowLeft") back.click()
})
