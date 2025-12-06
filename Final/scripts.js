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