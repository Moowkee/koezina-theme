(() => {
    const drawer = document.querySelector(
        '[data-koezina-cart-drawer]'
    );

    if (!drawer) {
        return;
    }

    const panel = drawer.querySelector(
        '.koezina-cart-drawer__panel'
    );

    const body = drawer.querySelector(
        '[data-cart-drawer-body]'
    );

    const footer = drawer.querySelector(
        '[data-cart-drawer-footer]'
    );

    const subtotal = drawer.querySelector(
        '[data-cart-subtotal]'
    );

    const shippingText = drawer.querySelector(
        '[data-cart-shipping-text]'
    );

    const shippingProgress = drawer.querySelector(
        '[data-cart-shipping-progress]'
    );

    const closeButtons = drawer.querySelectorAll(
        '[data-cart-drawer-close]'
    );

    const freeShippingThreshold =
        Number(
            drawer.dataset.freeShippingThreshold
        ) || 5000;

    const root =
        window.Shopify?.routes?.root || '/';

    let lastFocusedElement = null;

    const moneyFormatter = new Intl.NumberFormat(
        document.documentElement.lang || 'nl-NL',
        {
            style: 'currency',
            currency: window.Shopify?.currency?.active || 'EUR'
        }
    );

    const formatMoney = (cents) => {
        return moneyFormatter.format(
            Number(cents || 0) / 100
        );
    };

    const escapeHtml = (value = '') => {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    };

    const openDrawer = () => {
        lastFocusedElement =
            document.activeElement;

        drawer.classList.add('is-open');

        drawer.setAttribute(
            'aria-hidden',
            'false'
        );

        document.documentElement.classList.add(
            'koezina-cart-is-open'
        );

        requestAnimationFrame(() => {
            panel?.focus();
        });
    };

    const closeDrawer = () => {
        drawer.classList.remove('is-open');

        drawer.setAttribute(
            'aria-hidden',
            'true'
        );

        document.documentElement.classList.remove(
            'koezina-cart-is-open'
        );

        if (
            lastFocusedElement &&
            typeof lastFocusedElement.focus === 'function'
        ) {
            lastFocusedElement.focus();
        }
    };

    closeButtons.forEach((button) => {
        button.addEventListener(
            'click',
            closeDrawer
        );
    });

    document.addEventListener(
        'keydown',
        (event) => {
            if (
                event.key === 'Escape' &&
                drawer.classList.contains('is-open')
            ) {
                closeDrawer();
            }
        }
    );

    const updateHeaderCount = (count) => {
        const cartLink = document.querySelector(
            '.koezina-header__cart'
        );

        if (!cartLink) {
            return;
        }

        let countElement =
            cartLink.querySelector(
                '.koezina-header__cart-count'
            );

        if (count <= 0) {
            countElement?.remove();
            return;
        }

        if (!countElement) {
            countElement =
                document.createElement('span');

            countElement.className =
                'koezina-header__cart-count';

            cartLink.appendChild(countElement);
        }

        countElement.textContent =
            String(count);
    };

    const renderShipping = (cart) => {
        const subtotalPrice =
            Number(
                cart.items_subtotal_price || 0
            );

        const remaining =
            Math.max(
                freeShippingThreshold -
                subtotalPrice,
                0
            );

        const percentage =
            Math.min(
                (
                    subtotalPrice /
                    freeShippingThreshold
                ) * 100,
                100
            );

        shippingProgress.style.width =
            `${percentage}%`;

        if (remaining <= 0) {
            shippingText.innerHTML =
                '<strong>Gratis verzending behaald.</strong>';
        } else {
            shippingText.innerHTML =
                `Nog <strong>${escapeHtml(
                    formatMoney(remaining)
                )}</strong> voor gratis verzending.`;
        }
    };

    const renderEmptyCart = () => {
        body.innerHTML = `
      <div class="koezina-cart-drawer__empty">
        <div class="koezina-cart-drawer__empty-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h2l2.2 10h9.8l2-7H7"></path>
            <circle cx="10" cy="19" r="1.4"></circle>
            <circle cx="17" cy="19" r="1.4"></circle>
          </svg>
        </div>

        <h3>Je winkelmand is leeg</h3>

        <p>
          Ontdek de Koezina-collectie en voeg je favoriete
          keukenitems toe.
        </p>

        <a href="/collections/all">
          Shop de collectie
        </a>
      </div>
    `;

        footer.hidden = true;

        shippingProgress.style.width = '0%';

        shippingText.textContent =
            'Voeg een product toe om te beginnen.';
    };

    const renderItem = (item) => {
        const image = item.image
            ? `
        <a
          class="koezina-cart-item__image"
          href="${escapeHtml(item.url)}"
        >
          <img
            src="${escapeHtml(item.image)}"
            alt="${escapeHtml(item.product_title)}"
            loading="lazy"
          >
        </a>
      `
            : `
        <a
          class="koezina-cart-item__image"
          href="${escapeHtml(item.url)}"
        ></a>
      `;

        const variant =
            item.variant_title &&
            item.variant_title !== 'Default Title'
                ? `
          <div class="koezina-cart-item__variant">
            ${escapeHtml(item.variant_title)}
          </div>
        `
                : '';

        return `
      <article
        class="koezina-cart-item"
        data-cart-item
        data-cart-key="${escapeHtml(item.key)}"
      >
        ${image}

        <div class="koezina-cart-item__content">

          <div class="koezina-cart-item__top">
            <div>
              <a
                href="${escapeHtml(item.url)}"
                class="koezina-cart-item__title"
              >
                ${escapeHtml(item.product_title)}
              </a>

              ${variant}
            </div>

            <button
              type="button"
              class="koezina-cart-item__remove"
              data-cart-remove
              data-key="${escapeHtml(item.key)}"
              aria-label="Product verwijderen"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6L18 18"></path>
                <path d="M18 6L6 18"></path>
              </svg>
            </button>
          </div>

          <div class="koezina-cart-item__bottom">

            <div class="koezina-cart-item__quantity">
              <button
                type="button"
                data-cart-quantity-minus
                data-key="${escapeHtml(item.key)}"
                data-quantity="${item.quantity}"
                aria-label="Aantal verlagen"
              >
                −
              </button>

              <span>
                ${item.quantity}
              </span>

              <button
                type="button"
                data-cart-quantity-plus
                data-key="${escapeHtml(item.key)}"
                data-quantity="${item.quantity}"
                aria-label="Aantal verhogen"
              >
                +
              </button>
            </div>

            <span class="koezina-cart-item__price">
              ${escapeHtml(
            formatMoney(item.final_line_price)
        )}
            </span>

          </div>
        </div>
      </article>
    `;
    };

    const bindItemActions = () => {
        body
            .querySelectorAll(
                '[data-cart-quantity-minus]'
            )
            .forEach((button) => {
                button.addEventListener(
                    'click',
                    () => {
                        const quantity =
                            Math.max(
                                Number(button.dataset.quantity) - 1,
                                0
                            );

                        changeItem(
                            button.dataset.key,
                            quantity
                        );
                    }
                );
            });

        body
            .querySelectorAll(
                '[data-cart-quantity-plus]'
            )
            .forEach((button) => {
                button.addEventListener(
                    'click',
                    () => {
                        const quantity =
                            Number(
                                button.dataset.quantity
                            ) + 1;

                        changeItem(
                            button.dataset.key,
                            quantity
                        );
                    }
                );
            });

        body
            .querySelectorAll(
                '[data-cart-remove]'
            )
            .forEach((button) => {
                button.addEventListener(
                    'click',
                    () => {
                        changeItem(
                            button.dataset.key,
                            0
                        );
                    }
                );
            });
    };

    const renderCart = (cart) => {
        updateHeaderCount(
            cart.item_count || 0
        );

        if (
            !cart.items ||
            cart.items.length === 0
        ) {
            renderEmptyCart();
            return;
        }

        body.innerHTML =
            cart.items
                .map(renderItem)
                .join('');

        subtotal.textContent =
            formatMoney(
                cart.items_subtotal_price
            );

        footer.hidden = false;

        renderShipping(cart);
        bindItemActions();
    };

    const getCart = async () => {
        const response = await fetch(
            `${root}cart.js`,
            {
                headers: {
                    Accept: 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                'Winkelmand kon niet worden geladen.'
            );
        }

        return response.json();
    };

    const refreshCart = async () => {
        try {
            const cart = await getCart();

            renderCart(cart);

            return cart;
        } catch (error) {
            console.error(error);
        }

        return null;
    };

    const changeItem = async (
        key,
        quantity
    ) => {
        drawer.classList.add(
            'is-updating'
        );

        try {
            const response = await fetch(
                `${root}cart/change.js`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                        Accept: 'application/json'
                    },

                    body: JSON.stringify({
                        id: key,
                        quantity
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    'Winkelmand kon niet worden aangepast.'
                );
            }

            const cart =
                await response.json();

            renderCart(cart);
        } catch (error) {
            console.error(error);
        } finally {
            drawer.classList.remove(
                'is-updating'
            );
        }
    };

    const addToCart = async (form) => {
        drawer.classList.add(
            'is-updating'
        );

        try {
            const formData =
                new FormData(form);

            const response = await fetch(
                `${root}cart/add.js`,
                {
                    method: 'POST',

                    headers: {
                        Accept: 'application/json'
                    },

                    body: formData
                }
            );

            if (!response.ok) {
                const error =
                    await response.json();

                throw new Error(
                    error.description ||
                    'Product kon niet worden toegevoegd.'
                );
            }

            await response.json();

            await refreshCart();

            openDrawer();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                'Er ging iets mis bij het toevoegen.'
            );
        } finally {
            drawer.classList.remove(
                'is-updating'
            );
        }
    };

    /*
     * Productformulieren onderscheppen.
     *
     * Als JavaScript niet werkt, blijft
     * Shopify's normale form-action gewoon
     * als fallback functioneren.
     */
    document.addEventListener(
        'submit',
        (event) => {
            const form =
                event.target.closest(
                    'form[action*="/cart/add"]'
                );

            if (!form) {
                return;
            }

            const submitter =
                event.submitter;

            if (
                submitter &&
                submitter.name !== 'add'
            ) {
                return;
            }

            event.preventDefault();

            addToCart(form);
        }
    );

    /*
     * Klikken op het winkelmand-icoon
     * opent de drawer in plaats van
     * direct naar /cart te navigeren.
     */
    document.addEventListener(
        'click',
        (event) => {
            const link =
                event.target.closest(
                    'a[href*="/cart"]'
                );

            if (!link) {
                return;
            }

            if (
                link.closest(
                    '[data-koezina-cart-drawer]'
                )
            ) {
                return;
            }

            event.preventDefault();

            refreshCart().then(() => {
                openDrawer();
            });
        }
    );

    /*
     * Cart bij eerste pagina-load alvast
     * synchroniseren.
     */
    refreshCart();
})();