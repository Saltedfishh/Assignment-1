// --- Global State Variables ---
let timeBlocks = []; // Array to hold all task objects: [{name: 'Task 1', duration: 300}, ...] (duration in seconds)
let currentBlockIndex = 0;
let timeRemaining = 0; // Time in seconds
let timerInterval = null;
let isRunning = false;
let isPaused = false;


// --- Feature 1: Specify Sub-tasks and Time & Display ---

/**
 * Adds a new task block to the timeBlocks array.
 * @param {string} name - Name of the task.
 * @param {number} minutes - Duration of the task in minutes.
 */
function addTimeBlock(name = null, minutes = null) {
    // Get values from input fields if not provided (manual entry)
    const taskName = name || document.getElementById('taskNameInput').value.trim();
    const taskMinutes = minutes || parseInt(document.getElementById('taskMinutesInput').value);

    // Basic validation
    if (!taskName || isNaN(taskMinutes) || taskMinutes <= 0) {
        alert('Please enter a valid task name and minutes.');
        return;
    }

    // Convert minutes to seconds for internal use
    const durationSeconds = taskMinutes * 60;
    timeBlocks.push({ name: taskName, duration: durationSeconds });

    // Clear inputs after successful addition
    if (!name) { // Only clear if adding manually, not from import
        document.getElementById('taskNameInput').value = '';
        document.getElementById('taskMinutesInput').value = '10';
    }

    renderTimeBlocks(); // Update the UI
    updateTotalTime(); // Update the total duration displayed in the timer if not running
}

/**
 * Renders the list of time blocks in the UI.
 */
function renderTimeBlocks() {
    const listElement = document.getElementById('timeBlocksList');
    listElement.innerHTML = ''; // Clear existing list

    timeBlocks.forEach((block, index) => {
        // Calculate minutes and seconds for display
        const minutes = Math.floor(block.duration / 60);
        const seconds = block.duration % 60;
        const timeStr = `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}`;

        const div = document.createElement('div');
        div.className = `time-block-item ${index === currentBlockIndex && isRunning ? 'current-block' : ''}`;
        
        // Use an ID to easily target this element later for styling updates
        div.id = `block-${index}`;

        div.innerHTML = `
            <span>${index + 1}. ${block.name}</span>
            <span>${timeStr}</span>
            <button onclick="removeTimeBlock(${index})">X</button>
        `;
        listElement.appendChild(div);
    });
}

/**
 * Removes a time block by its index.
 */
function removeTimeBlock(index) {
    if (isRunning) {
        alert("Cannot remove task while the timer is running.");
        return;
    }
    timeBlocks.splice(index, 1);
    renderTimeBlocks();
    updateTotalTime();
}

/**
 * Updates the main timer display with a formatted time string (MM:SS).
 * @param {number} totalSeconds - The time in seconds.
 */
function updateDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = timeStr;
}

/**
 * Calculates and displays the total time when the timer is not running.
 */
function updateTotalTime() {
    if (isRunning || isPaused) return;
    const totalDuration = timeBlocks.reduce((sum, block) => sum + block.duration, 0);
    updateDisplay(totalDuration);
}
// --- Feature 2: Export and Import Sub-task and time configuration as a CSV file ---

/**
 * Exports the current time blocks configuration as a CSV file.
 */
function exportBlocks() {
    // Define the CSV header
    let csvContent = "TaskName,Duration(Minutes)\n";

    // Convert data to CSV format
    timeBlocks.forEach(block => {
        const minutes = block.duration / 60; // Convert seconds back to minutes
        // CSV should handle commas in names by wrapping them in quotes, but we'll keep it simple
        csvContent += `${block.name},${minutes}\n`;
    });

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "timeblocks_agenda.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Imports time blocks from a selected CSV file.
 */
function importBlocks(event) {
    if (isRunning) {
        alert("Cannot import blocks while the timer is running. Please stop the timer first.");
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Clear existing blocks and parse CSV
        timeBlocks = [];
        
        // Skip header line (TaskName,Duration(Minutes))
        for (let i = 1; i < lines.length; i++) {
            const [name, minutesStr] = lines[i].split(',');
            const minutes = parseFloat(minutesStr);
            
            if (name && !isNaN(minutes) && minutes > 0) {
                // Add block by calling the existing helper function, which converts to seconds
                addTimeBlock(name.trim(), minutes);
            }
        }
        
        // Finalize import
        renderTimeBlocks();
        updateTotalTime();
        alert(`Successfully imported ${timeBlocks.length} time blocks.`);
    };

    reader.readAsText(file);
}

// --- Initialization ---

// Initial call to set the display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Example Initial Block (can be removed later)
    addTimeBlock("Project Overview", 5); 
    addTimeBlock("Feature Discussion", 10);
    addTimeBlock("Action Items", 5);

    updateTotalTime(); // Sets the initial timer to total duration
});