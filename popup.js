document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scan');
    const messageDiv = document.getElementById('message');

    // Load preferences when the popup is opened
    chrome.storage.local.get(['preferences'], function(result) {
        const preferences = result.preferences || {};
        
        // Show message if preferences are not set
        if (!preferences.eczema) {
            messageDiv.style.display = 'block';
            messageDiv.textContent = 'Please select your preferences on the settings page.';
        } else {
            messageDiv.style.display = 'none';
        }
    });

    // Add event listener to the scan button
    scanButton.addEventListener('click', function() {
        chrome.storage.local.get(['preferences'], function(result) {
            const preferences = result.preferences || {};
            
            if (!preferences.eczema) {
                // Display message to select preferences
                messageDiv.style.display = 'block';
                messageDiv.textContent = 'Please select your preferences on the settings page.';
            } else {
                // Hide message and run scan
                messageDiv.style.display = 'none';
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: scanPage
                    }, () => {
                        // Get feedback message from content script
                        chrome.storage.local.get(['feedbackMessage'], function(result) {
                            messageDiv.textContent = result.feedbackMessage || 'An error occurred.';
                            messageDiv.style.display = 'block';
                        });
                    });
                });
            }
        });
    });
});

// The scanPage function that performs the ingredient and label info scanning
function scanPage() {
    const harmfulIngredientsForEczema = [
        "fragrance", "methylisothiazolinone", "methylchloroisothiazolinone", 
        "formaldehyde", "quaternium-15", "lanolin", 
        "cocamidopropyl betaine", "isopropyl alcohol", 
        "sodium lauryl sulfate", "propylene glycol", 
        "essential oils", "ethylhexylglycerin", 
        "benzyl alcohol", "urea", "phenoxyethanol"
    ];

    const exclusions = [
        "fragrance-free", "unscented"
    ];

    const pageText = document.body.innerText.toLowerCase();

    // Regex to identify ingredient and label info sections
    const sectionPattern = /(ingredients|active ingredients|inactive ingredients|composition|label info)[:\s]*([\s\S]+?)(?:\n\n|\n[^A-Za-z0-9\s,.-])/gi;

    let ingredients = [];
    let foundHarmful = [];

    let match;
    while ((match = sectionPattern.exec(pageText)) !== null) {
        const sectionContent = match[2].trim();

        // Split the section content into individual ingredients
        const ingredientList = sectionContent.split(/,|\n|;/).map(ingredient => ingredient.trim()).filter(ingredient => ingredient.length > 0);

        // Check each ingredient against the harmful list
        ingredientList.forEach(ingredient => {
            // Skip exclusions
            if (exclusions.some(exclusion => ingredient.includes(exclusion))) {
                return;
            }
            
            // Check against harmful list
            if (harmfulIngredientsForEczema.some(harmful => ingredient.includes(harmful))) {
                foundHarmful.push(ingredient);
            }
        });

        ingredients.push(...ingredientList);
    }

    // Provide feedback based on findings
    let feedbackMessage;
    if (foundHarmful.length > 0) {
        feedbackMessage = `Warning: The following ingredients may be harmful for eczema-prone skin: ${foundHarmful.join(', ')}`;
    } else if (ingredients.length > 0) {
        feedbackMessage = `No harmful ingredients found. The ingredients and label info on this page should be safe for eczema-prone skin.`;
    } else {
        feedbackMessage = `No ingredients or label info section found on this page.`;
    }

    // Send message to the popup
    chrome.storage.local.set({ feedbackMessage: feedbackMessage });
}
