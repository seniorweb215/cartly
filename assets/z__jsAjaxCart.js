"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Shopify.theme.jsAjaxCart = {
  init: function init($section) {
    // Add settings from schema to current object
    Shopify.theme.jsAjaxCart = $.extend(this, Shopify.theme.getSectionData($section));

    if (isScreenSizeLarge() || this.cart_action == 'drawer') {
      this.initializeAjaxCart();
    } else {
      this.initializeAjaxCartOnMobile();
    }

    if (this.cart_action == 'drawer') {
      this.ajaxCartDrawer = $('[data-ajax-cart-drawer]');
      $(document).on('click', '[data-ajax-cart-trigger]', function (e) {
        e.preventDefault();
        Shopify.theme.jsAjaxCart.showDrawer();
        return false;
      });
    } else if (this.cart_action == 'mini_cart') {
      this.showMiniCartOnHover();
    }

    $(document).on('click', '.ajax-submit', function (e) {
      e.preventDefault();
      var $addToCartForm = $(this).closest('form');
      Shopify.theme.jsAjaxCart.addToCart($addToCartForm);
      return false;
    });
    $(document).on('click', '[data-ajax-cart-delete]', function (e) {
      e.preventDefault();
      var lineID = $(this).parents('[data-line-item]').data('line-item');
      Shopify.theme.jsAjaxCart.removeFromCart(lineID);

      if (Shopify.theme.jsCart) {
        Shopify.theme.jsCart.removeFromCart(lineID);
      }

      return false;
    });
    $(document).on('click', '[data-ajax-cart-close]', function (e) {
      e.preventDefault();
      Shopify.theme.jsAjaxCart.hideDrawer();
      Shopify.theme.jsAjaxCart.hideMiniCart();
      return false;
    });
  },
  showMiniCartOnHover: function showMiniCartOnHover() {
    var $el = $('[data-ajax-cart-trigger]');
    $el.hover(function () {
      if (Shopify.theme_settings.header_layout == 'centered' && $('.header-sticky-wrapper').hasClass('is-sticky')) {
        $('.header-sticky-wrapper [data-ajax-cart-trigger]').addClass('show-mini-cart');
      } else {
        $el.addClass('show-mini-cart');
      }
    }, function () {
      $el.removeClass('show-mini-cart');
    });
  },
  hideMiniCart: function hideMiniCart() {
    if (this.cart_action != 'mini_cart') return false;
    var $el = $('[data-ajax-cart-close]').parents('[data-ajax-cart-trigger]');
    $el.removeClass('show-mini-cart');
  },
  toggleMiniCart: function toggleMiniCart() {
    var $el = $('.mobile-header [data-ajax-cart-trigger]'); // Removes url to the cart page so user is not redirected

    $el.attr('href', '#');
    $el.off('click').on('click', function (e) {
      // If user clicks inside the element, do nothing
      if (e.target.closest('[data-ajax-cart-mini_cart]')) {
        return;
      } // Loads content into ajaxCart container for mobile header


      Shopify.theme.jsAjaxCart.initializeAjaxCartOnMobile(); // If user clicks outside the element, toggle the mini cart

      $el.toggleClass('show-mini-cart'); // Calculate height of mini cart

      var announcementHeight = 0;
      var mobileHeaderHeight = parseInt($('.mobile-header').height());

      if (typeof Shopify.theme.jsAnnouncementBar !== 'undefined' && Shopify.theme.jsAnnouncementBar.enable_sticky) {
        announcementHeight = Shopify.theme.jsAnnouncementBar.getAnnouncementHeight();
      }

      $('.mobile-header .theme-ajax-cart').css({
        height: "calc(100vh - ".concat(mobileHeaderHeight + announcementHeight, "px)")
      });
    });
  },
  showDrawer: function showDrawer() {
    if (this.cart_action != 'drawer') return false;
    this.ajaxCartDrawer.addClass('is-visible');
    $('.ajax-cart__overlay').addClass('is-visible');
  },
  hideDrawer: function hideDrawer() {
    if (this.cart_action != 'drawer') return false;
    this.ajaxCartDrawer.removeClass('is-visible');
    $('.ajax-cart__overlay').removeClass('is-visible');
  },
  updateCollectionPage: function updateCollectionPage() {
    var html = "";
    
    $(".ajax-cart__form:not(.is-hidden)").find(".ajax-cart__list > div").each(function() {
      var productID = parseInt($(this).data('cart-item'));
      var lineItem = parseInt($(this).data('line-item'));
      var quantity = parseInt($(this).find('input.quantity-input').val());
      
      html = '<input type="hidden" name="id" value="' + productID + '">';
      html += '<div class="product-quantity-box" data-line-item="' + lineItem + '" data-line-item-key="' + lineItem + '">';
      html += '<label class="label is-sr-only" for="quantity">Qty</label>';
      html += '<div class="quantity-wrapper field has-addons quantity-style--box is-medium">' +
                '<div class="control minus-control">' +
                  '<span class="quantity-minus quantity-element button is-inverse" data-update-quantity="minus" disabled="">' +
                    '<span class="icon " data-icon="minus">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
                        '<g id="minus">' +
                          '<rect x="5" y="46" width="90" height="8"></rect>' +
                        '</g>' +
                      '</svg>' +
                    '</span>' +
                  '</span>' +
                '</div>' +
                '<div class="control quantity-input-control quantity-input-control--fill"> <input class="quantity-input quantity-element input" type="number" min="1" size="2" name="quantity" value="' + quantity + '" data-max-inventory-management="" data-line-id=""></div>' +
                '<div class="control plus-control">' +
                  '<span class="quantity-plus quantity-element button is-inverse" data-update-quantity="plus">' +
                    '<span class="icon " data-icon="plus">' +
                      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
                        '<g id="plus">' +
                          '<polygon points="95 46 54 46 54 5 46 5 46 46 5 46 5 54 46 54 46 95 54 95 54 54 95 54 95 46"></polygon>' +
                        '</g>' +
                      '</svg>' +
                    '</span>' +
                  '</span>' +
                '</div>' +
              '</div>';
      html += "</div>";

      $("form.custom-form input[value='" + productID + "']").parent().html(html);
    });

    // if(newQty == 0) {
    //   $(".ajax-cart__form:not(.is-hidden)").find(".ajax-cart__list > div").each(function() {
    //     var cartItem = parseInt($(this).data('cart-item'));
    //     if($addToCartForm.find("input[name='id']").val() == cartItem) {
    //       lineItem = $(this).data('line-item')
    //     }
    //   });
  
    //   html = '<div class="product-quantity-box" data-line-item="' + lineItem + '" data-line-item-key="' + lineItem + '">';
    //   html += '<label class="label is-sr-only" for="quantity">Qty</label>';
    //   html += '<div class="quantity-wrapper field has-addons quantity-style--box is-medium">' +
    //             '<div class="control minus-control">' +
    //               '<span class="quantity-minus quantity-element button is-inverse" data-update-quantity="minus" disabled="">' +
    //                 '<span class="icon " data-icon="minus">' +
    //                   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    //                     '<g id="minus">' +
    //                       '<rect x="5" y="46" width="90" height="8"></rect>' +
    //                     '</g>' +
    //                   '</svg>' +
    //                 '</span>' +
    //               '</span>' +
    //             '</div>' +
    //             '<div class="control quantity-input-control quantity-input-control--fill"> <input class="quantity-input quantity-element input" type="number" min="1" size="2" name="quantity" value="1" data-max-inventory-management="" data-line-id=""></div>' +
    //             '<div class="control plus-control">' +
    //               '<span class="quantity-plus quantity-element button is-inverse" data-update-quantity="plus">' +
    //                 '<span class="icon " data-icon="plus">' +
    //                   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
    //                     '<g id="plus">' +
    //                       '<polygon points="95 46 54 46 54 5 46 5 46 46 5 46 5 54 46 54 46 95 54 95 54 54 95 54 95 46"></polygon>' +
    //                     '</g>' +
    //                   '</svg>' +
    //                 '</span>' +
    //               '</span>' +
    //             '</div>' +
    //           '</div>';
    //   html += "</div>";
  
    //   $addToCartForm.find("button").remove();
    //   $addToCartForm.append(html);
    // } else {
    //   var currentQty = $addToCartForm.find("input.quantity-input").val();
    //   var totalQty = parseInt(currentQty) + parseInt(newQty);
    //   $addToCartForm.find("input.quantity-input").val(totalQty);
    // }
  },
  updateCollectionItem: function updateCollectionItem(lineID) {
    var $form = $(".product-quantity-box[data-line-item=\"".concat(lineID, "\"]")).parent();
    var html = '<button type="button" name="add" class="button custom-add-to-cart  ajax-submit action_button button--add-to-cart " data-label="Add to cart" data-add-to-cart-trigger="">' +
                  '<span class="text">Add to cart</span> ' +
                  '<svg x="0px" y="0px" width="32px" height="32px" viewBox="0 0 32 32" class="checkmark">' +
                    '<path fill="none" stroke-width="2" stroke-linecap="square" stroke-miterlimit="10" d="M9,17l3.9,3.9c0.1,0.1,0.2,0.1,0.3,0L23,11"></path>' +
                  '</svg>' +
                '</button>';
    
    $form.find(".product-quantity-box").remove();
    $form.append(html);
  },
  removeFromCart: function removeFromCart(lineID, callback) {
    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: 'quantity=0&line=' + lineID,
      dataType: 'json',
      success: function success(cart) {
        Shopify.theme.jsAjaxCart.updateView('delete');
        Shopify.theme.jsAjaxCart.updateCollectionItem(lineID);
      },
      error: function error(XMLHttpRequest, textStatus) {
        var response = eval('(' + XMLHttpRequest.responseText + ')');
        response = response.description;
      }
    });
  },
  initializeAjaxCart: function initializeAjaxCart() {
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref) {
      var html = _ref.html,
          options = _ref.options;
      $('[data-ajax-cart-content]').html(html.content); // Converting the currencies

      if (Currency.show_multiple_currencies) {
        Shopify.theme.currencyConverter.convertCurrencies();
      }
    }).fail(function () {// some error handling
    });
  },
  initializeAjaxCartOnMobile: function initializeAjaxCartOnMobile() {
    this.toggleMiniCart();
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref2) {
      var html = _ref2.html,
          options = _ref2.options;
      $('.mobile-header [data-ajax-cart-content]').html(html.content);
    }).fail(function () {// some error handling
    });
  },
  addToCart: function addToCart($addToCartForm) {
    var $addToCartBtn = $addToCartForm.find('.button--add-to-cart');
    $.ajax({
      url: '/cart/add.js',
      dataType: 'json',
      cache: false,
      type: 'post',
      data: $addToCartForm.serialize(),
      beforeSend: function beforeSend() {
        $addToCartBtn.attr('disabled', 'disabled').addClass('disabled');
        $addToCartBtn.find('span').removeClass("fadeInDown").addClass('animated zoomOut');
      },
      success: function success(product) {
        var $el = $('[data-ajax-cart-trigger]');
        $addToCartBtn.find('.checkmark').addClass('checkmark-active');

        function addedToCart() {
          if (!isScreenSizeLarge()) {
            $el = $('.mobile-header [data-ajax-cart-trigger]');
            Shopify.theme.scrollToTop($el);
          } else {
            $el = $('[data-ajax-cart-trigger]');
          }

          $el.addClass('show-mini-cart');
          $addToCartBtn.find('span').removeClass('fadeInDown');
        }

        window.setTimeout(function () {
          $addToCartBtn.removeAttr('disabled').removeClass('disabled');
          $addToCartBtn.find('.checkmark').removeClass('checkmark-active');
          $addToCartBtn.find('.text, .icon').removeClass('zoomOut').addClass('fadeInDown');
          $addToCartBtn.on('webkitAnimationEnd oanimationend msAnimationEnd animationend', addedToCart);
        }, 1000);
        // Shopify.theme.jsAjaxCart.showDrawer();
        Shopify.theme.jsAjaxCart.updateView('update', $addToCartForm);

        if (Shopify.theme.jsCart) {
          var _$$ajax;

          $.ajax((_$$ajax = {
            dataType: "json",
            async: false,
            cache: false
          }, _defineProperty(_$$ajax, "dataType", 'html'), _defineProperty(_$$ajax, "url", "/cart"), _defineProperty(_$$ajax, "success", function success(html) {
            var cartForm = $(html).find('.cart__form');
            $('.cart__form').replaceWith(cartForm);
          }), _$$ajax));
        }
      },
      error: function error(XMLHttpRequest) {
        var response = eval('(' + XMLHttpRequest.responseText + ')');
        response = response.description;
        var cartWarning = "<p class=\"cart-warning__message animated bounceIn\">".concat(response.replace('All 1 ', 'All '), "</p>");
        $('.warning').remove();
        $addToCartForm.find('.cart-warning').html(cartWarning);
        $addToCartBtn.removeAttr('disabled').removeClass('disabled');
        $addToCartBtn.find('.icon').removeClass('zoomOut').addClass('zoomIn');
        $addToCartBtn.find('.text').text(Shopify.translation.addToCart).removeClass('zoomOut').addClass('zoomIn');
      }
    });
  },
  updateView: function updateView(type, form) {
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref3) {
      var html = _ref3.html,
          options = _ref3.options;

      if (options.item_count > 0) {
        var itemList = $(html.content).find('.ajax-cart__list');
        var cartDetails = $(html.content).find('.ajax-cart__details-wrapper');
        $('.ajax-cart__list').replaceWith(itemList);
        $('.ajax-cart__details-wrapper').replaceWith(cartDetails);
        $('.ajax-cart__empty-cart-message').addClass('is-hidden');
        $('.ajax-cart__form').removeClass('is-hidden');
        $('[data-ajax-cart-trigger]').addClass('has-cart-count');
        $('[data-bind="itemCount"]').text(options.item_count);
      } else {
        $('.ajax-cart__empty-cart-message').removeClass('is-hidden');
        $('.ajax-cart__form').addClass('is-hidden');
        $('[data-ajax-cart-trigger]').removeClass('has-cart-count');
        $('[data-bind="itemCount"]').text('0');
      }

      if (Currency.show_multiple_currencies) {
        Shopify.theme.currencyConverter.convertCurrencies();
      }

      if(type == 'update') {
        Shopify.theme.jsAjaxCart.updateCollectionPage();
      }
    }).fail(function () {// some error handling
    });
  },
  unload: function unload($section) {
    // Clear event listeners in theme editor
    $('.ajax-submit').off();
    $('[data-ajax-cart-delete]').off();
  }
};