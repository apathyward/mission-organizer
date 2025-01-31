document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";
    const firebaseUrl = "https://mission-organizer-default-rtdb.firebaseio.com/selections.json";

    // Store missions data
    let missionsData = [];

    // Function to fetch missions data
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

    // Function to populate the week dropdowns
    async function populateDropdowns() {
        missionsData = await fetchMissions();
        if (!Array.isArray(missionsData) || missionsData.length === 0) {
            console.error("Missions data is empty or not an array.");
            return;
        }

        // Populate the dropdowns for each week
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

    // Function to submit selections to Firebase
    function submitSelections() {
        const selectedPlaystyle = document.getElementById("playstyleDropdown").value;
        const selections = {};

        // Gather the selections for each week
        for (let week = 1; week <= 8; week++) {
            const dropdown = document.getElementById(`dynamicDropdown${week}`);
            selections[`week${week}`] = dropdown.value.trim() !== "" ? dropdown.value : null;
        }

        // Send only the selected playstyle updates to Firebase
        fetch(firebaseUrl, {
            method: "PATCH", // Use PATCH to update only selected playstyle
            body: JSON.stringify({ [selectedPlaystyle]: selections }),
            headers: { "Content-Type": "application/json" }
        })
        .then(response => response.json())
        .then(data => console.log("Selections updated:", data))
        .catch(error => console.error("Error updating selections:", error));
    }

    // Function to verify the password using SHA-256 hashing
    function verifyPassword() {
        const enteredPassword = document.getElementById("passwordInput").value;
        
        // Hash the entered password
        const hashedEnteredPassword = CryptoJS.SHA256(enteredPassword).toString(CryptoJS.enc.Base64);

        // Correct hash for "CloudyRainForest5"
        const correctPasswordHash = "c3b505bb07679c697a97f2b2c98e3568df78a8f74f8f586dcf8a92b9b70fe742";

        // Compare hashes
        if (hashedEnteredPassword === correctPasswordHash) {
            // Enable the dropdowns and submit button if password is correct
            document.getElementById("playstyleDropdown").disabled = false;
            document.querySelector("button").disabled = false;
            alert("Password correct. You can now select missions and submit.");
        } else {
            document.getElementById("playstyleDropdown").disabled = true;
            document.querySelector("button").disabled = true;
            alert("Incorrect password.");
        }
    }

    // Attach password verification to input field
    document.getElementById("passwordInput").addEventListener("input", verifyPassword);

    window.submitSelections = submitSelections;  // Expose the submit function
    populateDropdowns();  // Populate the dropdowns on load
});
