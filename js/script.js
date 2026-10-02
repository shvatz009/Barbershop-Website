// ==========================
// File: js/main.js
// Vintage Barbershop Project
// ==========================
// ------ DOM Elements ------
const yearEl = document.getElementById("year");
const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthLabel = document.getElementById("calendarMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const selectedDateLabel = document.getElementById("selectedDate");
const timeSlots = document.getElementById("timeSlots");
const selectedTimeLabel = document.getElementById("selectedTime");
const changeTimeBtn = document.getElementById("changeTimeBtn");
const selectedTimeInput = document.getElementById("selectedTimeInput");
const hoursList = document.getElementById("hoursList");
const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const customerNameInput = document.getElementById("customerName");
const customerServiceInput = document.getElementById("customerService");
const customerEmailInput = document.getElementById("customerEmail");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const featureGrid = document.getElementById("featureGrid");
const ctaBtn = document.getElementById("ctaPrimary");
const ctaText = document.getElementById("ctaText");
const callBtn = document.getElementById("ctaSecondary");
const phoneNumber = document.getElementById("phoneNumber");
const callModal = document.getElementById("callModal");
const callModalOverlay = document.getElementById("callModalOverlay");
const callModalClose = document.getElementById("callModalClose");
const callModalPhone = document.getElementById("callModalPhone");
let callModalTrigger = null;
const heading = document.getElementById("heroHeading");
const nav = document.getElementById("nav");
const siteHeader = document.querySelector(".site-header");
const heroSubtext = document.getElementById("heroSubtext");
// ----- Modal Elements ----- 
const serviceModal = document.getElementById("serviceModal");
const serviceModalOverlay = document.getElementById("serviceModalOverlay");
const serviceModalClose = document.getElementById("serviceModalClose");
const serviceModalTitle = document.getElementById("serviceModalTitle");
const serviceModalPrice = document.getElementById("serviceModalPrice");
const serviceModalList = document.getElementById("serviceModalList");
let serviceModalTrigger = null;
//------ Calendar / Booking Logic -----
const today = new Date();
today.setHours(0, 0, 0, 0);
let displayedCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedCalendarDate = null;
let bookingAvailability = window.bookingAvailability ?? {};
const businessHours = [
    { days: [1, 2, 3, 4, 5], label: "Mon-Fri", opensAt: 9 * 60, closesAt: 19 * 60 },
    { days: [6], label: "Sat", opensAt: 10 * 60, closesAt: 17 * 60 },
    { days: [0], label: "Sun", closed: true }
];
//
// -------Services Data (Array of Objects) -------//
const services = [
    {
        id: 1,
        title: "Classic Haircut",
        alt: "Classic Haircut",
        text: "Timeless cuts with modern precision tailored to your style",
        Image: "assets/images/feature-1.jpg",
        price: "$25",
        popular: true,
        details: [
            "Consultation to understand your desired style",
            "Precision haircut using scissors and clippers",
        ]
    },
    {
        id: 2,
        title: "Beard Trim",
        alt: "Beard Trim",
        text: "Expert beard shaping and maintenance for a polished look",
        Image: "assets/images/feature-2.jpg",
        price: "$15",
        popular: false,
        details: [
            "Shaping and trimming to your desired beard style",
            "Skin care and moisturizing for a healthy appearance"
        ]
    },
    {
        id: 3,
        title: "Straight Razor Shave",
        alt: "Straight Razor Shave",
        text: "Luxurious shaves with warm towels for a smooth finish",
        Image: "assets/images/feature-3.jpg",
        price: "$30",
        popular: true,
        details: [
            "Traditional shaving experience with a straight razor",
            "Warm towels and post-shave care for a luxurious feel"
        ]
    },
    {
        id: 4,
        title: "Childrens Haircuts",
        alt: "Childrens Haircuts",
        text: "Specialized cuts for kids with a fun and comfortable experience.",
        Image: "assets/images/feature-5.jpg",
        price: "$15",
        popular: false,
        details: [
            "Fun and engaging haircut experience for children",
            "Safe and gentle techniques for a comfortable visit",
            "ASD friendly environment with trained staff to accommodate children with special needs"
        ]
    },
    {
        id: 5,
        title: "Fade and Style",
        alt: "Fade and Style",
        text: "Modern fades and styles for a contemporary look",
        Image: "assets/images/feature-4.jpg",
        price: "$25",
        popular: true,
        details: [
            "Precision fading for a seamless blend",
            "Custom styling to match your personal taste"
        ]
    }
];
//----- Nav Links (for future use) -----
const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Services", href: "#features" },
    { label: "Book", href: "#cta" },
    { label: "Contact", href: "#footer" }
];
// ----- Helpers / Functions -----
// Update footer year automatically
function setCurrentYear() {
    const now = new Date();
    yearEl.textContent = now.getFullYear();
}
const getCalendarDateKey = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};
const formatClockTime = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const minute = String(minutes % 60).padStart(2, "0");
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
};
const renderBusinessHours = () => {
    if (!hoursList) return;

    hoursList.innerHTML = businessHours.map((schedule) => {
        const hours = schedule.closed
            ? "Closed"
            : `${formatClockTime(schedule.opensAt)} - ${formatClockTime(schedule.closesAt)}`;
        return `<li>${schedule.label}: ${hours}</li>`;
    }).join("");
};
const renderTimeSlots = (date = null) => {
    if (!timeSlots) return;

    if (selectedTimeInput) selectedTimeInput.value = "";
    timeSlots.classList.remove("is-collapsed");
    if (selectedTimeLabel) selectedTimeLabel.textContent = "Choose a time";
    if (changeTimeBtn) changeTimeBtn.hidden = true;
    if (!date) {
        timeSlots.innerHTML = '<p class="time-slot-message">Choose a date to see available times.</p>';
        return;
    }

    const schedule = businessHours.find((hours) => hours.days.includes(date.getDay()));
    if (!schedule || schedule.closed) {
        timeSlots.innerHTML = '<p class="time-slot-message">Closed on this day.</p>';
        return;
    }

    const bookedTimes = bookingAvailability[getCalendarDateKey(date)] ?? [];
    let slotsMarkup = "";
    for (let startTime = schedule.opensAt; startTime < schedule.closesAt; startTime += 30) {
        const time = formatClockTime(startTime);
        const isBooked = bookedTimes.includes(time);
        const classes = ["time-slot-btn", isBooked && "booked"].filter(Boolean).join(" ");
        const bookedLabel = isBooked ? ", already booked" : "";
        slotsMarkup += `<button type="button" class="${classes}" data-time="${time}" aria-label="${time}${bookedLabel}" aria-pressed="false"${isBooked ? " disabled" : ""}>${time}</button>`;
    }
    timeSlots.innerHTML = slotsMarkup;
};
window.updateBookingAvailability = (availability) => {
    if (!availability || typeof availability !== "object") return;

    bookingAvailability = availability;
    if (selectedCalendarDate) renderTimeSlots(selectedCalendarDate);
};
renderBusinessHours();
renderTimeSlots();
const renderCalendar = () => {
    if (!calendarGrid || !calendarMonthLabel) return;

    const year = displayedCalendarMonth.getFullYear();
    const month = displayedCalendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstAvailableMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    calendarMonthLabel.textContent = displayedCalendarMonth.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
    });
    if (prevMonthBtn) {
        prevMonthBtn.disabled = displayedCalendarMonth <= firstAvailableMonth;
    }

    let daysMarkup = "";
    for (let blankDay = 0; blankDay < firstWeekday; blankDay += 1) {
        daysMarkup += '<span class="calendar-empty" aria-hidden="true"></span>';
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dateKey = getCalendarDateKey(date);
        const isPast = date < today;
        const isToday = dateKey === getCalendarDateKey(today);
        const isSelected = selectedCalendarDate && dateKey === getCalendarDateKey(selectedCalendarDate);
        const classes = [
            "calendar-day",
            isToday && "today",
            isSelected && "selected",
            isPast && "disabled"
        ].filter(Boolean).join(" ");

        daysMarkup += `<button type="button" class="${classes}" data-date="${dateKey}" aria-pressed="${Boolean(isSelected)}"${isPast ? " disabled" : ""}>${day}</button>`;
    }

    calendarGrid.innerHTML = daysMarkup;
};

prevMonthBtn?.addEventListener("click", () => {
    displayedCalendarMonth = new Date(
        displayedCalendarMonth.getFullYear(),
        displayedCalendarMonth.getMonth() - 1,
        1
    );
    renderCalendar();
});
nextMonthBtn?.addEventListener("click", () => {
    displayedCalendarMonth = new Date(
        displayedCalendarMonth.getFullYear(),
        displayedCalendarMonth.getMonth() + 1,
        1
    );
    renderCalendar();
});
calendarGrid?.addEventListener("click", (event) => {
    const dayButton = event.target.closest(".calendar-day");
    if (!dayButton || dayButton.disabled) return;

    const [year, month, day] = dayButton.dataset.date.split("-").map(Number);
    selectedCalendarDate = new Date(year, month - 1, day);
    renderTimeSlots(selectedCalendarDate);
    bookingMessage?.classList.remove("error", "success");
    if (bookingMessage) bookingMessage.textContent = "";

    const previousSelection = calendarGrid.querySelector(".calendar-day.selected");
    previousSelection?.classList.remove("selected");
    previousSelection?.setAttribute("aria-pressed", "false");
    dayButton.classList.add("selected");
    dayButton.setAttribute("aria-pressed", "true");

    if (selectedDateLabel) {
        selectedDateLabel.textContent = selectedCalendarDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }
});
timeSlots?.addEventListener("click", (event) => {
    const timeButton = event.target.closest(".time-slot-btn");
    if (!timeButton || timeButton.disabled) return;

    timeSlots.querySelector(".time-slot-btn.selected")?.classList.remove("selected");
    timeSlots.querySelector(".time-slot-btn[aria-pressed='true']")?.setAttribute("aria-pressed", "false");
    timeButton.classList.add("selected");
    timeButton.setAttribute("aria-pressed", "true");
    if (selectedTimeInput) selectedTimeInput.value = timeButton.dataset.time;
    if (selectedTimeLabel) selectedTimeLabel.textContent = timeButton.dataset.time;
    timeSlots.classList.add("is-collapsed");
    if (changeTimeBtn) changeTimeBtn.hidden = false;
    bookingMessage?.classList.remove("error", "success");
    if (bookingMessage) bookingMessage.textContent = "";
});
changeTimeBtn?.addEventListener("click", () => {
    timeSlots?.classList.remove("is-collapsed");
    changeTimeBtn.hidden = true;
    timeSlots?.querySelector(".time-slot-btn.selected")?.focus();
});
bookingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingMessage || !customerNameInput || !customerServiceInput || !customerEmailInput) return;

    bookingMessage.classList.remove("error", "success");
    if (!selectedCalendarDate) {
        bookingMessage.textContent = "Please choose an appointment date.";
        bookingMessage.classList.add("error");
        calendarGrid?.querySelector(".calendar-day:not(:disabled)")?.focus();
        return;
    }
    if (!selectedTimeInput?.value) {
        bookingMessage.textContent = "Please choose an available appointment time.";
        bookingMessage.classList.add("error");
        timeSlots?.querySelector(".time-slot-btn")?.focus();
        return;
    }

    const dateText = selectedCalendarDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    bookingMessage.textContent = `Your appointment for ${customerServiceInput.value} on ${dateText} at ${selectedTimeInput.value} has been confirmed! This demo does not send bookings; please contact the shop to confirm.`;
    bookingMessage.classList.add("success");
});
renderCalendar();
// Toggle Mobile Menu Open/Close
let isMenuOpen = false;
const toggleMobileMenu = () => {
    if (!mobileMenu) return;
    if (isMenuOpen === false) {
        mobileMenu.classList.add("is-open");
        isMenuOpen = true;
    } else {
        mobileMenu.classList.remove("is-open");
        isMenuOpen = false;
    }
};
// Close Mobile Menu (used when a link is clicked)
const closeMobileMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    isMenuOpen = false;
};
// Reusable function with parameters (practice pattern)
const updateHeadingText = (newText) => {
    if (!heading) return;
    heading.textContent = newText;
};
// ----- Sticky Navbar --------
const handleHEaderOnScroll = () => {
    if (!siteHeader) return;
    if (window.scrollY > 10) {
        siteHeader.classList.add("is-scrolled");
    } else {
        siteHeader.classList.remove("is-scrolled");
    }
}
// ----- Modal Logic -----
// Opens the Modal
const openServiceModal = (service) => {
    if (!serviceModal || !serviceModalTitle || !serviceModalPrice || !serviceModalList) return;

    serviceModalTitle.textContent = service.title;
    serviceModalPrice.textContent = service.price;
    serviceModalList.innerHTML = service.details.map((detail) => `<li>${detail}</li>`).join("");
    serviceModalTrigger = document.activeElement;
    serviceModal.classList.add("is-open");
    serviceModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    serviceModalClose?.focus();
};

const closeServiceModal = () => {
    if (!serviceModal) return;

    serviceModalTrigger?.focus();
    serviceModal.classList.remove("is-open");
    serviceModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    serviceModalTrigger = null;
};

const openCallModal = () => {
    if (!callModal || !callModalPhone || !phoneNumber) return;

    callModalPhone.textContent = phoneNumber.textContent.trim();
    callModalTrigger = document.activeElement;
    callModal.classList.add("is-open");
    callModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    callModalClose?.focus();
};

const closeCallModal = () => {
    if (!callModal) return;

    callModalTrigger?.focus();
    callModal.classList.remove("is-open");
    callModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    callModalTrigger = null;
};

serviceModalClose?.addEventListener("click", closeServiceModal);
serviceModalOverlay?.addEventListener("click", closeServiceModal);
callModalClose?.addEventListener("click", closeCallModal);
callModalOverlay?.addEventListener("click", closeCallModal);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && serviceModal?.classList.contains("is-open")) {
        closeServiceModal();
    }
    if (event.key === "Escape" && callModal?.classList.contains("is-open")) {
        closeCallModal();
    }
});
// ----- Event Listeners -----
// 1) set year on page load
setCurrentYear();
// 2) Hamburger menu toggle
if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        toggleMobileMenu();
    });
}
// 3) Close mobile menu when a mobile link is clicked (event delegations)
if (mobileMenu) {
    mobileMenu.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            closeMobileMenu();
        }
    });
}
// 4) Scroll the horizontal service cards with the mouse wheel
if (featureGrid) {
    let featureScrollFrame = null;
    let featureScrollTarget = 0;

    const animateFeatureScroll = () => {
        const distance = featureScrollTarget - featureGrid.scrollLeft;

        if (Math.abs(distance) < 0.5) {
            featureGrid.scrollLeft = featureScrollTarget;
            featureScrollFrame = null;
            return;
        }

        featureGrid.scrollLeft += distance * 0.2;
        featureScrollFrame = requestAnimationFrame(animateFeatureScroll);
    };

    featureGrid.addEventListener("wheel", (event) => {
        const maxScrollLeft = featureGrid.scrollWidth - featureGrid.clientWidth;
        if (maxScrollLeft <= 0) return;

        event.preventDefault();

        if (featureScrollFrame === null) {
            featureScrollTarget = featureGrid.scrollLeft;
        }

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
        featureScrollTarget = Math.max(
            0,
            Math.min(maxScrollLeft, featureScrollTarget + delta)
        );

        if (featureScrollFrame === null) {
            featureScrollFrame = requestAnimationFrame(animateFeatureScroll);
        }
    }, { passive: false });
}
// 5) CTA Button: "Book Now" (Placeholder behavior)
if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
        updateHeadingText("Booking coming next - Great choice!")
    });
}
// 6) Call Button
callBtn?.addEventListener("click", openCallModal);
// 7) Rounds Corners of the navbar on scroll (sticky nav)
window.addEventListener("scroll", handleHEaderOnScroll);
// 8) Opens the modals for the cards when clicked
if (featureGrid) {
    featureGrid.addEventListener("click", (event) => {
        const clickedButton = event.target.closest(".service-details.btn");
        if (!clickedButton) return;
        const serviceId = parseInt(clickedButton.dataset.serviceId, 10);
        const service = services.find((s) => s.id === serviceId);
        if (!service) return;
        openServiceModal(service);
    });
}
//------- Render Features using map() -------
function renderFeaturesMap() {
    const cardsHTML = services.map((service) => {
        return `
        <article class="feature-card">
            <img src="${service.Image}" alt="${service.title}" class="feature-image" />
            <h3 class="feature-title">${service.title}</h3>
            <p class="feature-text">${service.text}</p>
            ${service.popular ? `<span class="feature-popular">Most Popular</span>` : ''}
            <div class="feature-price">${service.price}</div>
            <button type="button" class="btn btn-secondary service-details" data-service-id="${service.id}">
                Service details
            </button>

        </article>
        `;
    }).join("");
    featureGrid.innerHTML = cardsHTML;
}
const renderNavigation = () => {
    // Desktop Nav
    if (nav) {
        const navHTML = navLinks.map((link) => {
            return `<a href="${link.href}" class="nav-link">${link.label}</a>`;
        }).join("");
        nav.innerHTML = navHTML;
    };
    // Mobile Nav 
    if (mobileMenu) {
        const mobileHTML = navLinks.map((link) => {
            return `<a href="${link.href}" class="mobile-link">${link.label}</a>`;
        }).join("");
        mobileMenu.innerHTML = mobileHTML;
    };
}
// ----- Function calls -----
renderFeaturesMap();
renderNavigation();
