document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";

    async function fetchData() {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error loading JSON:", error);
            return [];
        }
    }

    let missionsData = []; // Store missions data for all playstyles

    async function populateDropdowns() {
        missionsData = await fetchData();
        if (missionsData.length === 0) return;

        updateMissions(); // Set initial values based on the selected playstyle
    }

    function updateMissions() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        const filteredMissions = missionsData.filter(m => m.category === selectedPlaystyle);

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            dropdown.innerHTML = ""; // Clear existing options

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select an option";
            defaultOption.value = "";
            dropdown.appendChild(defaultOption);

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
            return; // Don't send empty data
        }
    
        fetch("https://mission-organizer-default-rtdb.firebaseio.com/selections.json", {
            method: "PATCH", // Use PATCH to only update specific fields
            body: JSON.stringify({ [selectedPlaystyle]: selections }), // Store selections under the playstyle key
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Selections updated:", data))
        .catch(error => console.error("Error updating selections:", error));
    }

    // Attach updateMissions to window so it works in HTML
    window.updateMissions = updateMissions;
    
    populateDropdowns();
});
