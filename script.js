document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";

    async function fetchData() {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Loaded Missions Data:", data); // Debugging: Check JSON structure
            return data;
        } catch (error) {
            console.error("Error loading JSON:", error);
            return [];
        }
    }

    let missionsData = [];

    async function populateDropdowns() {
        missionsData = await fetchData();
        if (!Array.isArray(missionsData) || missionsData.length === 0) {
            console.error("Missions data is empty or not an array.");
            return;
        }
        updateMissions();
    }

    function updateMissions() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        console.log("Selected Playstyle:", selectedPlaystyle); // Debugging

        if (!Array.isArray(missionsData)) {
            console.error("Missions data is not an array:", missionsData);
            return;
        }

        const filteredMissions = missionsData.filter(m => m.category === selectedPlaystyle);
        console.log("Filtered Missions:", filteredMissions); // Debugging

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            dropdown.innerHTML = ""; 

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select an option";
            defaultOption.value = "";
            dropdown.appendChild(defaultOption);

            if (filteredMissions.length === 0) {
                console.warn(`No missions found for ${selectedPlaystyle}.`);
                continue;
            }

            filteredMissions.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id || item.name;
                option.textContent = item.name;
                dropdown.appendChild(option);
            });
        }
    }

    function submitSelections() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        const selections = {};
        let hasSelection = false;

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            if (dropdown.value) {
                selections[`week${week}`] = dropdown.value;
                hasSelection = true;
            }
        }

        if (!hasSelection) {
            console.log("No selections made. Aborting update.");
            return;
        }

        fetch("https://mission-organizer-default-rtdb.firebaseio.com/selections.json", {
            method: "PATCH",
            body: JSON.stringify({ [selectedPlaystyle]: selections }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Selections updated:", data))
        .catch(error => console.error("Error updating selections:", error));
    }

    window.updateMissions = updateMissions;

    populateDropdowns();
});
