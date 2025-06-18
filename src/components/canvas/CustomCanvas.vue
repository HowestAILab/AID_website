<template>
  <div class="h-full flex flex-col bg-gray-100 relative">
    <!-- Toolbar -->
    <div class="bg-white border-b p-3 flex items-center gap-4 z-10">
      <!-- Tool Selection -->
      <div class="flex items-center gap-2">
        <button
          v-for="tool in tools"
          :key="tool.id"
          @click="setActiveTool(tool.id)"
          :class="[
            'p-2 rounded hover:bg-gray-100 transition-colors',
            activeTool === tool.id
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600',
          ]"
          :title="tool.name"
        >
          <component :is="tool.icon" class="w-5 h-5" />
        </button>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          v-for="tool in actionTools"
          :key="tool.id"
          @click="tool.action"
          :disabled="tool.disabled.value"
          class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
          :title="tool.name"
        >
          <component :is="tool.icon" class="w-5 h-5" />
        </button>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- Color Picker -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Color:</label>
        <input
          v-model="currentColor"
          type="color"
          class="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        />
      </div>

      <!-- Brush Size (for drawing tool) -->
      <div v-if="activeTool === 'draw'" class="flex items-center gap-2">
        <label class="text-sm text-gray-600">Size:</label>
        <input v-model="brushSize" type="range" min="1" max="20" class="w-20" />
        <span class="text-sm text-gray-600">{{ brushSize }}px</span>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- Actions -->
      <button
        @click="clearCanvas"
        class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Clear
      </button>

      <button
        @click="saveCanvas"
        class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Save
      </button>

      <!-- Fullscreen Toggle -->
      <div class="ml-auto">
        <button
          @click="toggleFullscreen"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
        >
          <Maximize2 v-if="!isFullscreen" class="w-5 h-5" />
          <Minimize2 v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Canvas Container -->
    <div
      ref="canvasContainer"
      class="flex-1 relative overflow-hidden"
      :key="canvasRerenderKey"
    >
      <v-stage
        ref="stageRef"
        :config="stageConfig"
        @click="handleStageClick"
        @wheel="handleWheel"
        @mousedown="handleStageMouseDown"
        @mousemove="handleStageMouseMove"
        @mouseup="handleStageMouseUp"
        @touchstart="handleStageMouseDown"
        @touchmove="handleStageMouseMove"
        @touchend="handleStageMouseUp"
      >
        <v-layer ref="layerRef">
          <!-- Background Image -->
          <v-image
            v-if="backgroundImage"
            :config="{
              image: backgroundImage,
              x: backgroundX,
              y: backgroundY,
              width: backgroundWidth,
              height: backgroundHeight,
              opacity: 0.8,
              listening: false,
            }"
          />

          <!-- Drawing Lines -->
          <v-line
            v-for="line in drawingLines"
            :key="line.id"
            :config="{
              points: line.points,
              stroke: line.stroke,
              strokeWidth: line.strokeWidth,
              lineCap: 'round',
              lineJoin: 'round',
            }"
          />

          <!-- Current Drawing Line -->
          <v-line
            v-if="currentLine"
            :config="{
              points: currentLine.points,
              stroke: currentLine.stroke,
              strokeWidth: currentLine.strokeWidth,
              lineCap: 'round',
              lineJoin: 'round',
            }"
          />

          <!-- Text Objects -->
          <v-text
            v-for="textObj in textObjects"
            :key="textObj.id"
            :config="{
              ...textObj,
              id: textObj.id,
              name: textObj.id,
              draggable: activeTool === 'select',
            }"
            @click="handleTextClick(textObj)"
            @dblclick="editText(textObj)"
            @dragend="handleDragEnd(textObj, $event)"
            @transformend="handleTransformEnd(textObj, $event)"
          />

          <!-- Image Objects -->
          <v-image
            v-for="imageObj in imageObjects"
            :key="imageObj.id"
            :config="{
              ...imageObj,
              id: imageObj.id,
              name: imageObj.id,
              draggable: activeTool === 'select',
            }"
            @click="handleImageClick(imageObj)"
            @dragend="handleDragEnd(imageObj, $event)"
            @transformend="handleTransformEnd(imageObj, $event)"
          />

          <!-- Transformer for selected objects -->
          <v-transformer
            v-if="selectedObject && activeTool === 'select'"
            ref="transformerRef"
            :config="transformerConfig"
          />
        </v-layer>
      </v-stage>

      <!-- Text editor textarea -->
      <textarea
        v-if="isEditingText"
        ref="textEditorRef"
        v-model="currentTextEdit.text"
        :style="textEditorStyle"
        class="absolute z-20 p-1 resize-none focus:outline-none"
        @blur="finishTextEdit"
        @keydown.enter.prevent="finishTextEdit"
        @input="updateTextareaSize"
      ></textarea>
    </div>

    <!-- Image Input Modal -->
    <CanvasModal
      :open="showImageModal"
      title="Add Image"
      max-width="max-w-md"
      @close="closeImageModal"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            v-model="imageUrlInput"
            ref="imageUrlInputRef"
            type="url"
            class="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
            @keydown.enter="addImageFromUrl"
            @keydown.escape="closeImageModal"
          />
        </div>

        <!-- Image Preview -->
        <div v-if="imagePreview" class="border rounded-lg p-2">
          <img
            :src="imagePreview"
            alt="Preview"
            class="max-w-full h-32 object-contain mx-auto"
          />
        </div>

        <!-- Error Message -->
        <div v-if="imageError" class="text-red-600 text-sm">
          {{ imageError }}
        </div>
      </div>

      <template #footer>
        <button
          @click="closeImageModal"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          @click="addImageFromUrl"
          :disabled="!imageUrlInput.trim() || !!imageError"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Image
        </button>
      </template>
    </CanvasModal>

    <!-- Fullscreen Overlay -->
    <div v-if="isFullscreen" class="fixed inset-0 bg-white z-40 flex flex-col">
      <!-- Fullscreen Toolbar -->
      <div class="bg-white border-b p-3 flex items-center gap-4 z-50">
        <!-- Same toolbar content as above -->
        <div class="flex items-center gap-2">
          <button
            v-for="tool in tools"
            :key="tool.id"
            @click="setActiveTool(tool.id)"
            :class="[
              'p-2 rounded hover:bg-gray-100 transition-colors',
              activeTool === tool.id
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600',
            ]"
            :title="tool.name"
          >
            <component :is="tool.icon" class="w-5 h-5" />
          </button>
        </div>

        <div class="w-px h-6 bg-gray-300"></div>

        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Color:</label>
          <input
            v-model="currentColor"
            type="color"
            class="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>

        <div v-if="activeTool === 'draw'" class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Size:</label>
          <input
            v-model="brushSize"
            type="range"
            min="1"
            max="20"
            class="w-20"
          />
          <span class="text-sm text-gray-600">{{ brushSize }}px</span>
        </div>

        <div class="w-px h-6 bg-gray-300"></div>

        <button
          @click="clearCanvas"
          class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear
        </button>

        <button
          @click="saveCanvas"
          class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Save
        </button>

        <div class="ml-auto">
          <button
            @click="toggleFullscreen"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Exit Fullscreen"
          >
            <Minimize2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Fullscreen Canvas -->
      <div class="flex-1 relative overflow-hidden bg-gray-100">
        <v-stage
          ref="fullscreenStageRef"
          :config="fullscreenStageConfig"
          @click="handleStageClick"
          @wheel="handleWheel"
          @mousedown="handleStageMouseDown"
          @mousemove="handleStageMouseMove"
          @mouseup="handleStageMouseUp"
          @touchstart="handleStageMouseDown"
          @touchmove="handleStageMouseMove"
          @touchend="handleStageMouseUp"
        >
          <v-layer>
            <!-- Background Image -->
            <v-image
              v-if="backgroundImage"
              :config="{
                image: backgroundImage,
                x: backgroundX,
                y: backgroundY,
                width: backgroundWidth,
                height: backgroundHeight,
                opacity: 0.8,
                listening: false,
              }"
            />

            <!-- All the same objects as regular canvas -->
            <v-line
              v-for="line in drawingLines"
              :key="line.id"
              :config="{
                points: line.points,
                stroke: line.stroke,
                strokeWidth: line.strokeWidth,
                lineCap: 'round',
                lineJoin: 'round',
              }"
            />

            <v-line
              v-if="currentLine"
              :config="{
                points: currentLine.points,
                stroke: currentLine.stroke,
                strokeWidth: currentLine.strokeWidth,
                lineCap: 'round',
                lineJoin: 'round',
              }"
            />

            <v-text
              v-for="textObj in textObjects"
              :key="textObj.id"
              :config="{
                ...textObj,
                id: textObj.id,
                name: textObj.id,
                draggable: activeTool === 'select',
              }"
              @click="handleTextClick(textObj)"
              @dblclick="editText(textObj)"
              @dragend="handleDragEnd(textObj, $event)"
              @transformend="handleTransformEnd(textObj, $event)"
            />

            <v-image
              v-for="imageObj in imageObjects"
              :key="imageObj.id"
              :config="{
                ...imageObj,
                id: imageObj.id,
                name: imageObj.id,
                draggable: activeTool === 'select',
              }"
              @click="handleImageClick(imageObj)"
              @dragend="handleDragEnd(imageObj, $event)"
              @transformend="handleTransformEnd(imageObj, $event)"
            />

            <v-transformer
              v-if="selectedObject && activeTool === 'select'"
              ref="fullscreenTransformerRef"
              :config="transformerConfig"
            />
          </v-layer>
        </v-stage>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from "vue";
import {
  MousePointer,
  Type,
  ImageIcon,
  PenTool,
  Hand,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
} from "lucide-vue-next";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage } from "konva/lib/Stage";
import type { Shape } from "konva/lib/Shape";
import type { Transformer } from "konva/lib/shapes/Transformer";
import CanvasModal from "./CanvasModal.vue";
import empathyMappingSvg from "@/assets/F1L1 Empathy mapping FLAT.svg";

// Use plain objects with only Konva's built-in fields for all shapes
interface BoundBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextObject {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  draggable: boolean;
  width: number;
  height: number;
  padding?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface ImageObject {
  id: string;
  x: number;
  y: number;
  src: string;
  image?: HTMLImageElement;
  width?: number;
  height?: number;
  draggable?: boolean;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface LineObject {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  lineCap: "round" | "butt" | "square";
  lineJoin: "round" | "bevel" | "miter";
  draggable: boolean;
}

// Refs
const canvasContainer = ref<HTMLDivElement>();
const stageRef = ref();
const fullscreenStageRef = ref();
const layerRef = ref();
const transformerRef = ref();
const fullscreenTransformerRef = ref();
const textEditorRef = ref<HTMLTextAreaElement | null>(null);
const imageUrlInputRef = ref<HTMLInputElement>();

// Use ResizeObserver for robust container size updates
let resizeObserver: ResizeObserver | null = null;

// Key to force rerender of canvas container
const canvasRerenderKey = ref(0);

// Canvas state
const stageWidth = ref(800);
const stageHeight = ref(600);
const isFullscreen = ref(false);

// Background
const backgroundImage = ref<HTMLImageElement>();
const svgWidth = 1650.4;
const svgHeight = 580.74;
const backgroundX = ref(0);
const backgroundY = ref(0);
const backgroundWidth = ref(0);
const backgroundHeight = ref(0);

// History
const history = ref<any[]>([]);
const historyStep = ref(-1);

// Tools
const tools = [
  { id: "select", name: "Select", icon: MousePointer },
  { id: "pan", name: "Pan", icon: Hand },
  { id: "text", name: "Add Text", icon: Type },
  { id: "image", name: "Add Image", icon: ImageIcon },
  { id: "draw", name: "Draw", icon: PenTool },
];

const actionTools = [
  {
    id: "undo",
    name: "Undo",
    icon: Undo2,
    action: handleUndo,
    disabled: computed(() => historyStep.value <= 0),
  },
  {
    id: "redo",
    name: "Redo",
    icon: Redo2,
    action: handleRedo,
    disabled: computed(() => historyStep.value >= history.value.length - 1),
  },
];

const activeTool = ref("select");
const currentColor = ref("#000000");
const brushSize = ref(3);

// Canvas objects: store as arrays of Konva config objects
const textObjects = ref<TextObject[]>([]); // v-text config objects
const imageObjects = ref<ImageObject[]>([]); // v-image config objects
const drawingLines = ref<LineObject[]>([]); // v-line config objects
const selectedObject = ref<any | null>(null);

// Drawing state
const isDrawing = ref(false);
const currentLine = ref<any | null>(null);

// Text editor state
const isEditingText = ref(false);
const currentTextEdit = ref<any>({
  id: null,
  text: "",
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fontSize: 18,
  fontFamily: "Arial",
  fill: "#000000",
});

// Image input modal
const showImageModal = ref(false);
const imageUrlInput = ref("");
const imagePreview = ref("");
const imageError = ref("");
const pendingImagePosition = ref({ x: 0, y: 0 });

// Computed properties
const stageConfig = computed(() => ({
  width: stageWidth.value,
  height: stageHeight.value,
  draggable: activeTool.value === "pan",
}));

const fullscreenStageConfig = computed(() => ({
  width: window.innerWidth,
  height: window.innerHeight - 60, // Account for toolbar
  draggable: activeTool.value === "pan",
}));

const transformerConfig = computed(() => ({
  boundBoxFunc: (oldBox: BoundBox, newBox: BoundBox) => {
    // Limit resize to minimum size
    if (newBox.width < 5 || newBox.height < 5) {
      return oldBox;
    }
    return newBox;
  },
}));

const textEditorStyle = computed(() => {
  if (!isEditingText.value) return { display: "none" };
  const stage = getStage();
  if (!stage) return { display: "none" };

  const scale = stage.scaleX();
  const position = {
    x: stage.x() + currentTextEdit.value.x * scale,
    y: stage.y() + currentTextEdit.value.y * scale,
  };

  return {
    display: "block",
    position: "absolute" as "absolute",
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${currentTextEdit.value.width * scale}px`,
    height: `${currentTextEdit.value.height * scale}px`,
    fontSize: `${currentTextEdit.value.fontSize * scale}px`,
    fontFamily: currentTextEdit.value.fontFamily,
    color: currentTextEdit.value.fill,
    lineHeight: 1.2,
  };
});

// Watch for image URL changes to show preview
watch(imageUrlInput, (newUrl) => {
  if (!newUrl.trim()) {
    imagePreview.value = "";
    imageError.value = "";
    return;
  }

  try {
    new URL(newUrl);
    imagePreview.value = newUrl;
    imageError.value = "";
  } catch {
    imagePreview.value = "";
    imageError.value = "Please enter a valid URL";
  }
});

// Utility functions
const getStage = () => {
  return isFullscreen.value
    ? fullscreenStageRef.value?.getNode()
    : stageRef.value?.getNode();
};

const getTransformer = () => {
  return isFullscreen.value
    ? fullscreenTransformerRef.value?.getNode()
    : transformerRef.value?.getNode();
};

const getPointerPosition = () => {
  const stage = getStage();
  return stage?.getPointerPosition();
};

const isClickOnEmpty = (e: any) => {
  const stage = getStage();
  return e.target === stage || e.target === e.target.getStage();
};

// Initialize canvas
const initializeCanvas = () => {
  if (!canvasContainer.value) return;

  const containerWidth = isFullscreen.value
    ? window.innerWidth
    : canvasContainer.value.clientWidth;
  const containerHeight = isFullscreen.value
    ? window.innerHeight - 60
    : canvasContainer.value.clientHeight;

  stageWidth.value = containerWidth;
  stageHeight.value = containerHeight;

  // Calculate background positioning
  const scaleX = containerWidth / svgWidth;
  const scaleY = containerHeight / svgHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9;

  backgroundWidth.value = svgWidth * scale;
  backgroundHeight.value = svgHeight * scale;
  backgroundX.value = (containerWidth - backgroundWidth.value) / 2;
  backgroundY.value = (containerHeight - backgroundHeight.value) / 2;
};

// Setup ResizeObserver for canvasContainer
const setupResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (canvasContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      initializeCanvas();
    });
    resizeObserver.observe(canvasContainer.value);
  }
};

// Watch for fullscreen toggle to re-initialize canvas size
watch(isFullscreen, async (val) => {
  await nextTick();
  setupResizeObserver();
  initializeCanvas();
});

const loadBackgroundImage = () => {
  const img = new Image();
  img.onload = () => {
    backgroundImage.value = img;
    initializeCanvas();
  };
  img.src = empathyMappingSvg;
};

// Object management

const selectObject = (obj: any) => {
  selectedObject.value = obj;
  nextTick(() => {
    const transformer = getTransformer();
    const stage = getStage();
    if (transformer && stage) {
      const node = stage.findOne(`#${obj.id}`);
      if (node) {
        transformer.nodes([node]);
        transformer.getLayer()?.batchDraw();
      }
    }
  });
};

const deselectObject = () => {
  selectedObject.value = null;
  const transformer = getTransformer();
  if (transformer) {
    transformer.nodes([]);
    transformer.getLayer()?.batchDraw();
  }
};

const updateObjectPosition = (obj: any, e: any) => {
  obj.x = e.target.x();
  obj.y = e.target.y();
};

const handleDragEnd = (obj: any, e: KonvaEventObject<DragEvent>) => {
  updateObjectPosition(obj, e);
  saveState();
};

const handleTransformEnd = (obj: any, e: KonvaEventObject<Event>) => {
  const node = e.target;
  obj.x = node.x();
  obj.y = node.y();
  obj.rotation = node.rotation();
  obj.scaleX = node.scaleX();
  obj.scaleY = node.scaleY();
  saveState();
};

// Tool-specific click handlers

const handleTextClick = (textObj: TextObject) => {
  if (activeTool.value === "select") {
    selectObject(textObj);
  } else if (activeTool.value === "text") {
    editText(textObj);
  }
};

const handleImageClick = (imageObj: any) => {
  if (activeTool.value === "select") {
    selectObject(imageObj);
  }
};

// Stage event handlers
const handleStageClick = (e: any) => {
  const pos = getPointerPosition();
  if (!pos) return;

  if (isClickOnEmpty(e)) {
    switch (activeTool.value) {
      case "draw":
        // Drawing is handled in mousedown
        break;

      case "select":
        deselectObject();
        break;

      case "text":
        // Create new text object at click position
        createNewText(pos.x, pos.y);
        break;

      // Text and image tools now open modals immediately when selected
      // No canvas click needed
    }
  }
};

const handleWheel = (e: any) => {
  e.evt.preventDefault();

  const stage = getStage();
  if (!stage) return;

  const scaleBy = 1.05;
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  // Limit zoom
  if (newScale < 0.1 || newScale > 5) return;

  stage.scale({ x: newScale, y: newScale });

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };

  stage.position(newPos);
};

// Drawing functions

const handleStageMouseDown = (e: any) => {
  if (activeTool.value !== "draw") return;
  const pos = getPointerPosition();
  if (!pos) return;
  isDrawing.value = true;
  currentLine.value = {
    id: `line_${Date.now()}`,
    points: [pos.x, pos.y],
    stroke: currentColor.value,
    strokeWidth: brushSize.value,
    lineCap: "round",
    lineJoin: "round",
    draggable: false,
  };
};

const handleStageMouseMove = (e: any) => {
  if (!isDrawing.value || !currentLine.value || activeTool.value !== "draw")
    return;
  const pos = getPointerPosition();
  if (!pos) return;
  currentLine.value.points = currentLine.value.points.concat([pos.x, pos.y]);
};

const handleStageMouseUp = () => {
  if (isDrawing.value && currentLine.value) {
    drawingLines.value.push({ ...currentLine.value });
    currentLine.value = null;
    saveState();
  }
  isDrawing.value = false;
};

// Text functions
const createNewText = (x: number, y: number) => {
  finishTextEdit(); // Finish any ongoing edit

  const id = `text_${Date.now()}`;
  const newText: TextObject = {
    id,
    x,
    y,
    text: "Type something...",
    fontSize: 18,
    fontFamily: "Arial",
    fill: currentColor.value,
    draggable: true,
    width: 150,
    height: 24,
    padding: 4,
  };
  textObjects.value.push(newText);
  editText(newText);
  saveState();
};

const editText = (textObj: TextObject) => {
  if (activeTool.value !== "text" && activeTool.value !== "select") return;

  // Find the text object in our array to make sure we have the reactive version
  const objectInArray = textObjects.value.find((t) => t.id === textObj.id);
  if (!objectInArray) return;

  // Hide the Konva text object while editing
  const originalText = objectInArray.text;
  objectInArray.text = "";

  isEditingText.value = true;
  currentTextEdit.value = {
    ...objectInArray,
    text: originalText,
  };

  nextTick(() => {
    if (textEditorRef.value) {
      textEditorRef.value.focus();
      updateTextareaSize();
    }
  });
};

const finishTextEdit = () => {
  if (!isEditingText.value) return;

  const editedObj = textObjects.value.find(
    (t) => t.id === currentTextEdit.value.id
  );

  if (editedObj) {
    if (currentTextEdit.value.text.trim() === "") {
      // If text is empty, remove the object
      const index = textObjects.value.findIndex(
        (t) => t.id === currentTextEdit.value.id
      );
      if (index > -1) {
        textObjects.value.splice(index, 1);
      }
    } else {
      // Update the konva object
      editedObj.text = currentTextEdit.value.text;
      editedObj.width = currentTextEdit.value.width;
      editedObj.height = currentTextEdit.value.height;
      editedObj.fill = currentColor.value;
    }
  }

  isEditingText.value = false;
  currentTextEdit.value = { id: null, text: "" };
  saveState();
};

const updateTextareaSize = () => {
  const textarea = textEditorRef.value;
  if (!textarea) return;

  const stage = getStage();
  if (!stage) return;
  const scale = stage.scaleX();

  // Temporarily reset height to auto to get the new scroll height
  textarea.style.height = "auto";
  const newHeight = textarea.scrollHeight;

  // also calculate width
  textarea.style.width = "auto";
  textarea.style.width = `${textarea.scrollWidth}px`;
  const newWidth = textarea.scrollWidth;

  currentTextEdit.value.width = newWidth / scale;
  currentTextEdit.value.height = newHeight / scale;
};

// Image functions
const openImageModal = () => {
  // Set position to center of canvas
  const centerX = stageWidth.value / 2;
  const centerY = stageHeight.value / 2;
  pendingImagePosition.value = { x: centerX, y: centerY };

  showImageModal.value = true;
  nextTick(() => imageUrlInputRef.value?.focus());
};

const addImageFromUrl = () => {
  if (!imageUrlInput.value.trim() || imageError.value) return;
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const maxSize = 200;
    const aspectRatio = img.width / img.height;
    let width = Math.min(img.width, maxSize);
    let height = width / aspectRatio;
    if (height > maxSize) {
      height = maxSize;
      width = height * aspectRatio;
    }
    // Use only Konva image fields
    const newImage: ImageObject = {
      id: `image_${Date.now()}`,
      x: pendingImagePosition.value.x - width / 2,
      y: pendingImagePosition.value.y - height / 2,
      image: img,
      src: img.src,
      width,
      height,
      draggable: true,
    };
    imageObjects.value.push(newImage);
    closeImageModal();
    saveState();
  };
  img.onerror = () => {
    imageError.value = "Failed to load image. Please check the URL.";
  };
  img.src = imageUrlInput.value;
};

const closeImageModal = () => {
  showImageModal.value = false;
  imageUrlInput.value = "";
  imagePreview.value = "";
  imageError.value = "";
};

// Tool functions
const setActiveTool = (toolId: string) => {
  activeTool.value = toolId;
  deselectObject();
  finishTextEdit();

  // Open modals immediately for image tool
  if (toolId === "image") {
    openImageModal();
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  nextTick(() => {
    initializeCanvas();
  });
};

const clearCanvas = () => {
  if (confirm("Are you sure you want to clear the canvas?")) {
    textObjects.value = [];
    imageObjects.value = [];
    drawingLines.value = [];
    deselectObject();
    saveState();
  }
};

const saveCanvas = () => {
  const stage = getStage();
  if (!stage) return;

  const dataURL = stage.toDataURL({ pixelRatio: 2 });
  const link = document.createElement("a");
  link.download = "empathy-map.png";
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// History functions
function saveState() {
  const state = {
    texts: JSON.parse(JSON.stringify(textObjects.value)),
    images: JSON.parse(
      JSON.stringify(
        imageObjects.value.map((img) => ({ ...img, image: undefined }))
      )
    ),
    lines: JSON.parse(JSON.stringify(drawingLines.value)),
  };

  // remove future states
  history.value = history.value.slice(0, historyStep.value + 1);
  history.value.push(state);
  historyStep.value += 1;

  // Save to local storage
  localStorage.setItem("canvasState", JSON.stringify(state));
}

function restoreState(fromHistory = true) {
  let stateToRestore;
  if (fromHistory) {
    stateToRestore = history.value[historyStep.value];
  } else {
    const savedState = localStorage.getItem("canvasState");
    if (savedState) {
      stateToRestore = JSON.parse(savedState);
    }
  }

  if (!stateToRestore) return;

  textObjects.value = stateToRestore.texts;
  drawingLines.value = stateToRestore.lines;

  // For images, we need to recreate the Image objects
  imageObjects.value = stateToRestore.images.map((imgConfig: ImageObject) => {
    const img = new Image();
    img.src = imgConfig.src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const existing = imageObjects.value.find((i) => i.id === imgConfig.id);
      if (existing) {
        existing.image = img;
        // Redraw layer after image loads
        layerRef.value?.getNode().batchDraw();
        fullscreenStageRef.value?.getNode().findOne("Layer").batchDraw();
      }
    };
    return { ...imgConfig, image: img };
  });
  deselectObject();
}

function handleUndo() {
  if (historyStep.value > 0) {
    historyStep.value -= 1;
    restoreState();
  }
}

function handleRedo() {
  if (historyStep.value < history.value.length - 1) {
    historyStep.value += 1;
    restoreState();
  }
}

// Load from local storage on mount
function loadFromLocalStorage() {
  const savedState = localStorage.getItem("canvasState");
  if (savedState) {
    const state = JSON.parse(savedState);
    history.value = [state];
    historyStep.value = 0;
    restoreState(true);
  } else {
    // If no saved state, save the initial empty state
    saveState();
  }
}

// Initialize
onMounted(() => {
  loadBackgroundImage();

  // Handle window resize
  const handleResize = () => {
    initializeCanvas();
  };

  window.addEventListener("resize", handleResize);

  loadFromLocalStorage();

  // Setup ResizeObserver for initial mount
  nextTick(() => {
    setupResizeObserver();
    initializeCanvas();
  });

  return () => {
    window.removeEventListener("resize", handleResize);
    if (resizeObserver) resizeObserver.disconnect();
  };
});
</script>

<style scoped>
/* Animation classes for smooth modal transitions */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

.animate-in {
  animation: fadeIn 200ms ease-out, zoomIn 200ms ease-out;
}
</style>
