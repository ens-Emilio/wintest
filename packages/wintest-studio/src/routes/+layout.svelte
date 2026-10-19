<script lang="ts">
  import { page } from '$app/stores';
  let { children } = $props();
  const nav = [
    { href: '/', label: 'WinTest Studio' },
    { href: '/inspector', label: 'Inspector' },
    { href: '/runner', label: 'Runner' },
    { href: '/evidence', label: 'Evidence' },
  ];
</script>
<nav style="display:flex;gap:16px;padding:12px 16px;border-bottom:1px solid #ddd;font-family:system-ui">
  {#each nav as n}<a href={n.href} style="text-decoration:none;color:{ $page.url.pathname===n.href ? '#2563eb':'#333'}">{n.label}</a>{/each}
  <span style="margin-left:auto;font-size:12px;color:#888">v1.1.0-wine · Tauri</span>
</nav>
<main style="padding:16px;font-family:system-ui">{@render children()}</main>
