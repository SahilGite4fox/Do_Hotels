async function currencyApiCall() {
  try {
    const response = await fetch('https://betaapi.oneuae.com/api/currency', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const rates = data?.results?.data?.rates;

      if (!rates) {
        console.error('No rates found in API response');
        return;
      }

      console.log('RATES:', rates); // ✅ Confirm it works now

      const select = document.querySelector(".mortCurSelt select");

      if (!select) {
        console.error('Select element not found');
        return;
      }

      // Clear existing options
      select.innerHTML = '';

      // Populate options
      Object.entries(rates).forEach(([currencyCode, exchangeRate]) => {
        const option = document.createElement('option');
        option.value = currencyCode;
        option.textContent = currencyCode;
        option.setAttribute('data-exchange', exchangeRate);
        select.appendChild(option);
      });

      // Set default value (AED) if available
      if (select.querySelector('option[value="AED"]')) {
        select.value = 'AED';
      }

    } else {
      const error = await response.json();
      console.error('API error:', error.message);
    }

  } catch (err) {
    console.error('Network or parsing error:', err);
  }
}

// Run after DOM is ready
document.addEventListener("DOMContentLoaded", currencyApiCall);


$(document).ready(function () {


  // AOS Initialize
  AOS.init({
    once: false,
    mirror: false,
    offset: 50,
    duration: 800,
    easing: 'ease-in-out',
  });


  $('.popup-youtube').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: false,

    callbacks: {
      open: function () {
        $('html, body').addClass('no-scroll');
      },
      close: function () {
        $('html, body').removeClass('no-scroll');
      }
    }
  });





  $('form').on('submit', async function (e) {
    e.preventDefault();

    const form = $(this);
    const formId = form.attr('id');
    let isValid = true;

    // Clear previous errors
    form.find('.error-message').remove();
    form.find('.floating-labelInp, .checkBoxFrm').removeClass('error');

    // === For Subscribe Form ===
    if (formId === 'subscribeForm') {
      const emailField = form.find('input[type="email"]');
      const emailValue = emailField.val();

      // Email validation
      if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
        showError(emailField, 'Enter a valid email address');
        return;
      }

      try {
        const response = await fetch('https://betaapi.dohotels.ae/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailValue })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Subscribed:', data);
          const successMessage = data?.results?.message || 'Message sent. We will keep you updated';
          showFormMessage('success', successMessage);
          form[0].reset();
        } else {
          const error = await response.json();
          console.error('Subscribe error:', error.message);
          const failMessage = error.message || 'Something went wrong..!';
          showFormMessage('fail', failMessage);

        }
      } catch (err) {
        console.error('Subscribe network error:', err);
        const failMessage = err || 'Something went wrong..!';
        showFormMessage('fail', failMessage);

      }

      return; // Stop further execution
    }

    // === For Other Forms ===

    // CAPTCHA validation
    // const captchaInput = document.getElementById("cpatchaTextBox");
    // if (captchaInput && captchaInput.value !== code) {
    //     document.getElementById("captchaValidation").innerHTML = "Incorrect CAPTCHA. Try again.";
    //     createCaptcha();
    //     return;
    // } else {
    //     document.getElementById("captchaValidation").innerHTML = "";
    // }

    // Validate all required fields
    form.find('[required]').each(function () {
      const $field = $(this);
      const fieldType = $field.attr('type');
      const tagName = $field.prop('tagName').toLowerCase();
      const value = $field.val();

      if (fieldType === 'checkbox' && !$field.is(':checked')) {
        showError($field, 'This checkbox is required');
        isValid = false;
        return;
      }

      if (tagName === 'select' && (!value || value === '')) {
        showError($field, 'Please select an option');
        isValid = false;
        return;
      }

      if (fieldType === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
        showError($field, 'Enter a valid email address');
        isValid = false;
        return;
      }

      if (fieldType === 'tel' && !/^\d{7,15}$/.test(value)) {
        showError($field, 'Enter a valid phone number');
        isValid = false;
        return;
      }

      if ($.trim(value) === '') {
        showError($field, 'This field is required');
        isValid = false;
      }
    });

    if (!isValid) return;

    // Serialize form data
    const formDataObj = {};
    form.serializeArray().forEach(({ name, value }) => {
      formDataObj[name] = value;
    });

    // Add project ID based on form
    if (formId === 'enquireFormHome') {
      formDataObj['projectID'] = form.find('[name="projectID"]').val() || '';
    } else if (formId === 'projectEnquireForm') {
      formDataObj['projectID'] = "DO Dubai Island";
    } else {
      formDataObj['projectID'] = "DO New Cairo";
    }

    // Include manually checked checkboxes
    form.find('input[type="checkbox"]:checked').each(function () {
      formDataObj[$(this).attr('name')] = true;
    });

    // Determine API endpoint
    const url = (formId === 'enquireForm')
      ? 'https://betaapi.dohotels.ae/api/contact-us'
      : 'https://betaapi.dohotels.ae/api/enquire';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataObj)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Submitted:', data);
        const successMessage = data.message || 'Message sent. We will keep you updated';
        showFormMessage('success', successMessage);
        createCaptcha();
        form[0].reset();
        form.find('.floating-label').removeClass('active');
      } else {
        const error = await response.json();
        console.error('Form error:', error.message);
        const failMessage = error.message || 'Something went wrong..!';
        showFormMessage('fail', failMessage);
      }
    } catch (err) {
      console.error('Form network error:', err);
      const failMessage = err || 'Something went wrong..!';
      showFormMessage('fail', failMessage);
    }
  });

  function showFormMessage(type, message = '') {
    const successBox = $('.formsucssMsg');
    const failBox = $('.formfailMsg');

    // Remove visibility class from both boxes first
    successBox.removeClass('form-message-visible');
    failBox.removeClass('form-message-visible');

    // Update message text dynamically
    if (type === 'success') {
      successBox.find('.formMsgTxt').text(message || 'Message sent. We will keep you updated');
    } else if (type === 'fail') {
      failBox.find('.formMsgTxt').text(message || 'Submission failed. Please try again');
    }

    // Select the appropriate box to show
    const targetBox = type === 'success' ? successBox : failBox;

    // Trigger a reflow to restart CSS animation
    void targetBox[0].offsetWidth;

    // Add class to show with animation
    targetBox.addClass('form-message-visible');

    // Hide after 4 seconds
    setTimeout(() => {
      targetBox.removeClass('form-message-visible');
    }, 4000);
  }



  function showError(element, message) {
    const wrapper = element.closest('.floating-labelInp').length
      ? element.closest('.floating-labelInp')
      : element.closest('.checkBoxFrm');

    wrapper.addClass('error');
    element.after('<div class="error-message" style="color:red; font-size:12px; margin-top:4px;">' + message + '</div>');
  }
  // Form Validation Over




  $('.ourDevSelectFloor-tabs button').on('click', function () {
    // Remove active class from all buttons
    $('.ourDevSelectFloor-tabs button').removeClass('active');
    $(this).addClass('active');

    // Get selected tab value
    var selectedWing = $(this).data('tab');

    // Show the corresponding wing div
    $('.ourDevSelectFloor-Awing, .ourDevSelectFloor-Bwing').removeClass('active');
    $('.ourDevSelectFloor-Awing[data-wing="' + selectedWing + '"], .ourDevSelectFloor-Bwing[data-wing="' + selectedWing + '"]').addClass('active');
  });


  // music driven

  $('.mdSlide').on('mouseenter click', function () {
    $('.mdSlide').removeClass('active'); // Remove from all
    $(this).addClass('active'); // Add to the hovered or clicked one
  });


  // Sticky Header

  $(window).on("scroll", function () {
    $("header").toggleClass("stickyHead", $(this).scrollTop() > 0);
  });



  // Code to handle floating lable

  // Function to toggle 'active' class based on value or focus

  function toggleFloatingLabel($element) {
    const hasValue = $element.val() !== '' && (!$element.is('select') || $element.find('option:selected').val() !== '');
    const isFocused = $element.is(':focus');
    const $label = $element.siblings('.floating-label');

    $label.toggleClass('active', hasValue || isFocused);

    // 👇 Apply color change if it's a <select>
    if ($element.is('select')) {
      $element.toggleClass('has-value', hasValue);
    }
  }

  // Event handler for focus, blur, and change

  function handleFloatingLabel(event) {
    toggleFloatingLabel($(this));
  }

  // Apply event handlers to inputs and selects

  $('.floating-labelInp').on('focus blur change', 'input, select', handleFloatingLabel);

  // Check initial state on page load

  $('.floating-labelInp input, .floating-labelInp select').each(function () {
    toggleFloatingLabel($(this));
  });

  // Code to handle file type floating lable and file name

  // Function to update the file name and toggle the floating label

  function updateFileName(inputElement) {
    var fileName = $(inputElement).val().split('\\').pop();
    var $label = $(inputElement).next('.file-option').find('.floating-label');
    var $fileNameSpan = $(inputElement).next('.file-option').find('.file-name');

    if (fileName) {
      $fileNameSpan.text(fileName); // Update the file name display
      $label.addClass('active'); // Float the label
    } else {
      $fileNameSpan.text(' '); // Set default text
      $label.removeClass('active'); // Reset the label
    }
  }



  // Tab Section
  $(".tabBtn").click(function () {
    var tab_id = $(this).data("id");

    $(".tabBtn, .tab-content").removeClass("active");
    $(this).addClass("active");
    $("#" + tab_id).addClass("active");

    // Reinitialize Slick slider inside the active tab
    $("#" + tab_id).find(".webStoriesSlider").slick("setPosition");
  });



  // Hamburger Menu
  $(".mobile_Menu > a").on("click", function () {
    $(".mobile_MenuContent").toggleClass("active");
    $("body").toggleClass("menu-open");

    if (!$(".menu-overlay").length) {
      $("header").append('<div class="menu-overlay"></div>');
    }
  });

  $(document).on("click", ".menu-overlay, .mobile_Menu_close", function () {
    $(".mobile_MenuContent").removeClass("active");
    $("body").removeClass("menu-open");
    $(".menu-overlay").remove();
  });



  function bindMobileDropdown() {
    if (window.matchMedia('(max-width: 950px)').matches) {
      $('.mobile_MenuContent li > a.d-flex').off('click').on('click', function (e) {
        e.preventDefault();

        const $dropdown = $(this).next('.dropdown');

        if ($dropdown.hasClass('open')) {
          // Collapse
          $dropdown.removeClass('open');
          $dropdown.css('height', $dropdown[0].scrollHeight + 'px'); // Set to current height first
          requestAnimationFrame(() => {
            $dropdown.css('height', '0');
          });
        } else {
          // Expand
          const fullHeight = $dropdown[0].scrollHeight + 'px';
          $dropdown.addClass('open');
          $dropdown.css('height', fullHeight);
        }

        // Optional: close others
        $('.dropdown').not($dropdown).removeClass('open').css('height', '0');
      });
    } else {
      // Unbind the dropdown click handler on wider screens
      $('.mobile_MenuContent li > a.d-flex').off('click');
      $('.dropdown').removeClass('open').css('height', ''); // Reset state
    }
  }

  // Run on page load
  bindMobileDropdown();

  // Run again on window resize
  $(window).on('resize', function () {
    bindMobileDropdown();
  });


  // Lazy Loading
  $("img, iframe").attr("loading", "lazy");



  $('.media_Cards').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 550,
        settings: "unslick" // disables slick below 550px
      }
    ]
  });

  $('.laguna_residence_slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  });





  $('.contactMobileTab > li').on('click', function () {

    // Remove active class from all li
    $('.contactMobileTab > li').removeClass('active');

    // Add active class to the clicked li
    $(this).addClass('active');

    // Get the location from data attribute
    var location = $(this).data('location');

    // Remove active from all contact cards
    $('.contactUsCard .dubai_cont, .contactUsCard .abuDhabi_cont').removeClass('active');

    // Add active only to selected location's content
    $('.contactUsCard .' + location).addClass('active');

    // Hide all map images and texts
    $('.contactUsMapCont-div .map-img, .contactUsMapCont-div .contactUsMapContTxt').removeClass('active');

    // Show only the selected location's image and text
    $('.contactUsMapCont-div .' + location).addClass('active');

  });





  $('g.dubai_point, g.abuDhabi_point').on('mouseenter', function () {

    if (window.innerWidth <= 950) return;

    const isDubai = $(this).hasClass('dubai_point');
    const showClass = isDubai ? 'dubai_cont' : 'abuDhabi_cont';
    const hideClass = isDubai ? 'abuDhabi_cont' : 'dubai_cont';

    // Show the map container
    $('.contactUsMapCont').css({
      opacity: 1,
      visibility: 'visible'
    });

    // Toggle visible content inside .contactUsMapCont
    $('.contactUsMapCont .' + hideClass).hide();
    $('.contactUsMapCont .' + showClass).show();

    // Toggle active class inside .contactUsCards
    $('.contactUsCards .' + hideClass).removeClass('active');
    $('.contactUsCards .' + showClass).addClass('active');

  });



  // Hide map container on mouseleave from g elements
  $('g.dubai_point, g.abuDhabi_point').on('mouseleave', function () {
    if (window.innerWidth <= 950) return;
    $('.contactUsMapCont').css({
      opacity: 0,
      visibility: 'hidden'
    });
  });



  // media slider
  $('.hmMediaSlideTxt').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: '.hmMediaSlideImg'
  });

  $('.hmMediaSlideImg').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    asNavFor: '.hmMediaSlideTxt',
    focusOnSelect: true,
  });


  // swiper slider
  var swiper = new Swiper(".boardSwiperBox", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 3,
      slideShadows: true,
    },

    keyboard: { enabled: true },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    breakpoints: {
      640: { slidesPerView: 2 },
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 2 },
      1560: { slidesPerView: 3 },
    },
  });



  // Marquee Slider
  $('.osLearInfoSlide').slick({
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0, // Important for seamless loop
    speed: 5000, // Slower speed for smooth continuous scroll
    cssEase: 'linear',
    infinite: true,
    arrows: false,
    dots: false,
    pauseOnHover: false,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: { slidesToShow: 6 }
      },
      {
        breakpoint: 1300,
        settings: { slidesToShow: 4 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ]
  });


  var $status = $('.propSpecSecslider-counter');
  var $slickElement = $('.propSpecTxtSec');

  // Bind before initializing
  $slickElement.on('init reInit afterChange', function (event, slick, currentSlide) {
    var i = (currentSlide ? currentSlide : 0) + 1;
    $status.text(i + '/' + slick.slideCount);
  });


  $('.propSpecTxtSec').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: '.propSpecImg'
  });

  $('.propSpecImg').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    asNavFor: '.propSpecTxtSec',
  });

  // Review Slider
  $('.dev-ReviewsSliderContent').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dots: true,
    appendDots: $('.dev-ReviewsDots'),
    customPaging: function (slider, i) {
      return '<button type="button"></button>';
    }
  });

  $('.mediaFeatSlider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dots: true,
    appendDots: $('.mediaFeatDots'),
    customPaging: function (slider, i) {
      return '<button type="button"></button>';
    }
  });

  // Function to update dot sizes within a specific dot container
  function updateDotSizes(currentIndex, $dotContainer) {
    const $dots = $dotContainer.find('button');
    $dots.each(function (i) {
      const distance = Math.abs(i - currentIndex);
      const size = Math.max(6, 16 - distance * 2);
      const opacity = Math.max(0.4, 1 - distance * 0.2); // 1.0 for active, down to 0.4

      $(this).css({
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity
      }).toggleClass('active', i === currentIndex);
    });
  }


  // Hook into both sliders with correct dot containers
  $('.dev-ReviewsSliderContent').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
    updateDotSizes(nextSlide, $('.dev-ReviewsDots'));
  });
  $('.mediaFeatSlider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
    updateDotSizes(nextSlide, $('.mediaFeatDots'));
  });

  // Initial sizing
  setTimeout(() => {
    updateDotSizes(0, $('.dev-ReviewsDots'));
    updateDotSizes(0, $('.mediaFeatDots'));
  }, 10);





});



// Home Slides
gsap.registerPlugin(ScrollTrigger);

// Save styles for responsive switching
ScrollTrigger.saveStyles(".subSecend, .hmOurDevelop");

// Global reference for ScrollTrigger instance
let subSecendScrollTrigger;

// 🔁 Parallax effect setup
function initParallax() {
  gsap.utils.toArray(".parallaxBg").forEach(section => {
    let image = section.querySelector(".parallax-image");
    if (!image) return;

    gsap.to(image, {
      y: "-30%",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
  });
}

// 🌀 Horizontal scroll GSAP setup
function initGSAP() {
  let horizontalSection = document.querySelector('.subSecend');
  const cards = gsap.utils.toArray(".sr-commdiv");

  subSecendScrollTrigger = gsap.to('.subSecend', {
    x: () => horizontalSection.scrollWidth * -1,
    xPercent: 100,
    scrollTrigger: {
      trigger: '.subSecend',
      start: 'bottom bottom-=20',
      end: "+=" + (cards.length * window.innerHeight),
      pin: '.hmOurDevelop',
      scrub: true,
      invalidateOnRefresh: true,
      id: 'subSecendScroll'
    }
  }).scrollTrigger;
}

// ❌ Destroy GSAP ScrollTrigger and styles
function destroyGSAP() {
  if (subSecendScrollTrigger) {
    subSecendScrollTrigger.kill();
    subSecendScrollTrigger = null;
  }

  gsap.killTweensOf('.subSecend');

  const el = document.querySelector('.subSecend');
  if (el) el.style.transform = '';

  const pinEl = document.querySelector('.hmOurDevelop');
  if (pinEl) {
    pinEl.style.position = '';
    pinEl.style.top = '';
    pinEl.style.left = '';
    pinEl.style.width = '';
    pinEl.style.transform = '';
  }
}

// 🧊 Slick initialization
function initSlick() {
  $('.subSecend').slick({
    dots: false,
    infinite: true,
    arrows: true,
    speed: 300,
    slidesToShow: 1,
    autoplay: true
  });
}

// 🔥 Destroy Slick if active
function destroySlick() {
  if ($('.subSecend').hasClass('slick-initialized')) {
    $('.subSecend').slick('unslick');
  }
}

// 📱 Handle responsive behavior
function handleResponsive() {
  const width = window.innerWidth;

  if (width <= 820) {
    destroyGSAP();

    setTimeout(() => {
      initSlick();
      ScrollTrigger.refresh(); // Refresh after slick init
    }, 100);
  } else {
    destroySlick();
    initGSAP();
    ScrollTrigger.refresh(); // Refresh after GSAP init
  }
}

// 🚀 Run on page load
window.addEventListener('load', () => {
  handleResponsive();
  initParallax(); // Ensure parallax runs after layout settles
  ScrollTrigger.refresh(); // Final refresh
});

// 🔄 Run on resize
window.addEventListener('resize', () => {
  handleResponsive();
  ScrollTrigger.refresh();
});





gsap.registerPlugin(ScrollTrigger);

// Step 1: Fade up the heading
document.querySelectorAll('h2.spanGredient').forEach(el => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "bottom bottom",
      toggleActions: "play none none reverse"
    },
    opacity: 1,
    y: 0,
    duration: 2,
    ease: "power2.out"
  });
});

document.querySelectorAll('h2.spanGredient').forEach(el => {
  ScrollTrigger.create({
    trigger: el,
    start: "center bottom",
    toggleActions: "play play play play",
    onEnter: () => {
      el.classList.add('animateGradient');
    }
  });
});



// Floar Section LightUp Animation
ScrollTrigger.create({
  trigger: ".floarPlanSec",
  start: "top top",
  toggleActions: "play none none reverse",
  onEnter: () => {
    const spans = document.querySelectorAll(".ourDevSelectFloor-AwingFl button span, .ourDevSelectFloor-Bwing button span");

    spans.forEach((span, i) => {
      gsap.fromTo(
        span,
        { backgroundColor: "rgba(255,255,255,0)" },
        {
          backgroundColor: "rgba(255,255,255,0.6)",
          duration: 0.4,
          delay: i * 0.15,
          ease: "power1.inOut",
          onComplete: () => {
            gsap.to(span, {
              backgroundColor: "rgba(255,255,255,0)",
              duration: 0.4,
              ease: "power1.inOut"
            });
          }
        }
      );
    });
  }
});



// document.querySelectorAll(".pinOnScroll").forEach((section) => {
//   ScrollTrigger.create({
//     trigger: section,
//     start: "top top",
//     end: "+=100%", // You can customize this for each section if needed
//     pin: true,
//     pinSpacing: false
//   });
// });












// Hotel & Restorent Banner background zoomout animation
// Timeline for ourDevelopSec
// GSAP timeline with ScrollTrigger
// Apply ScrollTrigger only on screens wider than 610px
ScrollTrigger.matchMedia({
  "(min-width: 611px)": function () {
    let t5 = gsap.timeline({
      scrollTrigger: {
        id: "ourDevelopScroll", // Add this ID
        trigger: ".ourDevelopSec",
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: true,
        pinSpacing: true
      }
    });

    t5.to(".ourDevelopSec", {
      backgroundSize: "100% 110%",
      ease: "none"
    })
      .to(".locAmountBox", {
        opacity: 1,
        y: 0,
        duration: 1
      });


    let button = document.querySelector(".projHeroSecBtn");
    let hasFadedOut = false;

    window.addEventListener("scroll", () => {
      let scrollTop = window.scrollY || window.pageYOffset;

      if (scrollTop > 50 && !hasFadedOut) {
        hasFadedOut = true;
        gsap.to(button, { opacity: 0, duration: 0.5, ease: "power1.out" });
      } else if (scrollTop <= 50 && hasFadedOut) {
        hasFadedOut = false;
        gsap.to(button, { opacity: 1, duration: 0.5, ease: "power1.out" });
      }
    });
  }
});


// let t5 = gsap.timeline({
//   scrollTrigger: {
//     id: "ourDevelopScroll",
//     trigger: ".ourDevelopSec",
//     start: "top top",
//     end: "+=100%",
//     scrub: 1,
//     pin: true,
//     pinSpacing: true
//   }
// });

// t5.to(".ourDevelopSec", {
//   backgroundSize: "100% 110%",
//   ease: "none"
// })
// .to(".locAmountBox", {
//   opacity: 1,
//   y: 0,
//   duration: 1
// });

// // Smooth scroll to end of ScrollTrigger on button click
// document.querySelector(".projHeroSecBtn a").addEventListener("click", function (e) {
//   e.preventDefault();

//   let trigger = ScrollTrigger.getById("ourDevelopScroll");

//   if (trigger) {
//     // This is the exact scroll position where the ScrollTrigger ends
//     let endScroll = trigger.end;

//     // Smooth scroll to that point — this allows ScrollTrigger to handle the animation frame-by-frame
//     gsap.to(window, {
//       scrollTo: { y: endScroll, autoKill: false },
//       duration: 2.5,
//       ease: "expo.inOut"
//     });
//   }
// });


// let btn = document.querySelector(".projHeroSecBtn a");
// btn.addEventListener("mousedown", () => {
//   gsap.to(btn, { scale: 0.95, duration: 0.2, ease: "power1.out" });
// });
// btn.addEventListener("mouseup", () => {
//   gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
// });



// // Fade out/in scroll button based on scroll position
// let button = document.querySelector(".projHeroSecBtn");
// let hasFadedOut = false;

// window.addEventListener("scroll", () => {
//   let scrollTop = window.scrollY || window.pageYOffset;

//   if (scrollTop > 50 && !hasFadedOut) {
//     hasFadedOut = true;
//     gsap.to(button, { opacity: 0, duration: 0.5, ease: "power1.out" });
//   } else if (scrollTop <= 50 && hasFadedOut) {
//     hasFadedOut = false;
//     gsap.to(button, { opacity: 1, duration: 0.5, ease: "power1.out" });
//   }
// });










// pinOnScroll
// Generic pin-only sections (excluding ourDevelopSec)
ScrollTrigger.matchMedia({
  // For screen widths 610px and above
  "(min-width: 610px)": function () {
    document.querySelectorAll(".pinOnScroll").forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: false
      });
    });
  }
});







// Prallax effect for video
// const parallaxElements = document.querySelectorAll(".parallaxVidBg");

// window.addEventListener("scroll", function () {
//   let offset = window.pageYOffset;
//   parallaxElements.forEach(function (el) {
//     el.style.transform = `translateY(${offset * 0.3}px)`; // Adjust multiplier as needed
//   });
// });

gsap.set(".parallaxVidBg", { y: 50, opacity: 0 });
ScrollTrigger.create({
  trigger: ".parallaxVidBg",
  start: "top top",
  end: "+=100%",
  pin: true,
  pinSpacing: false,
  onEnter: () => gsap.to(section, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }),
});









// Mortage Calculator Code


// Code with AED & USD Dropdown





function formatNumber(num, isInterest = false) {
  if (isNaN(num) || num === null) return "";
  if (isInterest) {
    // For interest rates, we want exactly 2 decimal places
    return Number(num).toFixed(2);
  } else {
    // For currency amounts, we want commas and optional decimals
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }
}

// Add a new function specifically for currency amounts with decimals
function formatCurrency(num) {
  if (isNaN(num) || num === null) return "";
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function updateRangeTrack(container) {
  if (!container) return;
  let range = container.querySelector(".rangeInput");
  let track = container.querySelector(".range-track");
  if (!range || !track) return;
  let percent = ((range.value - range.min) / (range.max - range.min)) * 100;
  track.style.width = percent + "%";
  range.style.setProperty('--val', `${percent}%`);
}

function calculateMonthlyPayment(P, annualRate, years) {
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  return r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

function updateDownPaymentPercentage(purchasePrice = null) {
  const sections = document.querySelectorAll(".mortCalcInpSec");
  const purchasePriceSec = sections[0];
  const downPaymentSec = sections[1];
  const purchasePriceInput = purchasePriceSec.querySelector(".valueInput");
  const downPaymentInput = downPaymentSec.querySelector(".valueInput");
  const percentSpan = downPaymentSec.querySelector(".inpAbTxt");
  const downPaymentRange = downPaymentSec.querySelector(".rangeInput");

  if (purchasePrice === null) {
    purchasePrice = parseInt(purchasePriceInput.value.replace(/,/g, ""));
  }

  let downPayment = parseInt(downPaymentInput.value.replace(/,/g, ""));
  if (isNaN(downPayment)) downPayment = 0;

  if (!isNaN(purchasePrice) && purchasePrice > 0) {
    const minDownPayment = Math.round(purchasePrice * 0.2);
    const maxDownPayment = Math.round(purchasePrice * 0.6);

    let validDownPayment = downPayment;
    if (downPayment > maxDownPayment) validDownPayment = maxDownPayment;
    if (downPayment < minDownPayment) validDownPayment = minDownPayment;

    downPaymentRange.min = minDownPayment;
    downPaymentRange.max = maxDownPayment;
    downPaymentRange.value = validDownPayment;

    downPaymentInput.value = formatNumber(validDownPayment);
    const percent = (validDownPayment / purchasePrice) * 100;
    percentSpan.textContent = `${percent.toFixed(1)}%`;

    const currency = document.querySelector('.mortCurSelt select').value;

    const minLabel = downPaymentSec.querySelector(".minValvs .currency-amount");
    const maxLabel = downPaymentSec.querySelector(".maxValvs .currency-amount");
    if (minLabel) minLabel.textContent = formatNumber(minDownPayment);
    if (maxLabel) maxLabel.textContent = formatNumber(maxDownPayment);

    const minLabelWrap = downPaymentSec.querySelector(".minValvs .currency-label");
    const maxLabelWrap = downPaymentSec.querySelector(".maxValvs .currency-label");
    if (minLabelWrap) minLabelWrap.textContent = currency;
    if (maxLabelWrap) maxLabelWrap.textContent = currency;

    updateRangeTrack(downPaymentSec.querySelector(".range-container"));
  }
}

function updateMonthlyPayment() {
  const sections = document.querySelectorAll(".mortCalcInpSec");
  const purchasePrice = parseInt(sections[0].querySelector(".valueInput").value.replace(/,/g, ""));
  const downPayment = parseInt(sections[1].querySelector(".valueInput").value.replace(/,/g, ""));
  const loanPeriod = parseInt(sections[2].querySelector(".valueInput").value.replace(/,/g, ""));
  const interestRateRaw = sections[3].querySelector(".valueInput").value.replace(/,/g, "");
  const interestRate = parseFloat(interestRateRaw);

  if (isNaN(purchasePrice) || isNaN(downPayment) || isNaN(loanPeriod) || isNaN(interestRate)) return;

  const loanAmount = purchasePrice - downPayment;
  const monthlyInterest = interestRate / 100 / 12;
  const numberOfPayments = loanPeriod * 12;

  const monthly = loanAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) / (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);

  const currencySelect = document.querySelector('.mortCurSelt select');
  const currency = currencySelect.value;
  const exchangeRate = parseFloat(currencySelect.selectedOptions[0].getAttribute('data-exchange')) || 1;

  let displayValue = (monthly * exchangeRate);

  const emiDisplay = document.querySelector(".mortageTotalAmo p");
  if (emiDisplay) {
    const label = emiDisplay.querySelector(".currency-label");
    if (label) label.textContent = currency;

    const amountText = emiDisplay.childNodes[1];
    // Use the new formatCurrency function here
    const formattedAmount = formatCurrency(displayValue);

    if (amountText && amountText.nodeType === Node.TEXT_NODE) {
      amountText.nodeValue = ` ${formattedAmount}`;
    }
  }

  updateDownPaymentPercentage(purchasePrice);
}

function initOriginalAEDValues() {
  document.querySelectorAll('.currency-amount').forEach(span => {
    let val = parseFloat(span.textContent.replace(/,/g, ''));
    if (!isNaN(val)) {
      span.setAttribute('data-aed', val);
    }
  });

  document.querySelectorAll('.valueInput').forEach(input => {
    let val = parseFloat(input.value.replace(/[^\d.]/g, ''));
    if (!isNaN(val)) {
      input.setAttribute('data-aed', val);
    }
  });

  document.querySelectorAll('.rangeInput').forEach(range => {
    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    if (!isNaN(min)) range.setAttribute('data-aed-min', min);
    if (!isNaN(max)) range.setAttribute('data-aed-max', max);
  });
}

function syncInitialInputAndRange() {
  document.querySelectorAll(".mortCalcInpSec").forEach(section => {
    const input = section.querySelector(".valueInput");
    const range = section.querySelector(".rangeInput");
    const container = section.querySelector(".range-container");

    if (!input || !range) return;

    const isInterest = section.querySelector("label")?.textContent.toLowerCase().includes("interest");

    let val = input.value.replace(/[^\d.]/g, '');
    let num = parseFloat(val);
    if (isNaN(num)) return;

    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    const clampedNum = Math.min(Math.max(num, min), max);

    input.value = isInterest ? formatNumber(clampedNum, true) : formatNumber(clampedNum);
    range.value = clampedNum;

    updateRangeTrack(container);
  });
}


function setupInputRangeSync() {
  document.querySelectorAll(".mortCalcInpSec").forEach(section => {
    const range = section.querySelector(".rangeInput");
    const input = section.querySelector(".valueInput");
    const container = section.querySelector(".range-container");

    if (!range || !input) return;

    const isInterest = section.querySelector("label")?.textContent.toLowerCase().includes("interest");

    // Create hidden span to measure text width
    let hiddenSpan = document.createElement("span");
    hiddenSpan.style.visibility = "hidden";
    hiddenSpan.style.position = "absolute";
    hiddenSpan.style.whiteSpace = "pre";
    hiddenSpan.style.fontSize = getComputedStyle(input).fontSize;
    hiddenSpan.style.fontFamily = getComputedStyle(input).fontFamily;
    document.body.appendChild(hiddenSpan);

    const updateInputWidth = () => {
      if (isInterest) {
        hiddenSpan.textContent = input.value || "0";
        input.style.width = `${hiddenSpan.offsetWidth + 2}px`;
      }
    };

    updateInputWidth();

    input.addEventListener("keydown", function (e) {
      const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
      if (allowedKeys.includes(e.key)) return;

      if (isInterest) {
        if (!/[0-9.]/.test(e.key) || (e.key === '.' && this.value.includes('.'))) {
          e.preventDefault();
        }
      } else {
        if (!/[0-9]/.test(e.key)) {
          e.preventDefault();
        }
      }
    });

    range.addEventListener("input", function () {
      const val = parseFloat(this.value);
      input.value = formatNumber(val, isInterest);

      input.classList.remove("input-error");
      hideValidationMessage(input);
      updateRangeTrack(container);
      updateMonthlyPayment();

      updateInputWidth();
    });

    input.addEventListener("input", function () {
      let rawVal = this.value;

      if (isInterest) {
        rawVal = rawVal.replace(/[^0-9.]/g, '');
        const parts = rawVal.split('.');
        if (parts.length > 2) rawVal = parts[0] + '.' + parts.slice(1).join('');
        if (parts[1]) rawVal = parts[0] + '.' + parts[1].substring(0, 2);
      } else {
        rawVal = rawVal.replace(/\D/g, '');
      }

      let num = parseFloat(rawVal);
      if (isNaN(num)) num = 0;

      const min = parseFloat(range.min);
      const max = parseFloat(range.max);
      const clampedNum = Math.min(Math.max(num, min), max);

      // ✅ Always update the range and track, even if input is invalid
      range.value = clampedNum;
      updateRangeTrack(container);

      if (num < min || num > max) {
        input.classList.add("input-error");
        $('.interestPer').css('display', isInterest ? 'none' : 'block');
        showValidationMessage(input, `Enter a value between ${formatNumber(min, isInterest)} and ${formatNumber(max, isInterest)}`);
        input.value = rawVal;
      } else {
        input.classList.remove("input-error");
        hideValidationMessage(input);
        $('.interestPer').css('display', isInterest ? 'block' : 'block');

        input.setAttribute('data-aed', clampedNum);
        input.value = isInterest ? rawVal : formatNumber(clampedNum, false);
        updateMonthlyPayment();

        const allSections = document.querySelectorAll(".mortCalcInpSec");
        if (section === allSections[0] || section === allSections[1]) {
          updateDownPaymentPercentage(parseInt(allSections[0].querySelector(".valueInput").value.replace(/,/g, "")));
        }
      }

      updateInputWidth();
    });


    input.addEventListener("blur", function () {
      let val = this.value.replace(/[^\d.]/g, '');
      let num = parseFloat(val);
      const range = section.querySelector(".rangeInput");
      const isInterest = section.querySelector("label")?.textContent.toLowerCase().includes("interest");
      const min = parseFloat(range.min);
      const max = parseFloat(range.max);

      if (isNaN(num)) num = min;
      if (num < min) num = min;
      if (num > max) num = max;

      this.value = formatNumber(num, isInterest);
      range.value = num;
      this.setAttribute('data-aed', num);

      updateRangeTrack(section.querySelector(".range-container"));
      updateMonthlyPayment();

      // ✅ Dynamically update the width after formatting
      updateInputWidth();
    });

    updateRangeTrack(container);
  });
}


// 🌐 Global click handler to remove validation if value becomes valid
document.addEventListener("click", function () {
  document.querySelectorAll(".valueInput").forEach(input => {
    const section = input.closest(".mortCalcInpSec");
    const range = section?.querySelector(".rangeInput");
    const container = section?.querySelector(".range-container");

    if (!range || !section) return;

    const isInterest = section.querySelector("label")?.textContent.toLowerCase().includes("interest");
    let val = parseFloat(input.value.replace(/[^0-9.]/g, ''));

    if (isNaN(val)) {
      // Don’t update anything if the value is invalid (e.g., empty input)
      return;
    }

    let min = parseFloat(range.min);
    let max = parseFloat(range.max);

    // Only allow updating min/max if the value is within reasonable bounds
    const originalMin = parseFloat(range.getAttribute('data-aed-min')) || min;
    const originalMax = parseFloat(range.getAttribute('data-aed-max')) || max;

    if (val < originalMin || val > originalMax) {
      // Don't modify range limits if user typed an out-of-bounds number
      val = Math.min(Math.max(val, originalMin), originalMax);
    }

    // Now update input and range to the clamped value
    input.value = formatNumber(val, isInterest);
    input.setAttribute('data-aed', val);
    range.value = val;

    $('.interestPer').css('display', 'block');
    input.classList.remove("input-error");
    hideValidationMessage(input);
    updateRangeTrack(container);
    updateMonthlyPayment();
  });
});






function showValidationMessage(input, message) {
  let msg = input.parentElement.querySelector(".error-message");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "error-message";
    input.parentElement.appendChild(msg);
  }
  msg.textContent = message;
  msg.style.display = "block";
}

function hideValidationMessage(input) {
  const msg = input.parentElement.querySelector(".error-message");
  if (msg) {
    msg.style.display = "none";
  }
}



// Currency change handler with conversion
function setupCurrencyChange() {
  document.querySelector('.mortCurSelt select').addEventListener('change', function () {
    const selectedOption = this.selectedOptions[0];
    const newCurrency = selectedOption.value;
    const newExchangeRate = parseFloat(selectedOption.getAttribute('data-exchange'));

    if (!newExchangeRate || isNaN(newExchangeRate)) {
      console.error("Invalid exchange rate for selected currency.");
      return;
    }

    // Update currency symbols
    document.querySelectorAll('.currency-label').forEach(el => {
      el.textContent = newCurrency;
    });

    // Convert .currency-amount spans
    document.querySelectorAll('.currency-amount').forEach(span => {
      const baseAED = parseFloat(span.getAttribute('data-aed'));
      if (!isNaN(baseAED)) {
        const newVal = baseAED * newExchangeRate;
        span.textContent = formatNumber(newVal, false);
      }
    });

    // Update inputs and sliders
    document.querySelectorAll('.mortCalcInpSec').forEach(section => {
      const labelText = section.querySelector("label")?.textContent.toLowerCase();
      if (labelText.includes("loan period") || labelText.includes("interest")) return;

      const input = section.querySelector('.valueInput');
      const range = section.querySelector('.rangeInput');

      const baseAED = parseFloat(input?.getAttribute('data-aed'));
      if (!isNaN(baseAED)) {
        const newVal = baseAED * newExchangeRate;
        input.value = formatNumber(newVal, false);

        if (range) {
          const baseMin = parseFloat(range.getAttribute('data-aed-min'));
          const baseMax = parseFloat(range.getAttribute('data-aed-max'));

          if (!isNaN(baseMin) && !isNaN(baseMax)) {
            const newMin = baseMin * newExchangeRate;
            const newMax = baseMax * newExchangeRate;

            range.min = Math.round(newMin);
            range.max = Math.round(newMax);
            range.value = Math.round(newVal);

            updateRangeTrack(section.querySelector(".range-container"));

            const minLabel = section.querySelector(".minValvs .currency-amount");
            const maxLabel = section.querySelector(".maxValvs .currency-amount");

            if (minLabel) minLabel.textContent = formatNumber(newMin, false);
            if (maxLabel) maxLabel.textContent = formatNumber(newMax, false);
          }
        }
      }
    });

    updateMonthlyPayment();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const initialCurrency = document.querySelector('.mortCurSelt select')?.value || "AED";
  document.querySelectorAll('.currency-label').forEach(el => {
    el.textContent = initialCurrency;
  });

  initOriginalAEDValues();
  syncInitialInputAndRange(); // 🔄 <-- sync input and range before user interaction
  setupInputRangeSync();
  setupCurrencyChange();
  updateMonthlyPayment();
});

