document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('back');
    const saveButton = document.getElementById('save');
    const eczemaCheckbox = document.getElementById('eczema');
    const feedbackMessageDiv = document.getElementById('feedback-message');

    // Load and set preferences on page load
    chrome.storage.local.get(['preferences'], function(result) {
        const preferences = result.preferences || {};
        eczemaCheckbox.checked = preferences.eczema || false;
    });

    // Save preferences
    saveButton.addEventListener('click', function() {
        const eczemaChecked = eczemaCheckbox.checked;
        chrome.storage.local.set({ preferences: { eczema: eczemaChecked } }, function() {
            feedbackMessageDiv.textContent = 'Preferences updated.';
            feedbackMessageDiv.style.color = 'green'; // Optional: Change color for visibility
        });
    });

    // Navigate back to the home page
    backButton.addEventListener('click', function() {
        window.location.href = 'popup.html';
    });
});
