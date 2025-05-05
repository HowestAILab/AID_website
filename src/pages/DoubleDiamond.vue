<template>
  <div ref="containerRef" class="w-full h-full">
    <v-stage
      :config="{
        width: stageWidth,
        height: stageHeight
      }"
    >
      <v-layer>
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: stageWidth,
            height: stageHeight,
            fill: 'white'
          }"
        />
        <v-image
          :config="{
            image: doubleDiamondImage,
            x: 0,
            y: 0,
            width: stageWidth,
            height: stageHeight
          }"
        />
      </v-layer>
      <v-layer>
        <v-circle
          v-for="(pinConfig, index) in computedPinConfigs"
          :key="index"
          :config="pinConfig.config"
          @click="togglePinSelection(index)"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useImage } from 'vue-konva'

const STORAGE_KEY = 'selectedDiagramPinIndices'

const svgBaseWidth = 1200
const svgBaseHeight = 800
const svgAspectRatio = svgBaseWidth / svgBaseHeight

const [doubleDiamondImage] = useImage(
  new URL('../assets/DoubleDiamondL.svg', import.meta.url).href
)

const containerRef = ref(null)
const stageWidth = ref(0)
const stageHeight = ref(0)
const selectedPinIndices = ref([])

const pins = ref([
  { id: 'pin1', sceneX: 400, sceneY: 200 },
  { id: 'pin2', sceneX: 200, sceneY: 400 },
  { id: 'pin3', sceneX: 370, sceneY: 510 },
  { id: 'pin4', sceneX: 825, sceneY: 450 },
  { id: 'pin5', sceneX: 900, sceneY: 263 },
  { id: 'pin6', sceneX: 1000, sceneY: 400 },
])

function updateSize() {
  if (!containerRef.value) return
  const cw = containerRef.value.offsetWidth
  const ch = containerRef.value.offsetHeight
  const hAtFullW = cw / svgAspectRatio

  if (cw === 0 || ch === 0) {
    stageWidth.value = 0
    stageHeight.value = 0
    return
  }

  if (hAtFullW <= ch) {
    stageWidth.value = cw
    stageHeight.value = hAtFullW
  } else {
    stageHeight.value = ch
    stageWidth.value = ch * svgAspectRatio
  }
}

onMounted(() => {
  const savedSelection = localStorage.getItem(STORAGE_KEY)
  if (savedSelection) {
    try {
      const parsedSelection = JSON.parse(savedSelection)
      if (Array.isArray(parsedSelection)) {
        selectedPinIndices.value = parsedSelection
        console.log('Loaded selection from localStorage:', selectedPinIndices.value)
      } else {
         console.warn('Invalid data found in localStorage for key:', STORAGE_KEY)
         localStorage.removeItem(STORAGE_KEY); // Clear invalid data
      }
    } catch (e) {
      console.error('Failed to parse saved selection:', e)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  requestAnimationFrame(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

const computedPinConfigs = computed(() => {
  if (stageWidth.value <= 0 || stageHeight.value <= 0) {
    return []
  }
  return pins.value.map((pin, index) => {
    const isSelected = selectedPinIndices.value.includes(index)
    return {
      config: {
        x: (pin.sceneX / svgBaseWidth) * stageWidth.value,
        y: (pin.sceneY / svgBaseHeight) * stageHeight.value,
        radius: 8,
        fill: isSelected ? '#84D0FF' : 'white',
        stroke: '#2499E1',
        strokeWidth: isSelected ? 3 : 2,
        shadowBlur: 5,
        shadowColor: 'black',
        shadowOpacity: 0.6,
        name: `pin-${index}`
      }
    }
  })
})

function togglePinSelection(index) {
  const selectedIndexPosition = selectedPinIndices.value.indexOf(index)
  if (selectedIndexPosition === -1) {
    selectedPinIndices.value.push(index)
  } else {
    selectedPinIndices.value.splice(selectedIndexPosition, 1)
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(selectedPinIndices.value)
    )
    console.log('Saved selection to localStorage:', selectedPinIndices.value)
  } catch (e) {
     console.error('Failed to save selection to localStorage:', e);
  }
}

function handleMouseEnter(e) {
  const stage = e.target?.getStage()
  if (stage && stage.container()) {
    stage.container().style.cursor = 'pointer'
  }
}

function handleMouseLeave(e) {
  const stage = e.target?.getStage()
  if (stage && stage.container()) {
    stage.container().style.cursor = 'default'
  }
}
</script>
