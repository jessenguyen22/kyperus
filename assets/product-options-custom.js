document.addEventListener('DOMContentLoaded', function() {

  function handleCheckboxChange(checkbox) {
    const hiddenInputId = checkbox.dataset.hiddenInputId;
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) {
      hiddenInput.value = checkbox.checked ? 'Yes' : 'No';
    }
  }

  function handleTextInputChange(input) {
    const hiddenInputId = input.dataset.hiddenInputId;
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) {
      hiddenInput.value = input.value;
    }
  }

  function handleOptionInputChange(optionInputs) {
    optionInputs.forEach(input => {
      const productFormInput = document.getElementById(`product-form-input-${input.dataset.optionName}-${input.dataset.blockId}`);
      if (!productFormInput) {
        return;
      }

      function updateFields(value) {
        productFormInput.value = value;
      }

      input.addEventListener('change', function() {
        updateFields(this.value);
      });

      if (input.checked || input.tagName === 'SELECT') {
        updateFields(input.value);
      }
    });
  }

  const customCheckboxes = document.querySelectorAll('.custom-checkbox-input');
  customCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      handleCheckboxChange(checkbox);
    });
  });

  const customTextInputs = document.querySelectorAll('.custom-text-field');
  customTextInputs.forEach(input => {
    input.addEventListener('input', function() {
      handleTextInputChange(input);
    });
  });

  const optionInputs = document.querySelectorAll('input[name^="custom_option_"], select[name^="custom_option_"]');
  if (optionInputs.length > 0) {
    handleOptionInputChange(optionInputs);
  }
});

