document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json"; 

    async function fetchData(): Promise<{ id?: string; name: string }[]> {
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
            const dropdown = document.getElementById(`dynamicDropdown${week}`) as HTMLSelectElement;
            dropdown.innerHTML = ""; // Clear existing options

            // Add default option
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

    populateDropdowns();
});
