// --- Global State Variables ---
let timeBlocks = []; // Array to hold all task objects: [{name: 'Task 1', duration: 300, notes: []}, ...] (duration in seconds)
let currentBlockIndex = 0;
let timeRemaining = 0; // Time in seconds
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// --- Feature 2 (Harry, Minghao Yang): Time Block Warning System ---
const WARNING_THRESHOLD_SECONDS = 60; // 1 minute warning
let warningAlerted = false; // Flag to ensure the warning only triggers once per block

// --- Feature 1 (Yang Pan): Meeting Note Integration ---
let meetingNotes = []; // Stores all notes: [{blockIndex: 0, timeRemaining: 120, note: "Decision made"}, ...]

// --- Basic Features (1, 2, 3) Implementation ---

/**
 * Adds a new task block to the timeBlocks array.
 */
function addTimeBlock(name = null, minutes = null) {
    const taskName = name || document.getElementById('taskNameInput').value.trim();
    const taskMinutes = minutes || parseInt(document.getElementById('taskMinutesInput').value);

    if (!taskName || isNaN(taskMinutes) || taskMinutes <= 0) {
        alert('Please enter a valid task name and minutes.');
        return;
    }

    const durationSeconds = taskMinutes * 60;
    // Initialize the notes array for the new block
    timeBlocks.push({ name: taskName, duration: durationSeconds, notes: [] }); 

    if (!name) { 
        document.getElementById('taskNameInput').value = '';
        document.getElementById('taskMinutesInput').value = '10';
    }

    renderTimeBlocks();
    updateTotalTime();
}

/**
 * Renders the list of time blocks in the UI.
 */
function renderTimeBlocks() {
    timeBlocksContainer = document.getElementById('timeBlocksList'); // Ensure the container is set
    timeBlocksContainer.innerHTML = ''; 

    timeBlocks.forEach((block, index) => {
        const minutes = Math.floor(block.duration / 60);
        const seconds = block.duration % 60;
        const timeStr = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const div = document.createElement('div');
        div.className = `time-block-item ${index === currentBlockIndex && isRunning ? 'current-block' : ''}`;
        div.id = `block-${index}`;

        // Add the 'modifiable' class for Feature 3 (Dynamic Reallocation) targetting

// ... (updateDisplay and updateTotalTime functions remain the same) ...

function updateDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = timeStr;
}

function updateTotalTime() {
    if (isRunning || isPaused) return;
    const totalDuration = timeBlocks.reduce((sum, block) => sum + block.duration, 0);
    updateDisplay(totalDuration);
}

function removeTimeBlock(index) {
    if (isRunning) {
        alert("Cannot remove task while the timer is running.");
        return;
    }
    timeBlocks.splice(index, 1);
    renderTimeBlocks();
    updateTotalTime();
}


// --- Timer Control and Countdown Logic (Extended feature by Minghao Yang) ---

function toggleTimer() {
    if (isRunning) {
        stopTimer();
    } else {
        if (timeBlocks.length === 0) {
            alert('Please add at least one time block to start the timer.');
            return;
        }
        
        currentBlockIndex = 0;
        isRunning = true;
        isPaused = false;
        warningAlerted = false; // Reset warning flag
        timeRemaining = timeBlocks[currentBlockIndex].duration;
        
        document.getElementById('startStopBtn').textContent = 'Stop Timer';
        document.getElementById('pauseResumeBtn').textContent = 'Pause';
        document.getElementById('pauseResumeBtn').style.display = 'inline-block';
        document.getElementById('modifyBtn').style.display = 'none'; 
        document.getElementById('noteSection').style.display = 'block'; // Show notes section
        
        startCountdown();
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    isPaused = false;
    currentBlockIndex = 0;
    warningAlerted = false;
    
    document.getElementById('startStopBtn').textContent = 'Start Timer';
    document.getElementById('pauseResumeBtn').style.display = 'none';
    document.getElementById('modifyBtn').style.display = 'none';
    document.getElementById('noteSection').style.display = 'none'; // Hide notes section
    
    // Remove the warning class from the display
    document.getElementById('timerDisplay').classList.remove('warning-time');

    renderTimeBlocks(); 
    updateTotalTime(); 
}

function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    
    renderTimeBlocks(); 

    timerInterval = setInterval(() => {
        //  Warning System Check ---
        if (timeRemaining <= WARNING_THRESHOLD_SECONDS && !warningAlerted && timeRemaining > 0) {
            // Trigger visual warning
            document.getElementById('timerDisplay').classList.add('warning-time');
            console.log("TIME WARNING!");
            // Optional: Play a sound alert here
            warningAlerted = true;
        }

        if (timeRemaining <= 0) {
            // Block finished - Check if the warning was active and remove it
            document.getElementById('timerDisplay').classList.remove('warning-time');
            warningAlerted = false; // Reset flag for the next block

            // Move to the next block
            currentBlockIndex++;

            if (currentBlockIndex < timeBlocks.length) {
                timeRemaining = timeBlocks[currentBlockIndex].duration;
                renderTimeBlocks(); 
            } else {
                alert('All time blocks completed!');
                stopTimer();
                return;
            }
        }

        timeRemaining--;
        updateDisplay(timeRemaining);
    }, 1000); 
}
// --- Feature 1 (Individual): Meeting Note Integration ---

/**
 * Saves a note with the current timestamp and task context.
 */
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();

    if (!noteText) {
        alert("Please enter a note before saving.");
        return;
    }

    const currentTaskName = timeBlocks[currentBlockIndex].name;

    meetingNotes.push({
        blockIndex: currentBlockIndex,
        taskName: currentTaskName,
        timeRemaining: timeRemaining, // Remaining time when note was taken
        timestamp: new Date().toLocaleTimeString(),
        note: noteText
    });

    console.log("Note Saved:", meetingNotes[meetingNotes.length - 1]);
    
    // Clear input field after saving
    noteInput.value = '';
    
    // Optional: Add visual confirmation (e.g., flash the save button)
    alert(`Note saved for ${currentTaskName} at ${Math.floor(timeRemaining/60)}:${String(timeRemaining%60).padStart(2, '0')}.`);
}

function pauseResumeTimer() {
    if (isPaused) {
        isPaused = false;
        document.getElementById('pauseResumeBtn').textContent = 'Pause';
        document.getElementById('modifyBtn').style.display = 'none'; 
        // Also hide the dynamic reallocation buttons
    } else {
        isPaused = true;
        clearInterval(timerInterval);
        document.getElementById('pauseResumeBtn').textContent = 'Resume';
        // The dynamic reallocation interface can be shown via the Modify button
    }
}
