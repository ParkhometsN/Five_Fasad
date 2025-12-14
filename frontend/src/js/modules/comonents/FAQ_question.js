export function dubbleclick(){
    document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.question_checkbox');
    let currentlyOpen = null;
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function(e) {
            const wasOpen = currentlyOpen;
            if (wasOpen === this) {
                this.checked = false;
                currentlyOpen = null;
            } 
            else {
                if (wasOpen) {
                    wasOpen.checked = false;
                }
                this.checked = true;
                currentlyOpen = this;
            }
        
            checkboxes.forEach(cb => {
                const event = new Event('change');
                cb.dispatchEvent(event);
            });
        
            e.preventDefault();
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.question_wrapper')) {
            if (currentlyOpen) {
                currentlyOpen.checked = false;
                currentlyOpen = null;
                
                checkboxes.forEach(cb => {
                    const event = new Event('change');
                    cb.dispatchEvent(event);
                });
            }
        }
    });
});
}
   
   