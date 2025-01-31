document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";
    const firebaseUrl = "https://mission-organizer-default-rtdb.firebaseio.com/selections.json";
    const correctHash = "61e1220a1c7991fd31c7551c469406e79b38e6fcbe0a7c3e8971fdf08a2af4b8"; // SHA-256 hash of "CloudyRainForest5"

    async function fetchMissions() {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error loading JSON:", error);
            return [];
        }
    }

    let missionsData = []; // Stores missions from JSON

    async function populateDropdowns() {
        missionsData = await fetchMissions();
        if (!Array.isArray(missionsData) || missionsData.length === 0) {
            console.error("Missions data is empty or not an array.");
            return;
        }

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            dropdown.innerHTML = ""; // Clear existing options

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select an option";
            defaultOption.value = "";
            dropdown.appendChild(defaultOption);

            missionsData.forEach((mission) => {
                const option = document.createElement("option");
                option.value = mission.name;
                option.textContent = mission.name;
                dropdown.appendChild(option);
            });
        }
    }

    async function checkPassword() {
        const passwordInput = document.getElementById("passwordInput").value;
        const encoder = new TextEncoder();
        const data = encoder.encode(passwordInput);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        if (hashHex === correctHash) {
            document.getElementById("authSection").style.display = "none";
            document.getElementById("mainContent").style.display = "block";
        } else {
            alert("Incorrect password.");
        }
    }

    function submitSelections() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        const selections = {};
    
        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            selections[`week${week}`] = dropdown.value.trim() !== "" ? dropdown.value : null;
        }
    
        fetch(firebaseUrl, {
            method: "PATCH", // Use PATCH to update only selected playstyle
            body: JSON.stringify({ [selectedPlaystyle]: selections }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Selections updated:", data))
        .catch(error => console.error("Error updating selections:", error));
    }
    
    window.checkPassword = checkPassword;
    window.submitSelections = submitSelections;
    populateDropdowns();
});
