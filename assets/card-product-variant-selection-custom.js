document.addEventListener('DOMContentLoaded', function() {
  function updateProductImage(card, variantData, variantId) {
      var productImageElement = card.querySelector('.card__media img');
      if (productImageElement) {
          var lazyLoadAllVariants = card.getAttribute('data-lazy-load-all-variants') === 'true';
          if (lazyLoadAllVariants) {
              var preloadedImage = card.querySelector(`img[data-variant-id="${variantId}"]`);
              if (preloadedImage) {
                  productImageElement.src = preloadedImage.src;
                  productImageElement.srcset = preloadedImage.srcset;
              }
          } else if (variantData && variantData.imageUrl) {
              var dynamicSrcset = [
                  `${variantData.imageUrl}?width=165 165w`,
                  `${variantData.imageUrl}?width=360 360w`,
                  `${variantData.imageUrl}?width=533 533w`,
                  `${variantData.imageUrl}?width=720 720w`,
                  `${variantData.imageUrl}?width=940 940w`,
                  `${variantData.imageUrl}?width=1066 1066w`
              ].join(', ');
              productImageElement.srcset = dynamicSrcset;
              productImageElement.src = variantData.imageUrl;
          }
      }
  }

  function updateProductLinks(card, variantData) {
      var productLinks = card.querySelectorAll('a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"], a.card__content');
      productLinks.forEach(function(link) {
          link.href = variantData.productUrl;
      });

      if (variantData.productUrl) {
          var quickAddButton = card.querySelector('.quick-add__submit');
          if (quickAddButton) {
              quickAddButton.setAttribute('data-product-url', variantData.productUrl);
          }
      }
  }

  function storeSelectedVariant(sectionId, productId, variantId) {
      sessionStorage.setItem('selectedVariant-' + sectionId + '-' + productId, variantId);
  }

  function storeSelectedSwatch(sectionId, productId, variantId) {
      sessionStorage.setItem('selectedSwatch-' + sectionId + '-' + productId, variantId);
  }

  function restoreSelectedVariant(productGrid, sectionId, productId, variantDataMap) {
      var selectedVariantId = sessionStorage.getItem('selectedVariant-' + sectionId + '-' + productId);
      if (selectedVariantId && variantDataMap[selectedVariantId]) {
          var card = productGrid.querySelector(`.card-product-custom-div[data-section-id="${sectionId}"][data-product-id="${productId}"]`);
          var variantData = variantDataMap[selectedVariantId];
          updateProductImage(card, variantData, selectedVariantId);
          updateProductLinks(card, variantData);
      }
  }

  function restoreSelectedSwatch(productGrid, sectionId, productId) {
      var selectedVariantId = sessionStorage.getItem('selectedSwatch-' + sectionId + '-' + productId);
      if (selectedVariantId) {
          var swatchInput = productGrid.querySelector(`input[type="radio"][data-variant-id="${selectedVariantId}"][data-section-id="${sectionId}"][data-product-id="${productId}"]`);
          if (swatchInput) {
              swatchInput.checked = true;
          }
      }
  }

  function handleOverflowSwatchesClick(event, card, productId, sectionId) {
    event.preventDefault();
    var selectedVariantId = sessionStorage.getItem('selectedVariant-' + sectionId + '-' + productId);
    var variantDataMap = window['variantDataMap' + sectionId.replace(/-/g, '_') + '_' + productId];
    var variantData = variantDataMap[selectedVariantId] || variantDataMap[Object.keys(variantDataMap)[0]];
    
    if (variantData && variantData.productUrl) {
        window.location.href = variantData.productUrl;
    } else {
        var defaultProductLink = card.querySelector('a[id^="CardLink-"], a[id^="StandardCardNoMediaLink-"], a.card__content');
        if (defaultProductLink) {
            window.location.href = defaultProductLink.href;
        }
    }
  }

  function initializeProductGrid(productGrid) {
      var sectionId = productGrid.getAttribute('data-id');
      productGrid.querySelectorAll('.card-product-custom-div').forEach(function(card) {
          var productId = card.getAttribute('data-product-id');
          var variantDataMap = window['variantDataMap' + sectionId.replace(/-/g, '_') + '_' + productId];
          restoreSelectedVariant(productGrid, sectionId, productId, variantDataMap);
          restoreSelectedSwatch(productGrid, sectionId, productId);
          card.addEventListener('change', function(e) {
              if (e.target.matches('input[type="radio"][data-section-id="' + sectionId + '"][data-product-id="' + productId + '"]')) {
                  var variantId = e.target.getAttribute('data-variant-id');
                  var variantData = variantDataMap[variantId];
                  if (!variantData) {
                      return;
                  }
                  storeSelectedVariant(sectionId, productId, variantId);
                  storeSelectedSwatch(sectionId, productId, variantId);
                  updateProductImage(card, variantData, variantId);
                  updateProductLinks(card, variantData);
              }
          });

          var overflowSwatchesIndicator = card.querySelector('.collection-product-card__swatch-overflow');
          if (overflowSwatchesIndicator) {
              overflowSwatchesIndicator.addEventListener('click', function(e) {
                  handleOverflowSwatchesClick(e, card, productId, sectionId);
              });
          }

          card.classList.add('loaded');
      });
  }

  function initializeAllProductGrids() {
      var productGrids = document.querySelectorAll('.grid.product-grid');
      productGrids.forEach(initializeProductGrid);
  }

  initializeAllProductGrids();

  var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              initializeAllProductGrids();
          }
      });
  });

  var config = { childList: true, subtree: true };
  observer.observe(document.body, config);
});
