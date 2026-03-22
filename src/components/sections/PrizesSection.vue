<template>
  <section id="awards" class="relative py-32 bg-bg-primary particles overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16 reveal">
        <h2 class="text-4xl md:text-5xl font-bold">
          <span class="heading-serif accent-text">Awards</span>
        </h2>
      </div>

      <!-- Main prize -->
      <div class="max-w-3xl mx-auto mb-12 reveal">
        <div class="relative glass-card p-10 text-center overflow-hidden group hover:scale-[1.02] transition-transform">
          <div class="absolute inset-0 bg-gradient-to-br from-accent-yellow/10 via-transparent to-accent-red/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative">
            <div class="text-sm text-accent-yellow uppercase tracking-wider mb-4 font-semibold">Main Award</div>
            <h3 class="text-2xl font-bold text-white mb-2">5 Spotlight Projects</h3>
            <p class="text-text-secondary mb-6">Selected projects receive sponsored travel to GOSIM Shenzhen, October 2026 — including round-trip flights and accommodation.</p>
          </div>
        </div>
      </div>

      <!-- Sponsor prizes -->
      <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto reveal reveal-delay-2">
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-white text-lg mb-1">Zhipu AI Special Award</h3>
          <p class="text-text-secondary text-sm">Sponsored by Zhipu AI</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-accent-red rounded-full group-hover:w-20 transition-all"></div>
        </div>
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-white text-lg mb-1">MiniMax Special Award</h3>
          <p class="text-text-secondary text-sm">Sponsored by MiniMax</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-accent-blue rounded-full group-hover:w-20 transition-all"></div>
        </div>
        <div class="glass-card p-8 text-center hover:scale-105 transition-all group">
          <h3 class="font-bold text-white text-lg mb-1">Moonshot AI Special Award</h3>
          <p class="text-text-secondary text-sm">Sponsored by Moonshot AI</p>
          <div class="h-1 w-12 mx-auto mt-4 bg-accent-cyan rounded-full group-hover:w-20 transition-all"></div>
        </div>
      </div>

      <p class="text-center text-text-secondary text-sm mt-12 reveal">
        All participants receive <span class="text-accent-yellow font-semibold">API credits</span> from sponsors.
      </p>
    </div>
  </section>
</template>
