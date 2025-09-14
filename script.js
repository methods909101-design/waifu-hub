// WaifuHub JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('WaifuHub loaded successfully!');
    
    // Get button elements
    const enterButton = document.querySelector('.retro-button[href="#"]:first-of-type');
    const twitterButton = document.querySelector('.retro-button[href="#"]:last-of-type');
    
    // Add click event listeners
    if (enterButton) {
        enterButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Enter button clicked');
            // Add functionality here when needed
        });
    }
    
    if (twitterButton) {
        twitterButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Twitter button clicked');
            // Add functionality here when needed
        });
    }
    
    // Add retro sound effect function (placeholder)
    function playRetroSound() {
        // Placeholder for future sound effects
        console.log('Retro sound effect would play here');
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (enterButton) {
                enterButton.click();
            }
        }
    });
});
