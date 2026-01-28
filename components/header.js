window.COMPONENTS = window.COMPONENTS || {};
window.COMPONENTS['header'] = `
<header class="sticky top-0 z-50 backdrop-filter backdrop-blur-lg bg-opacity-90"
    style="background: rgba(10, 14, 39, 0.95); border-bottom: 1px solid rgba(0, 255, 135, 0.1);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center cursor-pointer relative" onclick="window.location.href='index.html'" style="min-width: 280px;">
                <img src="assets/images/app_icon.png" alt="Logo" class="w-24 h-24 object-contain absolute left-0" style="top: 50%; transform: translateY(-50%);">
                <div class="ml-24">
                    <h1 id="site-title" class="text-xl sm:text-2xl font-bold neon-text leading-tight">Stream11</h1>
                    <p id="tagline" class="text-xs text-gray-400 hidden md:block">Live Football Streaming &amp; Scores</p>
                </div>
            </div>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center space-x-6">
                <a href="index.html" class="text-sm font-medium hover:text-green-400 transition-colors">Home</a>
                <a href="highlights.html" class="text-sm font-medium hover:text-green-400 transition-colors">Highlights</a>
            </nav>

            <!-- Desktop Auth -->
            <div class="hidden md:flex items-center space-x-3">
                <button onclick="openLoginModal()" class="btn-secondary">Login</button>
                <button onclick="openSignupModal()" class="btn-secondary">Sign Up</button>
            </div>

            <!-- Mobile Hamburger -->
            <button id="mobile-menu-btn" onclick="toggleMobileMenu()"
                class="md:hidden p-2 text-gray-300 hover:text-white">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </div>
</header>

<!-- Mobile Menu Drawer -->
<div id="mobile-menu"
    class="hidden fixed top-0 left-0 w-full h-full z-40 bg-gray-900/95 backdrop-blur-xl pt-20 px-6 transition-transform duration-300">
    <button onclick="toggleMobileMenu()" class="absolute top-6 right-6 p-2 text-gray-400 hover:text-white">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
    <nav class="space-y-6 flex flex-col items-center text-center mt-10">
        <a href="index.html" onclick="toggleMobileMenu()"
            class="text-2xl font-medium hover:text-green-400 transition-colors">Home</a>
        <a href="highlights.html" onclick="toggleMobileMenu()"
            class="text-2xl font-medium hover:text-green-400 transition-colors">Highlights</a>

        <div class="pt-8 w-full space-y-4 max-w-xs">
            <button onclick="openLoginModal(); toggleMobileMenu();"
                class="btn-secondary w-full py-3 text-lg">Login</button>
            <button onclick="openSignupModal(); toggleMobileMenu();" class="btn-secondary w-full py-3 text-lg">Sign
                Up</button>
        </div>
    </nav>
</div>
`;
