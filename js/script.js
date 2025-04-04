// Funciones generales utilizadas en todo el juego

const game = {
    locations: {
        castillo: { lat: 40.520512, lng: -6.063541 },
        plaza: { lat: 40.520621, lng: -6.063455 },
        iglesia: { lat: 40.521379, lng: -6.06381 },
        fuente: { lat: 40.522185, lng: -6.064564 },
        ermita: { lat: 40.522793, lng: -6.066424 },
        puente: { lat: 40.522552, lng: -6.065858 },
        "puente-tablas": { lat: 40.5245, lng: -6.0672 },
        humilladero: { lat: 40.5232, lng: -6.0667 },
        arco: { lat: 40.5218, lng: -6.063 },
        callejon: { lat: 40.5219, lng: -6.0633 },
        escortinas: { lat: 40.5236, lng: -6.0649 }
    }
};

window.checkLocationManual = function () {
    const input = document.getElementById("location-input");
    if (!input) return;
    const valor = input.value.trim().toLowerCase();
    const paradasValidas = Object.keys(game.locations);
    if (paradasValidas.includes(valor)) {
        setStatus("✅ Confirmación manual aceptada.");
        unlockContent(valor);
    } else {
        setStatus("❌ Ese no es el nombre correcto. Elige entre las opciones propuestas.");
    }
};

window.checkLocation = function () {
    if (!navigator.geolocation) {
        return setStatus("⚠️ Geolocalización no disponible.");
    }

    setStatus("Obteniendo tu ubicación...");

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const stop = getCurrentStop();
            const ref = game.locations[stop];
            const distancia = getDistance(pos.coords.latitude, pos.coords.longitude, ref.lat, ref.lng);
            const precision = pos.coords.accuracy;

            if (distancia <= 25) {
                setStatus("✅ Ubicación verificada.");
                unlockContent();
            } else {
                setStatus(`Estás a ${Math.round(distancia)} m del lugar. Acércate. (Precisión: ${precision} m)`);
            }
        },
        (error) => {
            let errorMessage = "⚠️ Error al obtener tu posición.";
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = "⚠️ Permiso de geolocalización denegado.";
            } else if (error.code === error.TIMEOUT) {
                errorMessage = "⚠️ Tiempo de espera agotado al obtener la ubicación.";
            }
            setStatus(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

window.checkQR = function () {
    const input = document.getElementById("qr-input");
    if (!input) {
        return setStatus("❌ Introduce un código QR.");
    }

    const status = document.getElementById("qr-status");
    const valor = input.value.trim().toUpperCase();

    fetch("qr-codes.json")
        .then((response) => response.json())
        .then((data) => {
            const qrCodes = {};
            data.códigos.forEach((código) => {
                qrCodes[código.código] = código.destino;
            });

            if (qrCodes[valor]) {
                status.textContent = "✅ QR correcto. Parada desbloqueada.";
                localStorage.setItem(`${qrCodes[valor]}-discovered`, "true");
                setTimeout(() => window.location.href = qrCodes[valor] + ".html", 1500);
            } else {
                status.textContent = "❌ Código incorrecto.";
            }
        })
        .catch(() => {
            status.textContent = "⚠️ Error al cargar los códigos QR.";
        });
};

window.showHint = function (msg) {
    alert(" Pista: " + msg);
};

window.playSound = function (id) {
    const el = document.getElementById(id);
    if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
    }
};

function getCurrentStop() {
    return window.location.pathname.split("/").pop().replace(".html", "");
}

function setStatus(msg) {
    const el = document.getElementById("location-status");
    if (el) el.textContent = msg;
}

function unlockContent(nombre = null) {
    const content = document.getElementById("game-content");
    const check = document.getElementById("location-check");
    if (content) content.style.display = "block";
    if (check) check.style.display = "none";

    const stop = nombre || getCurrentStop();
    if (stop) localStorage.setItem(`${stop}-completed`, "true");

    playSound("success-sound");
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Carrusel y música
window.addEventListener("DOMContentLoaded", () => {
    const music = document.getElementById("background-music");
    const musicBtn = document.querySelector(".music-btn");
    const icon = document.querySelector(".music-icon");
    let playing = true;

    if (music && musicBtn) {
        musicBtn.addEventListener("click", () => {
            if (playing) {
                music.pause();
                icon.textContent = "";
            } else {
                music.play().catch(() => {});
                icon.textContent = "";
            }
            playing = !playing;
        });
    }

    const slides = document.querySelectorAll(".slide");
    let index = 0;

    function updateSlide(i) {
        slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    }

    document.querySelector(".prev-slide")?.addEventListener("click", () => {
        index = index > 0 ? index - 1 : slides.length - 1;
        updateSlide(index);
    });

    document.querySelector(".next-slide")?.addEventListener("click", () => {
        index = index < slides.length - 1 ? index + 1 : 0;
        updateSlide(index);
    });

    updateSlide(index);

    // Carrusel automático (opcional)
    setInterval(() => {
        index = index < slides.length - 1 ? index + 1 : 0;
        updateSlide(index);
    }, 5000); // Cambia de slide cada 5 segundos
});
