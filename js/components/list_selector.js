document.addEventListener('DOMContentLoaded', function() {
    const selectors = document.querySelectorAll('.list_selector');
    
    selectors.forEach(selector => {
        const selectorId = selector.getAttribute('data-selector');
        const dropdown = document.querySelector(`[data-dropdown="${selectorId}"]`);
        const valueSpan = selector.querySelector('.list_selector-value');
        const options = dropdown.querySelectorAll('.list_selector_option');
        
        selector.addEventListener('click', function(e) {
            e.stopPropagation();
            
            document.querySelectorAll('.list_selector_dropdown.open').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('open');
                    openDropdown.previousElementSibling.classList.remove('active');
                }
            });
            
            dropdown.classList.toggle('open');
            selector.classList.toggle('active');
        });
        
        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const value = option.getAttribute('data-value');
                const text = option.textContent;
                
                valueSpan.textContent = text;
                
                dropdown.classList.remove('open');
                selector.classList.remove('active');
                
                selector.dispatchEvent(new CustomEvent('change', {
                    detail: { value: value, text: text }
                }));
            });
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.list_selector_wrapper')) {
            document.querySelectorAll('.list_selector_dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.previousElementSibling.classList.remove('active');
            });
        }
    });
});
