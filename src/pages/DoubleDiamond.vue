<template>
  <div ref="containerRef" class="w-full h-full relative">
    <v-stage
      ref="stageRef"
      :config="{
        width: stageWidth,
        height: stageHeight,
      }"
      @mouseleave="handleStageMouseLeave"
      @contentMouseleave="handleStageMouseLeave"
    >
      <v-layer>
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: stageWidth,
            height: stageHeight,
            fill: 'white',
          }"
        />
        <v-image
          :config="{
            image: doubleDiamondImage,
            x: 0,
            y: 0,
            width: stageWidth,
            height: stageHeight,
          }"
        />
      </v-layer>
      <v-layer>
        <v-circle
          v-for="(pinConfig, index) in computedPinConfigs"
          :key="pinConfig.id"
          :config="pinConfig.config"
          @click="togglePinSelection(index)"
          @mouseenter="(event) => handlePinMouseEnter(event, index)"
          @mouseleave="handlePinMouseLeave(event)"
          @mousemove="handlePinMouseMove"
        />
      </v-layer>
    </v-stage>

    <Teleport to="body">
      <div
        ref="hoverCardRef"
        v-if="isHoverCardVisible && hoveredPinContent"
        :style="hoverCardStyle"
        class="absolute bg-white p-3 border rounded shadow-lg z-50 pointer-events-none"
      >
        {{ hoveredPinContent }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useImage } from "vue-konva";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const STORAGE_KEY = "selectedDiagramPinIndices";

const svgBaseWidth = 1200;
const svgBaseHeight = 800;
const svgAspectRatio = svgBaseWidth / svgBaseHeight;

const [doubleDiamondImage] = useImage(
  new URL("../assets/DoubleDiamondL.svg", import.meta.url).href
);

const containerRef = ref(null);
const stageRef = ref(null);
const stageWidth = ref(0);
const stageHeight = ref(0);
const selectedPinIndices = ref([]);

const hoveredPinIndex = ref(null);
const isHoverCardVisible = ref(false);
const hoverCardPosition = ref({ x: 0, y: 0 });
let hoverTimeout = null;
const hoverCardRef = ref(null);
const measuredCardSize = ref({ width: 0, height: 0 });

// Possibly add icons to each pin too which can also be used in the stepper
const pins = ref([
  { id: "pin1", sceneX: 400, sceneY: 200, content: "Placheholder" },
  { id: "pin2", sceneX: 200, sceneY: 400, content: "Personas" },
  { id: "pin3", sceneX: 370, sceneY: 510, content: "Research" },
  {
    id: "pin4",
    sceneX: 825,
    sceneY: 450,
    content: "Placeholder placeholdering",
  },
  {
    id: "pin5",
    sceneX: 900,
    sceneY: 263,
    content: "Placeholder placeholdering a place",
  },
  {
    id: "pin6",
    sceneX: 1000,
    sceneY: 400,
    content: "Placeholder placeholdering a place for placeholders",
  },
]);

const hoveredPinContent = computed(() => {
  if (hoveredPinIndex.value !== null && pins.value[hoveredPinIndex.value]) {
    return pins.value[hoveredPinIndex.value].content;
  }
  return null;
});

watch(
  [isHoverCardVisible, hoveredPinContent],
  async ([isVisible, content]) => {
    if (isVisible && content) {
      await nextTick();
      if (hoverCardRef.value) {
        measuredCardSize.value = {
          width: hoverCardRef.value.offsetWidth,
          height: hoverCardRef.value.offsetHeight,
        };
      } else {
        measuredCardSize.value = { width: 0, height: 0 };
      }
    } else {
      measuredCardSize.value = { width: 0, height: 0 };
    }
  },
  { flush: "post" }
);

const hoverCardStyle = computed(() => {
  if (!isHoverCardVisible.value) {
    return { visibility: "hidden" };
  }

  const baseLeft = hoverCardPosition.value.x;
  const baseTop = hoverCardPosition.value.y;
  const offsetX = 15;
  const offsetY = 15;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = measuredCardSize.value.width || 200;
  const cardHeight = measuredCardSize.value.height || 50;

  let finalLeft = baseLeft + offsetX;
  let finalTop = baseTop + offsetY;

  if (finalLeft + cardWidth > viewportWidth) {
    finalLeft = baseLeft - cardWidth - offsetX;
  }

  if (finalLeft < 0) {
    finalLeft = 0;
  }

  if (finalTop + cardHeight > viewportHeight) {
    finalTop = baseTop - cardHeight - offsetY;
  }

  if (finalTop < 0) {
    finalTop = 0;
  }

  return {
    position: "fixed",
    left: `${finalLeft}px`,
    top: `${finalTop}px`,
    pointerEvents: "none",
    zIndex: 1000,
    visibility: "visible",
    maxWidth: "300px",
    wordWrap: "break-word",
  };
});

watch(hoveredPinIndex, (newIndex) => {
  const stage = stageRef.value?.getNode();
  if (stage && stage.container()) {
    stage.container().style.cursor = newIndex !== null ? "pointer" : "default";
  }
});

function updateSize() {
  if (!containerRef.value) return;
  const cw = containerRef.value.offsetWidth;
  const ch = containerRef.value.offsetHeight;
  const hAtFullW = cw / svgAspectRatio;

  if (cw === 0 || ch === 0) {
    stageWidth.value = 0;
    stageHeight.value = 0;
    return;
  }

  if (hAtFullW <= ch) {
    stageWidth.value = cw;
    stageHeight.value = hAtFullW;
  } else {
    stageHeight.value = ch;
    stageWidth.value = ch * svgAspectRatio;
  }
}

onMounted(() => {
  const savedSelection = localStorage.getItem(STORAGE_KEY);
  if (savedSelection) {
    try {
      const parsedSelection = JSON.parse(savedSelection);
      if (Array.isArray(parsedSelection)) {
        selectedPinIndices.value = parsedSelection;
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  requestAnimationFrame(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", updateSize);
  clearTimeout(hoverTimeout);
  const stage = stageRef.value?.getNode();
  if (stage && stage.container()) {
    stage.container().style.cursor = "default";
  }
});

const computedPinConfigs = computed(() => {
  if (stageWidth.value <= 0 || stageHeight.value <= 0) {
    return [];
  }
  return pins.value.map((pin, index) => {
    const isSelected = selectedPinIndices.value.includes(index);
    const isHovered = hoveredPinIndex.value === index;

    return {
      id: pin.id,
      config: {
        x: (pin.sceneX / svgBaseWidth) * stageWidth.value,
        y: (pin.sceneY / svgBaseHeight) * stageHeight.value,
        radius: 8,
        fill: isSelected ? "#84D0FF" : "white",
        stroke: "#2499E1",
        strokeWidth: isSelected || isHovered ? 3 : 2,
        shadowBlur: 5,
        shadowColor: "black",
        shadowOpacity: 0.6,
        name: `pin-${index}`,
        scaleX: isHovered ? 1.1 : 1,
        scaleY: isHovered ? 1.1 : 1,
      },
    };
  });
});

function togglePinSelection(index) {
  const selectedIndexPosition = selectedPinIndices.value.indexOf(index);
  if (selectedIndexPosition === -1) {
    selectedPinIndices.value.push(index);
  } else {
    selectedPinIndices.value.splice(selectedIndexPosition, 1);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPinIndices.value));
  } catch (e) {
    console.error("Failed to save selection to localStorage:", e);
  }
}

function updateHoverCardPosition(konvaEvent) {
  const domEvent = konvaEvent.evt;
  if (domEvent) {
    hoverCardPosition.value = {
      x: domEvent.clientX,
      y: domEvent.clientY,
    };
  }
}

function handlePinMouseEnter(event, index) {
  clearTimeout(hoverTimeout);
  hoveredPinIndex.value = index;
  isHoverCardVisible.value = true;
  updateHoverCardPosition(event);
}

function handlePinMouseLeave(event) {
  isHoverCardVisible.value = false;
  hoveredPinIndex.value = null;
  clearTimeout(hoverTimeout);
}

function handlePinMouseMove(event) {
  const targetName = event.target.name();
  const currentPinIndex = parseInt(targetName.split("-")[1], 10);

  if (
    !isNaN(currentPinIndex) &&
    hoveredPinIndex.value === currentPinIndex &&
    isHoverCardVisible.value
  ) {
    updateHoverCardPosition(event);
    clearTimeout(hoverTimeout);
  } else if (hoveredPinIndex.value !== currentPinIndex) {
    updateHoverCardPosition(event);
  }
}

function handleStageMouseLeave() {
  clearTimeout(hoverTimeout);
  isHoverCardVisible.value = false;
  hoveredPinIndex.value = null;
}
</script>
