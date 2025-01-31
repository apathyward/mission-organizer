document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";
    const firebaseUrl = "https://mission-organizer-default-rtdb.firebaseio.com/selections.json";

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

    function submitSelections() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        const selections = {};

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            if (dropdown.value) {
                selections[`week${week}`] = dropdown.value;
            }
        }

        if (Object.keys(selections).length === 0) {
            console.log("No selections made. Aborting update.");
            return;
        }

        fetch(firebaseUrl, {
            method: "PATCH", // Only updates the selected playstyle
            body: JSON.stringify({ [selectedPlaystyle]: selections }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Selections updated:", data))
        .catch(error => console.error("Error updating selections:", error));
    }

    window.submitSelections = submitSelections;
    populateDropdowns();
});
