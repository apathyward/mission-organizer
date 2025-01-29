document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json"; 
    const firebaseUrl = "https://your-firebase-url.firebaseio.com/selections.json"; // Replace with your Firebase URL

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
            const dropdown = document.getElementById(`dynamicDropdown${week}`) as HTMLSelectElement | null;
            if (!dropdown) continue;

            dropdown.innerHTML = ""; // Clear existing options
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
        const selections: Record<string, string> = {};
        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`) as HTMLSelectElement | null;
            if (dropdown && dropdown.value) {
                selections[`week${week}`] = dropdown.value;
            }
        }

        // Send selections to Firebase (or another backend)
        try {
            const response = await fetch(firebaseUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selections),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            alert("Selections saved successfully!");
        } catch (error) {
            console.error("Error submitting selections:", error);
        }
    }

    document.getElementById("submitButton")?.addEventListener("click", submitSelections);
    populateDropdowns();
});
