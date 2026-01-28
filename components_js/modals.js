window.COMPONENTS = window.COMPONENTS || {};
window.COMPONENTS['modals'] = `
<div id="login-modal" class="modal">
    <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold neon-text">Login</h3>
            <button onclick="closeModal('login-modal')" class="text-gray-400 hover:text-white">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <form onsubmit="handleLogin(event)">
            <div class="space-y-4">
                <div>
                    <label for="login-email" class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" id="login-email" required placeholder="your@email.com">
                </div>
                <div>
                    <label for="login-password" class="block text-sm font-medium mb-2">Password</label>
                    <input type="password" id="login-password" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn-primary w-full">Login</button>
            </div>
        </form>
    </div>
</div>

<div id="signup-modal" class="modal">
    <div class="modal-content">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold neon-text">Sign Up</h3>
            <button onclick="closeModal('signup-modal')" class="text-gray-400 hover:text-white">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <form onsubmit="handleSignup(event)">
            <div class="space-y-4">
                <div>
                    <label for="signup-name" class="block text-sm font-medium mb-2">Full Name</label>
                    <input type="text" id="signup-name" required placeholder="John Doe">
                </div>
                <div>
                    <label for="signup-email" class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" id="signup-email" required placeholder="your@email.com">
                </div>
                <div>
                    <label for="signup-password" class="block text-sm font-medium mb-2">Password</label>
                    <input type="password" id="signup-password" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn-primary w-full">Create Account</button>
            </div>
        </form>
    </div>
</div>

<div id="success-toast" style="display: none; position: fixed; top: 20px; right: 20px; z-index: 2000;"
    class="glow-card px-6 py-4 rounded-lg">
    <p id="success-message" class="text-green-400 font-medium"></p>
</div>
`;
