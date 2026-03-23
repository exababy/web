<template>
  <div class="skins-page">
    <!-- Header Navigation -->
    <header class="skins-header">
      <div class="skins-header__nav">
        <div class="skins-header__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="skins-header__tab"
            :class="{ 'skins-header__tab--active': activeSection === tab.id }"
            @click="activeSection = tab.id"
          >
            {{ tab.label }}
          </button>
          <!-- Admin tab - only show for admins -->
          <button
            class="skins-header__tab"
            :class="{ 'skins-header__tab--active': activeSection === 4 }"
            @click="activeSection = 4"
          >
            Admin Panel
          </button>
        </div>

        <div class="skins-header__controls">
          <!-- Server selector -->
          <div v-if="servers.length > 1" class="skins-header__server-select">
            <select v-model="selectedServerId" class="skins-header__select">
              <option
                v-for="server in servers"
                :key="server.id"
                :value="server.id"
              >
                {{ server.name }}
              </option>
            </select>
          </div>

          <!-- Team selectors -->
          <button
            class="skins-header__team-btn"
            :class="{ 'skins-header__team-btn--active': selectedTeam === 1 }"
            @click="selectedTeam = 1"
          >
            <img
              src="/skins-assets/img/ctlogo.png"
              class="skins-header__team-img"
              alt="CT"
            />
          </button>
          <button
            class="skins-header__team-btn"
            :class="{ 'skins-header__team-btn--active': selectedTeam === 0 }"
            @click="selectedTeam = 0"
          >
            <img
              src="/skins-assets/img/tlogo.png"
              class="skins-header__team-img"
              alt="T"
            />
          </button>
        </div>
      </div>
    </header>

    <main class="skins-main">
      <!-- Section 0: Skins -->
      <div v-if="activeSection === 0" class="skins-layout">
        <!-- Weapon sidebar -->
        <div class="skins-sidebar">
          <!-- Category filters -->
          <div class="skins-sidebar__filters">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="skins-sidebar__filter"
              :class="{
                'skins-sidebar__filter--active': activeCategory === cat.id,
              }"
              @click="activeCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Weapons list for active category -->
          <div class="skins-sidebar__weapons">
            <div
              v-for="weapon in weaponsForCategory"
              :key="weapon.id"
              class="skin-card skin-card--weapon"
              :class="{
                'skin-card--selected': selectedWeaponId === weapon.id,
              }"
              @click="selectWeapon(weapon.id)"
            >
              <div class="skin-card__body">
                <img
                  :src="getWeaponImage(weapon)"
                  :alt="weapon.name"
                  loading="lazy"
                  class="skin-card__img"
                />
              </div>
              <div class="skin-card__footer">
                <div class="skin-card__info">
                  <div class="skin-card__subtitle">{{ weapon.name }}</div>
                  <div class="skin-card__title">
                    {{ getWeaponSkinName(weapon) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skins grid -->
        <div class="skins-grid-container">
          <div class="skins-grid__search">
            <input
              v-model="skinSearch"
              type="text"
              placeholder="Find weapon skin..."
              class="skins-grid__search-input"
            />
          </div>
          <div v-if="loadingSkins" class="skins-grid__loading">
            <div class="skins-loader"></div>
          </div>
          <div class="skins-grid">
            <div
              v-for="(skin, index) in filteredSkins"
              :key="index"
              class="skin-card"
              :class="{ 'skin-card--selected': isSelectedSkin(String(index)) }"
              @click="selectSkin(String(index), skin)"
            >
              <div class="skin-card__body">
                <button
                  v-if="isSelectedSkin(String(index))"
                  class="skin-card__settings-btn"
                  @click.stop="openSkinSettings(String(index), skin)"
                >
                  <svg viewBox="0 0 512 512" fill="currentColor">
                    <path
                      d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
                    />
                  </svg>
                </button>
                <img
                  :src="skin.image"
                  :alt="skin.name"
                  loading="lazy"
                  class="skin-card__img"
                />
                <img
                  src="/skins-assets/img/bg.png"
                  loading="lazy"
                  :style="{ background: skin.color }"
                  alt=""
                  class="skin-card__bg"
                />
              </div>
              <div class="skin-card__footer">
                <div class="skin-card__info">
                  <div class="skin-card__subtitle">{{ skin.weapon_name }}</div>
                  <div class="skin-card__title">{{ skin.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 1: Agents -->
      <div v-if="activeSection === 1" class="skins-grid-container skins-grid-container--full">
        <div class="skins-grid__search">
          <input
            v-model="agentSearch"
            type="text"
            placeholder="Find agent..."
            class="skins-grid__search-input"
          />
        </div>
        <div class="skins-grid">
          <div
            v-for="(agent, index) in filteredAgents"
            :key="index"
            class="skin-card"
            :class="{
              'skin-card--selected': userItems?.agent == index,
            }"
            @click="setItem('agent', String(index))"
          >
            <div class="skin-card__body">
              <img :src="agent.image" :alt="agent.name" loading="lazy" class="skin-card__img" />
              <img
                src="/skins-assets/img/bg.png"
                loading="lazy"
                :style="{ background: agent.color }"
                alt=""
                class="skin-card__bg"
              />
            </div>
            <div class="skin-card__footer">
              <div class="skin-card__info">
                <div class="skin-card__subtitle">{{ agent.name }}</div>
                <div class="skin-card__title">{{ agent.weapon_name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Music Kits -->
      <div v-if="activeSection === 2" class="skins-grid-container skins-grid-container--full">
        <div class="skins-grid__search">
          <input
            v-model="musicSearch"
            type="text"
            placeholder="Find music kit..."
            class="skins-grid__search-input"
          />
        </div>
        <div class="skins-grid">
          <div
            v-for="(kit, index) in filteredMusic"
            :key="index"
            class="skin-card"
            :class="{
              'skin-card--selected': userItems?.music == index,
            }"
            @click="setItem('music', String(index))"
          >
            <div class="skin-card__body">
              <img :src="kit.image" :alt="kit.name" loading="lazy" class="skin-card__img" />
              <img
                src="/skins-assets/img/bg.png"
                loading="lazy"
                :style="{ background: kit.color }"
                alt=""
                class="skin-card__bg"
              />
            </div>
            <div class="skin-card__footer">
              <div class="skin-card__info">
                <div class="skin-card__subtitle">{{ kit.weapon_name }}</div>
                <div class="skin-card__title">{{ kit.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Coins / Collectibles -->
      <div v-if="activeSection === 3" class="skins-grid-container skins-grid-container--full">
        <div class="skins-grid__search">
          <input
            v-model="coinSearch"
            type="text"
            placeholder="Find coin..."
            class="skins-grid__search-input"
          />
        </div>
        <div class="skins-grid">
          <div
            v-for="(coin, index) in filteredCoins"
            :key="index"
            class="skin-card"
            :class="{
              'skin-card--selected': userItems?.coin == index,
            }"
            @click="setItem('coin', String(index))"
          >
            <div class="skin-card__body">
              <img :src="coin.image" :alt="coin.name" loading="lazy" class="skin-card__img" />
              <img
                src="/skins-assets/img/bg.png"
                loading="lazy"
                :style="{ background: coin.color }"
                alt=""
                class="skin-card__bg"
              />
            </div>
            <div class="skin-card__footer">
              <div class="skin-card__info">
                <div class="skin-card__subtitle">{{ coin.name }}</div>
                <div class="skin-card__title">{{ coin.weapon_name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 4: Admin Panel -->
      <div v-if="activeSection === 4">
        <SkinsAdminPanel />
      </div>
    </main>

    <!-- Skin settings modal -->
    <SkinModal
      v-if="showModal"
      :weapon-index="modalWeaponIndex"
      :skin-id="modalSkinId"
      :skin-image="modalSkinImage"
      :existing-data="userSkins[modalWeaponIndex]"
      :stickers="stickersData"
      :keychains="keychainsData"
      @close="showModal = false"
      @save="saveSkinSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import SkinModal from "~/components/skins/SkinModal.vue";
import SkinsAdminPanel from "~/components/skins/SkinsAdminPanel.vue";

// State
const activeSection = ref(0);
const selectedTeam = ref(0);
const selectedServerId = ref(1);
const activeCategory = ref(1);
const selectedWeaponId = ref(515); // Default: butterfly knife
const skinSearch = ref("");
const agentSearch = ref("");
const musicSearch = ref("");
const coinSearch = ref("");
const loadingSkins = ref(false);

// Data
const servers = ref<any[]>([]);
const weaponsData = ref<Record<string, any[]>>({});
const skinsData = ref<Record<string, Record<string, any>>>({});
const stickersData = ref<Record<string, any>>({});
const keychainsData = ref<Record<string, any>>({});
const agentsData = ref<Record<string, any>>({});
const musicData = ref<Record<string, any>>({});
const coinsData = ref<Record<string, any>>({});

// User data
const userItems = ref<any>(null);
const userSkins = ref<Record<string, any>>({});
const playerId = ref<number | null>(null);

// Modal
const showModal = ref(false);
const modalWeaponIndex = ref(0);
const modalSkinId = ref("");
const modalSkinImage = ref("");

// TODO: Get from 5stack auth
const steamid = ref("76561198000000000");

const tabs = [
  { id: 0, label: "Skins" },
  { id: 1, label: "Agents" },
  { id: 3, label: "Coins" },
  { id: 2, label: "Music Kits" },
];

const categories = [
  { id: 1, label: "Knives" },
  { id: 2, label: "Gloves" },
  { id: 3, label: "SMG" },
  { id: 4, label: "Rifles" },
  { id: 5, label: "Machineguns" },
  { id: 6, label: "Shotguns" },
  { id: 7, label: "Pistols" },
];

// Computed
const weaponsForCategory = computed(() => {
  return weaponsData.value[activeCategory.value] || [];
});

const currentSkins = computed(() => {
  return skinsData.value[selectedWeaponId.value] || {};
});

const filteredSkins = computed(() => {
  const skins = currentSkins.value;
  if (!skinSearch.value) return skins;
  const search = skinSearch.value.toLowerCase();
  const result: Record<string, any> = {};
  for (const [key, skin] of Object.entries(skins)) {
    if (
      skin.name?.toLowerCase().includes(search) ||
      skin.weapon_name?.toLowerCase().includes(search)
    ) {
      result[key] = skin;
    }
  }
  return result;
});

const filteredAgents = computed(() => {
  const agents = agentsData.value;
  const result: Record<string, any> = {};
  for (const [key, agent] of Object.entries(agents)) {
    if (agent.team !== selectedTeam.value) continue;
    if (
      agentSearch.value &&
      !agent.weapon_name?.toLowerCase().includes(agentSearch.value.toLowerCase())
    ) {
      continue;
    }
    result[key] = agent;
  }
  return result;
});

const filteredMusic = computed(() => {
  const music = musicData.value;
  if (!musicSearch.value) return music;
  const search = musicSearch.value.toLowerCase();
  const result: Record<string, any> = {};
  for (const [key, kit] of Object.entries(music)) {
    if (kit.name?.toLowerCase().includes(search)) {
      result[key] = kit;
    }
  }
  return result;
});

const filteredCoins = computed(() => {
  const coins = coinsData.value;
  if (!coinSearch.value) return coins;
  const search = coinSearch.value.toLowerCase();
  const result: Record<string, any> = {};
  for (const [key, coin] of Object.entries(coins)) {
    if (coin.weapon_name?.toLowerCase().includes(search)) {
      result[key] = coin;
    }
  }
  return result;
});

// Methods
function getWeaponImage(weapon: any) {
  const sel = userSkins.value[weapon.id];
  if (sel?.skin?.[0] && sel.skin[0] !== "0") {
    const skinPaint = skinsData.value[weapon.id]?.[sel.skin[0]];
    if (skinPaint) return skinPaint.image;
  }
  return weapon.image;
}

function getWeaponSkinName(weapon: any) {
  const sel = userSkins.value[weapon.id];
  if (sel?.skin?.[0] && sel.skin[0] !== "0") {
    const skinPaint = skinsData.value[weapon.id]?.[sel.skin[0]];
    if (skinPaint) return skinPaint.name;
  }
  return "Not selected";
}

function isSelectedSkin(paintIndex: string) {
  const sel = userSkins.value[selectedWeaponId.value];
  return sel?.skin?.[0] === paintIndex;
}

function selectWeapon(id: number) {
  selectedWeaponId.value = id;
  loadSkinsForWeapon(id);
}

async function selectSkin(paintIndex: string, skin: any) {
  const isSelected = isSelectedSkin(paintIndex);
  const newIndex = isSelected ? "0" : paintIndex;

  try {
    await $fetch("/api/skins/skins", {
      method: "POST",
      body: {
        steamid: steamid.value,
        action: "set_skin",
        skin_id: newIndex,
        weapon_index: selectedWeaponId.value,
        team: selectedTeam.value,
        server_id: selectedServerId.value,
      },
    });

    // Update local state
    if (!userSkins.value[selectedWeaponId.value]) {
      userSkins.value[selectedWeaponId.value] = {
        skin: [newIndex, "0", "0"],
        stickers: ["0", "0", "0", "0"],
      };
    } else {
      userSkins.value[selectedWeaponId.value].skin[0] = newIndex;
    }
  } catch (e) {
    console.error("Error setting skin:", e);
  }
}

function openSkinSettings(paintIndex: string, skin: any) {
  modalWeaponIndex.value = selectedWeaponId.value;
  modalSkinId.value = paintIndex;
  modalSkinImage.value = skin.image;
  showModal.value = true;
}

async function saveSkinSettings(data: any) {
  try {
    await $fetch("/api/skins/skins", {
      method: "POST",
      body: {
        steamid: steamid.value,
        action: "save_skin",
        ...data,
        team: selectedTeam.value,
        server_id: selectedServerId.value,
      },
    });
    showModal.value = false;
    // Reload user data
    await loadUserData();
  } catch (e) {
    console.error("Error saving skin settings:", e);
  }
}

async function setItem(type: string, itemId: string) {
  const isSelected =
    userItems.value?.[type] == itemId;
  const newId = isSelected ? "0" : itemId;

  try {
    await $fetch("/api/skins/items", {
      method: "POST",
      body: {
        steamid: steamid.value,
        action: "set_item",
        item_type: type,
        item_id: newId,
        team: selectedTeam.value,
        server_id: selectedServerId.value,
      },
    });

    if (!userItems.value) userItems.value = {};
    userItems.value[type] = newId;
  } catch (e) {
    console.error("Error setting item:", e);
  }
}

// Data loading
async function loadStaticData() {
  const lang = "en"; // TODO: use i18n locale

  try {
    const [weapons, skins, stickers, keychains, agents, music, coins] =
      await Promise.all([
        $fetch<Record<string, any[]>>(`/skins-data/weapons.json`),
        $fetch<Record<string, Record<string, any>>>(`/skins-data/skins-${lang}.json`),
        $fetch<Record<string, any>>(`/skins-data/stickers-${lang}.json`),
        $fetch<Record<string, any>>(`/skins-data/keychains-${lang}.json`),
        $fetch<Record<string, any>>(`/skins-data/agents-${lang}.json`),
        $fetch<Record<string, any>>(`/skins-data/musickit-${lang}.json`),
        $fetch<Record<string, any>>(`/skins-data/collectibles-${lang}.json`),
      ]);

    weaponsData.value = weapons;
    skinsData.value = skins;
    stickersData.value = stickers;
    keychainsData.value = keychains;
    agentsData.value = agents;
    musicData.value = music;
    coinsData.value = coins;
  } catch (e) {
    console.error("Error loading static data:", e);
  }
}

async function loadSkinsForWeapon(weaponId: number) {
  // Skins are already loaded from static JSON
  loadingSkins.value = false;
}

async function loadUserData() {
  try {
    const data = await $fetch<any>("/api/skins/items", {
      params: {
        steamid: steamid.value,
        team: selectedTeam.value,
        server_id: selectedServerId.value,
      },
    });
    userItems.value = data.items;
    userSkins.value = data.skins || {};
    playerId.value = data.playerId || null;
  } catch (e) {
    console.error("Error loading user data:", e);
  }
}

async function loadServers() {
  try {
    const data = await $fetch<any[]>("/api/skins/servers");
    servers.value = data;
    if (data.length > 0 && !data.find((s: any) => s.id === selectedServerId.value)) {
      selectedServerId.value = data[0].id;
    }
  } catch (e) {
    console.error("Error loading servers:", e);
  }
}

// Watch for team/server changes
watch([selectedTeam, selectedServerId], () => {
  loadUserData();
});

onMounted(async () => {
  await loadStaticData();
  await loadServers();
  await loadUserData();
});
</script>

<style>
@import "~/assets/css/skins.css";
</style>
