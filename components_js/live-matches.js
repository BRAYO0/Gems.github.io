window.COMPONENTS = window.COMPONENTS || {};
window.COMPONENTS['live-matches'] = `
<section id="live-section" class="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-4 pb-8 relative z-10">
    <div class="flex w-full gap-1 p-1 bg-gray-900/50 sm:rounded-full">
        <button onclick="switchTab('all')" class="tab-button flex-1 min-width-0 rounded-full active flex items-center justify-center gap-1 sm:gap-2 px-1 py-2 text-xs sm:text-sm whitespace-nowrap" data-tab="all">
            <img src="all.png" class="w-3 h-3 sm:w-4 sm:h-4 object-contain">
            <span class="truncate">All</span>
        </button>
        <button onclick="switchTab('live')" class="tab-button flex-1 min-width-0 rounded-full flex items-center justify-center gap-1 sm:gap-2 px-1 py-2 text-xs sm:text-sm whitespace-nowrap" data-tab="live">
            <img src="live.png" class="w-3 h-3 sm:w-4 sm:h-4 object-contain">
            <span class="truncate">Live</span>
        </button>
        <button onclick="switchTab('upcoming')" class="tab-button flex-1 min-width-0 rounded-full flex items-center justify-center gap-1 sm:gap-2 px-1 py-2 text-xs sm:text-sm whitespace-nowrap" data-tab="upcoming">
            <img src="upcoming.png" class="w-3 h-3 sm:w-4 sm:h-4 object-contain">
            <span class="truncate">Upcoming</span>
        </button>
        <button onclick="switchTab('finished')" class="tab-button flex-1 min-width-0 rounded-full flex items-center justify-center gap-1 sm:gap-2 px-1 py-2 text-xs sm:text-sm whitespace-nowrap" data-tab="finished">
            <img src="finished.png" class="w-3 h-3 sm:w-4 sm:h-4 object-contain">
            <span class="truncate">Finished</span>
        </button>
    </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
    <div id="matches-container" class="tab-content active">
        <div id="live-scores" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        </div>
    </div>
</section>
`;
