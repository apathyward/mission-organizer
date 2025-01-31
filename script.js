document.addEventListener("DOMContentLoaded", async function () {
    const jsonUrl = "https://raw.githubusercontent.com/apathyward/mission-organizer/main/missions.json";
    const firebaseUrl = "https://mission-organizer-default-rtdb.firebaseio.com/selections.json";

    // The plaintext password
    const correctPassword = "CloudyRainForest5";

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

    // Function to verify the password when the button is pressed
    function verifyPassword() {
        const enteredPassword = document.getElementById("passwordInput").value;
    
        // Check if the entered password matches the correct password
        if (enteredPassword === correctPassword) {
            // Enable the dropdowns and submit button if password is correct
            document.getElementById("playstyleDropdown").disabled = false;
            document.getElementById("submitSelectionsButton").disabled = false;  // Targeting the submit button by id
            alert("Password correct. You can now select missions and submit.");
        } else {
            // Optionally reset input field or give feedback
            alert("Incorrect password.");
            document.getElementById("playstyleDropdown").disabled = true;
            document.getElementById("submitSelectionsButton").disabled = true;  // Targeting the submit button by id
        }
    }    

    // Attach password verification to the button
    document.getElementById("submitPasswordButton").addEventListener("click", function (event) {
        event.preventDefault();  // Prevent any default actions
        verifyPassword();
    });

    window.submitSelections = submitSelections;  // Expose the submit function
    populateDropdowns();  // Populate the dropdowns on load
});
