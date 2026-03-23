<template>
  <div class="skins-modal-overlay" @click.self="$emit('close')">
    <div class="skins-modal">
      <div class="skins-modal__sidebar">
        <!-- Skin preview -->
        <div class="skins-modal__preview">
          <img v-if="skinImage" :src="skinImage" loading="lazy" alt="skin" />
        </div>

        <!-- Sticker/Keychain slots (for regular weapons, not knives/gloves) -->
        <div v-if="weaponIndex < 500" class="skins-modal__sticker-slots">
          <button
            v-for="slot in 5"
            :key="slot"
            class="skins-modal__sticker-slot"
            :class="{
              'skins-modal__sticker-slot--active': activeSlot === slot - 1,
            }"
            @click="activeSlot = slot - 1"
          >
            <img
              v-if="getSlotImage(slot - 1)"
              :src="getSlotImage(slot - 1)!"
              loading="lazy"
              alt=""
              class="skins-modal__sticker-img"
              :style="slot === 5 ? 'max-width: 50px; max-height: 50px;' : ''"
            />
            <svg v-else viewBox="0 0 448 512" fill="currentColor">
              <path
                d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H288V368c0-26.5 21.5-48 48-48H448V96c0-35.3-28.7-64-64-64H64zM448 352H402.7 336c-8.8 0-16 7.2-16 16v66.7V480l32-32 64-64 32-32z"
              />
            </svg>
          </button>
        </div>

        <!-- Settings -->
        <div class="skins-modal__settings">
          <!-- Nametag -->
          <div v-if="weaponIndex < 4000" class="skins-modal__setting">
            <label>{{ t("nametag") }}</label>
            <input
              v-model="nametag"
              type="text"
              placeholder="..."
              class="skins-modal__input"
            />
          </div>

          <!-- StatTrak -->
          <div v-if="weaponIndex < 4000" class="skins-modal__setting">
            <label>{{ t("stattrack") }}</label>
            <button
              class="skins-modal__toggle"
              :class="{ 'skins-modal__toggle--on': stattrack }"
              @click="stattrack = !stattrack"
            >
              {{ stattrack ? "ON" : "OFF" }}
            </button>
          </div>

          <!-- Quality -->
          <div class="skins-modal__setting">
            <label>{{ t("quality") }}</label>
            <div class="skins-modal__quality-btns">
              <button
                v-for="q in qualities"
                :key="q.value"
                :class="{ active: selectedQuality === q.value }"
                @click="
                  selectedQuality = q.value;
                  floatVal = q.value;
                "
              >
                {{ q.label }}
              </button>
            </div>
          </div>

          <!-- Float -->
          <div class="skins-modal__setting">
            <label>Float:</label>
            <input
              v-model.number="floatVal"
              type="number"
              min="0"
              max="1"
              step="0.01"
              placeholder="0-1"
              class="skins-modal__input"
            />
          </div>

          <!-- Pattern -->
          <div class="skins-modal__setting">
            <label>Pattern:</label>
            <input
              v-model.number="pattern"
              type="number"
              min="1"
              max="999"
              placeholder="1-999"
              class="skins-modal__input"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="skins-modal__actions">
          <button class="skins-modal__btn skins-modal__btn--cancel" @click="$emit('close')">
            {{ t("close") }}
          </button>
          <button class="skins-modal__btn skins-modal__btn--save" @click="save">
            {{ t("save") }}
          </button>
        </div>
      </div>

      <!-- Sticker/Keychain picker -->
      <div v-if="weaponIndex < 500" class="skins-modal__picker">
        <div class="skins-modal__picker-header">
          <input
            v-model="stickerSearch"
            type="text"
            :placeholder="t('findSticker')"
            class="skins-modal__search"
          />
        </div>
        <div class="skins-modal__picker-grid">
          <div
            v-for="(item, key) in filteredPickerItems"
            :key="key"
            class="skin-card skin-card--small"
            @click="selectStickerOrKeychain(String(key))"
          >
            <div class="skin-card__body">
              <img
                :src="item.image"
                :alt="item.name"
                loading="lazy"
                class="skin-card__img"
              />
            </div>
            <div class="skin-card__footer">
              <div class="skin-card__info">
                <div class="skin-card__subtitle">{{ item.weapon_name }}</div>
                <div class="skin-card__title">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const props = defineProps<{
  weaponIndex: number;
  skinId: string;
  skinImage: string;
  existingData?: any;
  stickers?: Record<string, any>;
  keychains?: Record<string, any>;
}>();

const emit = defineEmits(["close", "save"]);

const activeSlot = ref(4); // 0=keychain, 1-4=stickers
const stickerSearch = ref("");
const nametag = ref(props.existingData?.tag || "");
const stattrack = ref(!!props.existingData?.stattrack);
const floatVal = ref(
  parseFloat(props.existingData?.skin?.[2] || "0")
);
const pattern = ref(
  parseInt(props.existingData?.skin?.[1] || "0")
);
const selectedQuality = ref(0);

const selectedStickers = ref<string[]>(
  props.existingData?.stickers
    ? [...props.existingData.stickers]
    : ["0", "0", "0", "0"]
);
const selectedKeychain = ref<string>(
  props.existingData?.keychain
    ? String(props.existingData.keychain).split(";")[0]
    : "0"
);

const qualities = [
  { label: "FN", value: 0 },
  { label: "MW", value: 0.07 },
  { label: "FT", value: 0.15 },
  { label: "WW", value: 0.38 },
  { label: "BS", value: 0.45 },
];

function t(key: string) {
  const tr: Record<string, string> = {
    nametag: "Name Tag:",
    stattrack: "StatTrak:",
    quality: "Skin Quality:",
    close: "Close",
    save: "Save",
    findSticker: "Find sticker...",
  };
  return tr[key] || key;
}

function getSlotImage(slot: number): string | null {
  if (slot === 4) {
    // Keychain slot
    if (selectedKeychain.value && selectedKeychain.value !== "0") {
      return props.keychains?.[selectedKeychain.value]?.image || null;
    }
    return null;
  }
  // Sticker slots (reversed: slot 0 = sticker4, etc.)
  const stickerIdx = 3 - slot;
  const stickerId = selectedStickers.value[stickerIdx];
  if (stickerId && stickerId !== "0") {
    return props.stickers?.[stickerId]?.image || null;
  }
  return null;
}

const filteredPickerItems = computed(() => {
  const source =
    activeSlot.value === 4 ? props.keychains : props.stickers;
  if (!source) return {};
  if (!stickerSearch.value) {
    // Limit to ~99 items
    const entries = Object.entries(source).slice(0, 99);
    return Object.fromEntries(entries);
  }
  const search = stickerSearch.value.toLowerCase();
  const entries = Object.entries(source)
    .filter(
      ([, item]) =>
        item.name?.toLowerCase().includes(search) ||
        item.weapon_name?.toLowerCase().includes(search)
    )
    .slice(0, 99);
  return Object.fromEntries(entries);
});

function selectStickerOrKeychain(id: string) {
  if (activeSlot.value === 4) {
    selectedKeychain.value = id;
  } else {
    const stickerIdx = 3 - activeSlot.value;
    selectedStickers.value[stickerIdx] = id;
  }
}

function save() {
  emit("save", {
    skin_id: props.skinId,
    weapon_index: props.weaponIndex,
    tag: nametag.value,
    stattrack: stattrack.value ? 1 : 0,
    float: floatVal.value,
    pattern: pattern.value,
    sticker1: selectedStickers.value[0] || "0",
    sticker2: selectedStickers.value[1] || "0",
    sticker3: selectedStickers.value[2] || "0",
    sticker4: selectedStickers.value[3] || "0",
    keychain: selectedKeychain.value || "0",
  });
}
</script>
