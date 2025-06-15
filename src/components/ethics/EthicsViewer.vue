<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Completed Ethics Reviews</h3>
      <Button @click="loadEthicsData" variant="outline" size="sm">
        <RotateCcw class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>

    <div v-if="ethicsReviews.length === 0" class="text-center py-8 text-gray-500">
      <Shield class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>No completed ethics reviews found</p>
      <p class="text-sm">Complete some ethics reviews to see them here</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="review in ethicsReviews" 
        :key="review.key"
        class="border rounded-lg p-4 bg-white shadow-sm"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="font-medium text-gray-900">{{ review.data.exerciseName }}</h4>
            <div class="flex items-center gap-2 mt-1">
              <span 
                class="text-xs px-2 py-1 rounded font-medium"
                :class="review.data.timing === 'before' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
              >
                {{ review.data.timing === 'before' ? 'Pre-Exercise' : 'Post-Exercise' }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(review.data.completedAt) }}
              </span>
            </div>
          </div>
          <Button 
            @click="toggleExpanded(review.key)"
            variant="ghost" 
            size="sm"
          >
            <ChevronDown 
              class="w-4 h-4 transition-transform"
              :class="expandedReviews.has(review.key) ? 'rotate-180' : ''"
            />
          </Button>
        </div>

        <div v-if="expandedReviews.has(review.key)" class="space-y-4">
          <div class="border-t pt-4">
            <h5 class="font-medium text-gray-700 mb-3">Ethics Responses:</h5>
            <div class="space-y-3">
              <div 
                v-for="(response, questionId) in review.data.responses" 
                :key="questionId"
                class="bg-gray-50 rounded p-3"
              >
                <div class="font-medium text-sm text-gray-700 mb-2">
                  Question {{ extractQuestionNumber(questionId) }}
                </div>
                <div class="text-sm text-gray-600 whitespace-pre-wrap">
                  {{ response }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t">
            <Button 
              @click="exportReview(review)"
              variant="outline" 
              size="sm"
            >
              <Download class="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              @click="deleteReview(review.key)"
              variant="outline" 
              size="sm"
              class="text-red-600 hover:text-red-700"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ChevronDown, 
  RotateCcw, 
  Download, 
  Trash2 
} from 'lucide-vue-next';

interface EthicsReview {
  key: string;
  data: {
    exerciseName: string;
    timing: 'before' | 'after';
    responses: Record<string, any>;
    completedAt: string;
  };
}

const ethicsReviews = ref<EthicsReview[]>([]);
const expandedReviews = ref(new Set<string>());

const loadEthicsData = () => {
  const reviews: EthicsReview[] = [];
  
  // Load from localStorage (both test data and real ethics data)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('ethics-test-') || key.includes('-before') || key.includes('-after'))) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          reviews.push({ key, data: parsed });
        }
      } catch (error) {
        console.warn('Failed to parse ethics data for key:', key);
      }
    }
  }

  // Sort by completion date (newest first)
  reviews.sort((a, b) => 
    new Date(b.data.completedAt).getTime() - new Date(a.data.completedAt).getTime()
  );

  ethicsReviews.value = reviews;
};

const toggleExpanded = (key: string) => {
  if (expandedReviews.value.has(key)) {
    expandedReviews.value.delete(key);
  } else {
    expandedReviews.value.add(key);
  }
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

const extractQuestionNumber = (questionId: string): string => {
  const match = questionId.match(/(\d+)$/);
  return match ? match[1] : '?';
};

const exportReview = (review: EthicsReview) => {
  const exportData = {
    exerciseName: review.data.exerciseName,
    timing: review.data.timing,
    responses: review.data.responses,
    completedAt: review.data.completedAt,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ethics-review-${review.data.exerciseName}-${review.data.timing}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const deleteReview = (key: string) => {
  if (confirm('Are you sure you want to delete this ethics review?')) {
    localStorage.removeItem(key);
    loadEthicsData();
  }
};

onMounted(() => {
  loadEthicsData();
});
</script> 