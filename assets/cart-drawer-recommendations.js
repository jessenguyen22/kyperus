class ComprehensiveCartRecommendations extends HTMLElement {
  constructor() {
      super();
      this.weightQuantity = this.parseWeight(this.dataset.weightQuantity, 0.3);
      this.weightFrequency = this.parseWeight(this.dataset.weightFrequency, 0.4);
      this.weightPosition = this.parseWeight(this.dataset.weightPosition, 0.3);
  }

  parseWeight(value, defaultValue) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
  }

  connectedCallback() {
      try {
          const cartItemsString = this.dataset.cartItems.replace(/&quot;/g, '"');
          this.cartItems = JSON.parse(cartItemsString);
          this.combinedCartItems = this.combineVariants(this.cartItems);
          this.maxPosition = parseInt(this.dataset.maxPosition, 10) || 4;
          this.productsToShow = parseInt(this.dataset.productsToShow, 10) || this.maxPosition;
      } catch (e) {
          this.cartItems = [];
          this.combinedCartItems = [];
          this.maxPosition = 4;
          this.productsToShow = 4;
      }
  
      if (this.combinedCartItems.length > 0) {
          this.initializeRecommendations();
      }
  }

  combineVariants(cartItems) {
      const combinedItems = {};
      cartItems.forEach(item => {
          const productId = item.product_id;
          if (combinedItems[productId]) {
              combinedItems[productId].quantity += item.quantity;
          } else {
              combinedItems[productId] = { ...item };
          }
      });
      return Object.values(combinedItems);
  }

  initializeRecommendations() {
      this.loadRecommendations();
  }

  loadRecommendations() {
      const productIds = this.combinedCartItems.map(item => item.product_id);
      const recommendationPromises = productIds.map(id => this.fetchRecommendationsForProduct(id));
      
      Promise.all(recommendationPromises)
          .then(allRecommendations => {
              const processedRecommendations = this.processRecommendations(allRecommendations, productIds);
              this.renderRecommendations(processedRecommendations);
          })
          .catch(error => {
              console.error('Error loading recommendations:', error);
          });
  }

  async fetchRecommendationsForProduct(productId) {
      const url = `${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`;
      try {
          const response = await fetch(url);
          const text = await response.text();
          const html = document.createElement('div');
          html.innerHTML = text;
          const productCards = html.querySelectorAll('.cart-drawer__recommendations .grid__item');
          return Array.from(productCards).map(card => this.extractProductData(card));
      } catch (error) {
          console.error(`Error fetching recommendations for product ${productId}:`, error);
          return [];
      }
  }

  extractProductData(card) {
      const productInfoElement = card.querySelector('product-info-cart-upsell');
      if (productInfoElement) {
          const productId = productInfoElement.dataset.productId;
          return {
              id: productId,
              element: card.cloneNode(true)
          };
      }
      return null;
  }

  processRecommendations(allRecommendations, sourceProductIds) {
      const totalCartQuantity = this.combinedCartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalCartItems = this.combinedCartItems.length;
      const maxPosition = this.maxPosition;

      const processedRecommendations = [];
      allRecommendations.forEach((recommendations, index) => {
          const sourceProductId = sourceProductIds[index];
          const sourceCartItem = this.combinedCartItems.find(item => item.product_id === sourceProductId);
          const sourceQuantity = sourceCartItem ? sourceCartItem.quantity : 1;

          recommendations.forEach((rec, position) => {
              if (!rec) return;
              const existingRec = processedRecommendations.find(r => r.id === rec.id);
              const invertedPosition = maxPosition + 1 - (position + 1);

              if (existingRec) {
                  existingRec.count++;
                  existingRec.recommendedBy.push({
                      productId: sourceProductId,
                      position: position + 1,
                      quantity: sourceQuantity,
                      invertedPosition: invertedPosition
                  });
              } else {
                  processedRecommendations.push({
                      ...rec,
                      count: 1,
                      recommendedBy: [{
                          productId: sourceProductId,
                          position: position + 1,
                          quantity: sourceQuantity,
                          invertedPosition: invertedPosition
                      }],
                      originalPosition: null
                  });
              }
          });
      });

      processedRecommendations.forEach((rec, index) => {
          rec.originalPosition = index + 1;
      });

      processedRecommendations.forEach((rec) => {
          rec.totalQuantity = rec.recommendedBy.reduce((sum, item) => sum + item.quantity, 0);
          rec.timesRecommended = rec.count;
          rec.avgInvertedPosition = rec.recommendedBy.reduce((sum, item) => sum + item.invertedPosition, 0) / rec.recommendedBy.length;

          const { score, Q_p_norm, N_p_norm, P_p_norm } = this.calculateScore(rec, totalCartQuantity, totalCartItems, maxPosition);

          rec.score = score;
          rec.Q_p_norm = Q_p_norm;
          rec.N_p_norm = N_p_norm;
          rec.P_p_norm = P_p_norm;
      });

      processedRecommendations.sort((a, b) => b.score - a.score);

      return processedRecommendations;
  }

  calculateScore(recommendation, totalCartQuantity, totalCartItems, maxPosition) {
      const Q_p_norm = recommendation.totalQuantity / totalCartQuantity;
      const N_p_norm = recommendation.timesRecommended / totalCartItems;
      const P_p_norm = recommendation.avgInvertedPosition / maxPosition;

      const w_Q = this.weightQuantity;
      const w_N = this.weightFrequency;
      const w_P = this.weightPosition;

      const score = (w_Q * Q_p_norm) + (w_N * N_p_norm) + (w_P * P_p_norm);

      return {
          score,
          Q_p_norm,
          N_p_norm,
          P_p_norm
      };
  }

  renderRecommendations(recommendations) {
      const productsToShow = parseInt(this.dataset.productsToShow, 10) || recommendations.length;
      const limitedRecommendations = recommendations.slice(0, productsToShow);
      
      const container = document.createElement('div');
      container.className = 'product-recommendations no-markers';
      
      limitedRecommendations.forEach((item) => {
        if (item && item.element) {
          container.appendChild(item.element);
        }
      });
      
      this.innerHTML = '';
      this.appendChild(container);
      
      const recommendationsContainer = this.closest('.cart-drawer__recommendations');
      if (recommendationsContainer) {
        if (limitedRecommendations.length > 0) {
          recommendationsContainer.classList.add('has-recommendations');
        } else {
          recommendationsContainer.classList.remove('has-recommendations');
        }
      }
      
      if (limitedRecommendations.length > 0) {
        this.classList.add('product-recommendations--loaded');
      } else {
        this.classList.remove('product-recommendations--loaded');
      }
  
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent('cart-recommendations-rendered', { bubbles: true }));
      }, 0);
    }
}

customElements.define('comprehensive-cart-recommendations', ComprehensiveCartRecommendations);

class ProductInfoCartUpsell {
  static instance = null;

  constructor() {
    if (ProductInfoCartUpsell.instance) {
      return ProductInfoCartUpsell.instance;
    }
    ProductInfoCartUpsell.instance = this;

    this.handleRecommendationsRendered = this.handleRecommendationsRendered.bind(this);
    this.eventHandlers = new Map();
    this.initialize();
  }

  initialize() {
    this.container = document.querySelector('.cart-drawer__recommendations');
    if (!this.container) {
      return;
    }
    this.initProductElements();
    this.addEventListeners();
  }

  removeEventListeners() {
    if (this.productElements) {
      this.productElements.forEach((productElement) => {
        this.removeEventListenersFromElement(productElement);
      });
    }

    document.removeEventListener('cart-recommendations-rendered', this.handleRecommendationsRendered);
  }

  removeEventListenersFromElement(element) {
    const variantSelects = element.querySelector('variant-selects-cart-upsell');
    if (variantSelects) {
      const handler = this.eventHandlers.get(variantSelects);
      if (handler) {
        variantSelects.removeEventListener('cart-upsell-variant-change', handler);
        this.eventHandlers.delete(variantSelects);
      }
    }
    const productForm = element.querySelector('product-form');
    if (productForm) {
      const handler = this.eventHandlers.get(productForm);
      if (handler) {
        productForm.removeEventListener('submit', handler);
        this.eventHandlers.delete(productForm);
      }
    }
  }

  initProductElements() {
    this.removeEventListeners();
    this.productElements = this.container.querySelectorAll('.cart-upsell-item');
    this.productElements.forEach((productElement) => {
      this.initializeProductHandlers(productElement);
    });
  }

  addEventListeners() {
    document.addEventListener('cart-recommendations-rendered', this.handleRecommendationsRendered);
  }

  handleRecommendationsRendered() {
    this.initialize();
  }

  initializeProductHandlers(productElement) {
    const variantSelects = productElement.querySelector('variant-selects-cart-upsell');
    if (variantSelects) {
      const variantChangeHandler = this.handleVariantChange.bind(this, productElement);
      this.eventHandlers.set(variantSelects, variantChangeHandler);
      variantSelects.addEventListener('cart-upsell-variant-change', variantChangeHandler);
    }

    const productForm = productElement.querySelector('product-form');
    if (productForm) {
      const addToCartHandler = this.handleAddToCart.bind(this, productElement);
      this.eventHandlers.set(productForm, addToCartHandler);
      productForm.addEventListener('submit', addToCartHandler);
    }
  }

  handleVariantChange(productElement, event) {
    const variantSelects = event.target.closest('variant-selects-cart-upsell');

    if (variantSelects) {
      const selectedOptions = event.detail.selectedOptionValues;
      const variantData = this.getVariantIdByOptions(productElement, selectedOptions);

      if (variantData) {
        const productHandle = productElement.dataset.productHandle;
        this.renderProductInfo(productElement, productHandle, variantData.id);
      }
    }
  }

  getSelectedOptions(variantSelects) {
      const optionElements = variantSelects.querySelectorAll('[name^="options["]');
      const selectedOptions = [];
    
      optionElements.forEach((element) => {
        if (element.tagName === 'SELECT') {
          selectedOptions.push(element.value);
        } else if (element.tagName === 'INPUT' && element.type === 'radio' && element.checked) {
          selectedOptions.push(element.value);
        }
      });
    
      return selectedOptions;
    }
    
  getVariantIdByOptions(productElement, selectedOptions) {
      const selector = '#ProductJSON-' + productElement.dataset.productId;
      const variantJson = productElement.querySelector(selector);
    
      if (!variantJson) {
        return null;
      }
    
      const productData = JSON.parse(variantJson.textContent);
      const variant = productData.variants.find((v) =>
        selectedOptions.every((option, index) => v.options[index] === option)
      );
    
      return variant ? { id: variant.id, variant: variant } : null;
    }
    
  renderProductInfo(productElement, productHandle, variantId) {
    const url = this.buildProductUrl(productHandle, variantId);

    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const newProductInfo = html.querySelector('product-info-cart-upsell');
        if (newProductInfo) {
          this.updateUpsellProductInfo(productElement, newProductInfo);
        }
      })
      .catch((error) => {
        console.error('Error updating product info:', error);
      });
  }

  buildProductUrl(productHandle, variantId) {
    const params = new URLSearchParams({
      variant: variantId,
      section_id: 'cart-drawer-upsell-product'
    });

    return `/products/${productHandle}?${params.toString()}`;
  }

  updateUpsellProductInfo(oldProductElement, newProductElement) {
    const productId = oldProductElement.dataset.productId;
    const sectionId = oldProductElement.dataset.section;

    this.removeEventListenersFromElement(oldProductElement);

    oldProductElement.innerHTML = newProductElement.innerHTML;

    oldProductElement.dataset.productId = productId;
    oldProductElement.dataset.section = sectionId;

    this.initializeProductHandlers(oldProductElement);
  }

  handleAddToCart(productElement, event) {
    document.addEventListener('cart:update', (event) => {
      // Handle any additional actions after cart update
    }, { once: true });
  }
}

new ProductInfoCartUpsell();

class VariantSelectsCartUpsell extends VariantSelects {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target);
      this.updateSelectionMetadata(event);

      this.dispatchEvent(
        new CustomEvent('cart-upsell-variant-change', {
          bubbles: false,
          detail: {
            event,
            target,
            selectedOptionValues: this.selectedOptionValues,
          },
        })
      );
    });
  }

get selectedOptionValues() {
    const selectedOptions = [];

    this.querySelectorAll('select').forEach((select) => {
      selectedOptions.push(select.value);
    });

    this.querySelectorAll('input[type="radio"]:checked').forEach((input) => {
      selectedOptions.push(input.value);
    });

    return selectedOptions;
  }
}

customElements.define('variant-selects-cart-upsell', VariantSelectsCartUpsell);