<template>
  <section class="relative py-24 bg-bg-primary overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <!-- Left: text -->
        <div class="reveal">
          <span class="text-xs text-text-secondary uppercase tracking-[0.2em]">Venue</span>
          <h2 class="text-4xl md:text-5xl font-black mt-4 mb-6">
            STATION F<br /><span class="heading-serif font-medium text-gray-500">Paris</span>
          </h2>
          <p class="text-text-secondary leading-relaxed mb-6">
            The world's largest startup campus, located in the heart of Paris. Home to 1,000+ startups and the backdrop for the most exciting tech events in Europe.
          </p>
          <div class="flex gap-8">
            <div>
              <div class="text-2xl font-black text-gray-900">1000+</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">Startups</div>
            </div>
            <div class="w-px bg-white/10"></div>
            <div>
              <div class="text-2xl font-black text-gray-900">34 000</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">m² Campus</div>
            </div>
            <div class="w-px bg-white/10"></div>
            <div>
              <div class="text-2xl font-black text-gray-900">13th</div>
              <div class="text-xs text-text-secondary uppercase tracking-widest mt-1">Arrondissement</div>
            </div>
          </div>
        </div>

        <!-- Right: photo -->
        <div class="reveal reveal-delay-2">
          <img
            src="/photos/gosim-stationf.jpg"
            alt="STATION F Paris"
            class="w-full h-80 object-cover"
          />
        </div>
      </div>

      <!-- GOSIM past events -->
      <div class="mt-20">
        <div class="text-center mb-10 reveal">
          <span class="text-xs text-text-secondary uppercase tracking-[0.2em]">Past Events</span>
          <h3 class="text-2xl font-black mt-2">Where the Community Gathers</h3>
        </div>
        <div class="grid grid-cols-3 gap-4 reveal">
          <img src="/photos/gosim-event-1.jpg" alt="GOSIM Event" class="w-full h-48 object-cover" />
          <img src="/photos/gosim-event-2.jpg" alt="GOSIM Event" class="w-full h-48 object-cover" />
          <img src="/photos/gosim-event-3.jpg" alt="GOSIM Event" class="w-full h-48 object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>
