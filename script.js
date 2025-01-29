document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json"; 
    const firebaseUrl = "https://mission-organizer-default-rtdb.firebaseio.com/selections.json";

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

    async function populateDropdowns() {
        const data = await fetchData();
        if (data.length === 0) return;

        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            dropdown.innerHTML = ""; 

            const defaultOption = document.createElement("option");
            defaultOption.textContent = "Select an option";
            defaultOption.value = "";
            dropdown.appendChild(defaultOption);

            data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id || item.name;
                option.textContent = item.name;
                dropdown.appendChild(option);
            });
        }
    }

    async function submitSelections() {
        const selections = {};
        for (let week = 1; week <= 8; week++) {
            selections[`week${week}`] = document.getElementById(`dynamicDropdown${week}`).value;
        }

        try {
            const response = await fetch(firebaseUrl, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selections)
            });

            if (!response.ok) throw new Error("Failed to save selections.");
            alert("Selections saved successfully!");
        } catch (error) {
            console.error("Error saving selections:", error);
        }
    }

    window.submitSelections = submitSelections; // Expose function globally
    populateDropdowns();
});
